-- ai_visibility.sql (supabase/ai_visibility.sql) · 18.10.2026 — AI visibility bot: one row per (engine, question) check. Run once in Supabase → SQL Editor (project silitex-crm).
create table if not exists public.ai_visibility (
  id text primary key,
  at timestamptz not null default now(),
  engine text not null,            -- claude | chatgpt
  qid text not null,
  question text not null,
  lang text,
  sapirim_cited boolean default false,     -- a source URL on sapirim.com
  sapirim_mentioned boolean default false, -- "Sapirim / ספירים / Сапирим" in the answer
  silitex_mentioned boolean default false,
  brands text[] default '{}',              -- competitor brands named in the answer
  sources jsonb default '[]'::jsonb,       -- [{url,title}]
  answer text,
  cost_usd numeric,
  error text
);
create index if not exists ai_visibility_at on public.ai_visibility (at desc);
alter table public.ai_visibility enable row level security; -- server (service role) only
