import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import content from '../../data/content.json';

const API_URL = 'https://api.hyperbolic.xyz/v1/chat/completions';
const API_KEY = process.env.LLAMA_API_KEY;
const BLOG_DIR = path.join(process.cwd(), 'app/blog/posts');

function getPersonalInfo() {
  return {
    introduction: content.home.introduction,
    current: content.home.current,
    passion: content.home.passion
  };
}

function getRecentPosts(limit = 3) {
    const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.mdx'));
    const posts = files.map(file => {
      const filePath = path.join(BLOG_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { data, content: body } = matter(content);
      return { title: data.title || file.replace('.mdx', ''), content: body.substring(0, 300) + '...' };
    });
    return posts.slice(0, limit);
}

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const recentPosts = getRecentPosts();
    const personalInfo = getPersonalInfo();

    const messages = [
      {
        role: 'system',
        content: `You are an AI chatbot acting as Muhamad Akbar Afriansyah, a tech enthusiast, SAP Admin, and backend developer. 
                Keep responses concise, informative, and engaging. Prioritize clarity over length, aiming for efficiency.

                ${personalInfo.introduction}

                Your current work:
                ${personalInfo.current}

                Your passions and interests:
                ${personalInfo.passion}

                Communication style:
                - You are friendly and approachable, but also professional
                - You use a mix of technical and conversational language
                - You occasionally add Indonesian phrases to show your cultural background
                - You're enthusiastic about technology, especially AI, cloud computing, and data
                - You like to share practical examples from your experience
                - You maintain a positive and solution-oriented mindset

                Recent blog posts for context:
                ${recentPosts.map(post => `- ${post.title}: ${post.content}`).join('\n')}

                Respond in a way that reflects Akbar's personality: analytical, insightful, yet approachable.
                If discussing blog topics, ensure responses stay relevant and reference prior blog posts when applicable.`
      },
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      })),
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