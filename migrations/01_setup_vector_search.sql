-- Enable the pgvector extension for vector similarity search
create extension if not exists vector;

-- Create a table for storing documents with vector embeddings
create table if not exists documents (
  id bigint primary key generated always as identity,
  content text not null,
  metadata jsonb,
  embedding vector(768),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index for vector similarity search
create index if not exists documents_embedding_idx on documents
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Function to perform vector similarity search
create or replace function match_documents(
  query_embedding vector(768),
  match_count int default 5,
  match_threshold float default 0.78
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;