import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import content from '../app/data/content.json';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const BLOG_DIR = path.join(process.cwd(), 'app/blog/posts');

interface Doc {
  id: string;
  content: string;
  metadata: Record<string, any>;
}

async function embedAndStore(doc: Doc) {
  const result = await embeddingModel.embedContent(doc.content);
  const embedding = result.embedding.values || result.embedding;
  const { error } = await supabase.from('documents').upsert({
    id: doc.id,
    content: doc.content,
    metadata: doc.metadata,
    embedding,
  });
  if (error) {
    console.error('Failed to store', doc.id, error);
  } else {
    console.log('Stored', doc.id);
  }
}

async function loadDocs(): Promise<Doc[]> {
  const docs: Doc[] = [];

  // Blog posts
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));
  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content: body } = matter(raw);
    docs.push({
      id: file.replace('.mdx', ''),
      content: `${data.title || file}\n${body}`,
      metadata: { title: data.title || file, type: 'blog' },
    });
  }

  // Profile data
  const profile = content.home;
  const profileText = `Introduction: ${profile.introduction}\nCurrent: ${profile.current}\nPassion: ${profile.passion}\nBirth Year: ${profile.personal.birth_year}\nLocation: ${profile.personal.location}\nPersonality: ${profile.personal.personality}\nHobbies: ${profile.personal.hobbies.join(', ')}\nLanguages: ${profile.personal.languages.join(', ')}\nQuote: ${profile.personal.favorite_quote}\nContact: Twitter ${profile.contact.twitter}, Instagram ${profile.contact.instagram}, Email ${profile.contact.email}`;
  docs.push({ id: 'profile', content: profileText, metadata: { type: 'profile' } });

  return docs;
}

async function main() {
  const docs = await loadDocs();
  for (const doc of docs) {
    await embedAndStore(doc);
  }
  console.log('Ingestion complete');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
