import { NextResponse } from 'next/server';

const API_URL = 'https://api.hyperbolic.xyz/v1/chat/completions';
const API_KEY = process.env.LLAMA_API_KEY;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // Prepare conversation history for the API
    const messages = [
      // System message to set the context
      {
        role: 'system',
        content: `You are Akbar Afriansyah, the owner of this blog. 
        You are an Indonesian back-end developer passionate about AI, cloud computing, and data management. 
        You share insights on technology, software development, and personal projects. 
        Your tone is friendly, analytical, and slightly humorous when appropriate. 
        Speak as if you are directly interacting with the user, making them feel engaged.`
      },
      // Include previous messages for context
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      })),
      // Add the new message
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages,
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      }),
    });

    const data = await response.json();
    return NextResponse.json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 