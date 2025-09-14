import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import connectToDatabase from '../../lib/db';
import ChatSession from '../../models/chatSession';

// --- Env checks (fail fast & clear)
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!GOOGLE_API_KEY) console.warn('Missing GOOGLE_API_KEY');
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) console.warn('Missing Supabase envs');

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Central model names
const GENERATION_MODEL = 'gemini-2.0-flash-lite';
const EMBEDDING_MODEL = 'text-embedding-004';

// Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Persona loading from akbar_profile.txt + system instruction builder
const PERSONA_FILE_PATH = path.join(process.cwd(), 'akbar_profile.txt');

let cachedPersona: string | null = null;
function getPersonaText(): string {
  if (cachedPersona) return cachedPersona;
  try {
    const text = fs.readFileSync(PERSONA_FILE_PATH, 'utf8').trim();
    cachedPersona = text;
    return cachedPersona;
  } catch (err) {
    console.warn('Could not load akbar_profile.txt; falling back to default persona. Error:', err);
    // Fallback to the previous inline persona to keep the app functional
    cachedPersona = `
You are Muhamad Akbar Afriansyah (Akbar). Always speak in first person as me. Never claim to be an AI or reveal model details.

About me:
- Indonesian, Muslim, Gen-Z (1998), Aries, INTP; reflective, sometimes overthinks; prefers working independently.
- Work: DSV Solutions Indonesia (Ericsson project, Narogong). SAP/WMS, inventory accuracy, STO, reconciliation.
- Tech: Next.js, Tailwind, Supabase/Postgres, MongoDB, Firebase, Upstash; Python/JS/SQL; builds AI-assisted side projects.
- Learning: data analytics/science (stats → SQL → Python → ML). Finance-minded (budgeting, forecasting, investing).
- Tone: casual, thoughtful, practical; concise by default.

Behavioral rules:
- If asked “who/what are you,” answer as Akbar (my job/context), never as a model.
- Be helpful and direct; give step-by-step only when needed; keep answers compact unless user asks for depth.
`.trim();
    return cachedPersona;
  }
}

// Keep the same function signature to preserve RAG context behavior
function buildSystemInstruction(ragContext?: string) {
  const basePersona = getPersonaText();
  return (
    basePersona +
    (ragContext ? `\n\nHelpful context (RAG, may be partial):\n${ragContext}\n` : '')
  ).trim();
}

// --- Vector search (robust embed call; tolerate SDK shape changes)
async function searchDocuments(query: string, k = 5) {
  try {
    const embedResult: any = await genAI
      .getGenerativeModel({ model: EMBEDDING_MODEL })
      .embedContent({ content: { parts: [{ text: query }] } });

    const vector =
      embedResult?.embedding?.values ??
      embedResult?.embedding ??
      embedResult?.data?.[0]?.embedding ??
      [];

    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: vector,
      match_count: k,
    });

    if (error) throw error;
    return (data || []) as Array<{ id: string; content: string; metadata?: any }>;
  } catch (err) {
    console.error('Vector search error:', err);
    return [];
  }
}

// --- Utility: keep last N messages, map to Gemini roles
function mapHistoryForGemini(messages: any[], maxTurns = 12) {
  const trimmed = messages.slice(-maxTurns);
  return trimmed.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: String(m.content ?? '') }],
  }));
}

// --- GET: load session
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) return NextResponse.json({ messages: [] });

    const session = await ChatSession.findOne({ sessionId });
    if (!session || session.expiresAt < new Date()) return NextResponse.json({ messages: [] });

    return NextResponse.json({ messages: session.messages });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// --- POST: chat w/ persona + RAG + streaming
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const message: string = String(body?.message ?? '').trim();
    const sessionId: string = String(body?.sessionId ?? '').trim();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Load/create session
    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({ sessionId, messages: [] });
    } else if (session.expiresAt < new Date()) {
      session.messages = [];
    }

    // RAG fetch
    const docs = await searchDocuments(message, 5);
    const ragContext = docs.map((d) => d.content).join('\n---\n');

    // Build system instruction w/ persona + current RAG slice
    const systemInstruction = buildSystemInstruction(ragContext);

    // Configure model with systemInstruction
    const model = genAI.getGenerativeModel({
      model: GENERATION_MODEL,
      systemInstruction,
      generationConfig: {
        // Slightly creative but still grounded; adjust to taste
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 400, // concise by default; raise if you need longer replies
        responseMimeType: 'text/plain',
      },
    });

    // Build history (map to Gemini roles)
    const sessionHistory = mapHistoryForGemini(session.messages, 12);

    // Start chat w/ history
    const chat = model.startChat({ history: sessionHistory });

    // Stream response
    const result = await chat.sendMessageStream(message);
    const encoder = new TextEncoder();
    let fullText = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const t = chunk.text();
            fullText += t;
            controller.enqueue(encoder.encode(t));
          }

          // Persist turns + extend expiry (24h)
          session.messages.push({ role: 'user', content: message, timestamp: new Date() });
          session.messages.push({ role: 'assistant', content: fullText, timestamp: new Date() });
          session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
          await session.save();

          controller.close();
        } catch (err) {
          console.error('Stream error:', err);
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
      // text/plain keeps it simple for fetch-based streaming; switch to SSE if you need events
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// --- DELETE: clear chat session
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const sessionId: string = String(body?.sessionId ?? '').trim();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Find and clear session messages
    const session = await ChatSession.findOne({ sessionId });
    if (session) {
      session.messages = [];
      await session.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to clear messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
