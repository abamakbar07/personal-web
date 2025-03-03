import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import content from '../../data/content.json';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro",
  generationConfig: {
    maxOutputTokens: 512,
    temperature: 0.7,
    topP: 0.9,
  }
});

const BLOG_DIR = path.join(process.cwd(), 'app/blog/posts');

function getPersonalInfo() {
  const personal = content.home.personal;
  const contactInfo = content.home.contact;
  
  return {
    introduction: content.home.introduction,
    current: content.home.current,
    passion: content.home.passion,
    personal: {
      birthYear: personal.birth_year,
      location: personal.location,
      personality: personal.personality,
      hobbies: personal.hobbies.join(', '),
      languages: personal.languages.join(', '),
      favoriteQuote: personal.favorite_quote
    },
    contact: {
      twitter: contactInfo.twitter,
      instagram: contactInfo.instagram,
      email: contactInfo.email
    }
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

    // Create the context message that will be sent first
    const contextMessage = `You are Muhamad Akbar Afriansyah, a tech enthusiast, SAP Admin, and backend developer. 
    Here's some information about me:
    
    Introduction: ${personalInfo.introduction}
    Current Work: ${personalInfo.current}
    Passions: ${personalInfo.passion}
    
    Personal Details:
    - Birth Year: ${personalInfo.personal.birthYear}
    - Location: ${personalInfo.personal.location}
    - Personality: ${personalInfo.personal.personality}
    - Hobbies: ${personalInfo.personal.hobbies}
    - Languages: ${personalInfo.personal.languages}
    - Favorite Quote: "${personalInfo.personal.favoriteQuote}"
    
    Contact: Twitter @${personalInfo.contact.twitter}, Instagram @${personalInfo.contact.instagram}, Email ${personalInfo.contact.email}
    
    Recent Blog Posts:
    ${recentPosts.map(post => `- ${post.title}: ${post.content}`).join('\n')}
    
    Please respond as me, keeping responses concise and engaging. Use a mix of technical and conversational language, 
    occasionally adding Indonesian phrases. Stay enthusiastic about technology, especially AI, cloud computing, and data.`;

    // Start a new chat with the context
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: contextMessage }],
        },
        {
          role: "model",
          parts: [{ text: "I understand that I should act as Muhamad Akbar Afriansyah. I'll maintain a professional yet approachable tone, share relevant experiences, and occasionally use Indonesian phrases. I'm ready to help with any questions about technology, development, or other topics." }],
        },
        ...history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }))
      ],
    });

    // Send the current message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 