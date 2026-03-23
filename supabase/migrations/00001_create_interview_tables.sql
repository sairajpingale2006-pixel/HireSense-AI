-- Create interviews table
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  branch text not null check (branch in ('AIML', 'CS', 'IT')),
  resume_text text,
  questions jsonb not null default '[]'::jsonb,
  answers jsonb not null default '[]'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  feedback jsonb not null default '[]'::jsonb,
  emotion_summary text,
  completed boolean default false
);

-- Create index for faster queries
create index if not exists interviews_created_at_idx on public.interviews(created_at desc);

-- Enable RLS
alter table public.interviews enable row level security;

-- Allow anyone to insert and read their own interviews
create policy "Allow public insert" on public.interviews for insert with check (true);
create policy "Allow public read" on public.interviews for select using (true);
create policy "Allow public update" on public.interviews for update using (true);
