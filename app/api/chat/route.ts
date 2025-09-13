import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import connectToDatabase from '../../lib/db';
import ChatSession from '../../models/chatSession';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite',
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
  },
});
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

async function searchDocuments(query: string, k = 5) {
  try {
    const embedding = await embeddingModel.embedContent(query);
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding.embedding.values || embedding.embedding,
      match_count: k,
    });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Vector search error:', err);
    return [];
  }
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ messages: [] });
    }
    const session = await ChatSession.findOne({ sessionId });
    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ messages: [] });
    }
    return NextResponse.json({ messages: session.messages });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to load messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { message, sessionId } = await req.json();

    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({ sessionId, messages: [] });
    } else if (session.expiresAt < new Date()) {
      session.messages = [];
    }
    const sessionHistory = session.messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const docs = await searchDocuments(message, 5);
    const context = docs.map((d: any) => d.content).join('\n---\n');

    const chat = model.startChat({
      systemInstruction: `You are a helpful assistant. Use the provided context to answer the user.\n${context}`,
      history: sessionHistory,
    });

    const result = await chat.sendMessageStream(message);
    const encoder = new TextEncoder();
    let fullText = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            controller.enqueue(encoder.encode(chunkText));
          }
          session.messages.push({ role: 'user', content: message, timestamp: new Date() });
          session.messages.push({ role: 'assistant', content: fullText, timestamp: new Date() });
          session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
          await session.save();
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
