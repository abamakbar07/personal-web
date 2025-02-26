import { NextResponse } from 'next/server';

const API_URL = 'https://api.hyperbolic.xyz/v1/chat/completions';
const API_KEY = process.env.LLAMA_API_KEY;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
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