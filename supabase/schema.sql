-- schema.sql (supabase/schema.sql) · Silitex CRM · 09/10/2026
-- Run once in Supabase SQL editor. The app mirrors browser state into these tables when NEXT_PUBLIC_SUPABASE_* are set.
create table if not exists leads (
  id text primary key, name text not null, industry text, sub_industry text, product_match text, use_case text,
  volume_tons numeric default 0, value_usd numeric default 0, tier text, department text, contact_role text,
  status text default 'new', stage text default 'prospect',
  contact_name text, contact_phone text, contact_email text, notes text, next_action_at date,
  updated_at timestamptz default now()
);
create table if not exists activities (id text primary key, lead_id text references leads(id) on delete cascade, at timestamptz default now(), kind text, text text);
create table if not exists tasks (id text primary key, lead_id text, lead_name text, title text, due date, cadence text, done boolean default false, kind text);
create table if not exists docs (id text primary key, lead_id text, lead_name text, kind text, title text, sent_at date, via text, status text, amount_eur numeric, valid_until date, body text);
alter table docs enable row level security; create policy "all" on docs for all using (true) with check (true);
alter table leads add column if not exists source text;
alter table leads add column if not exists created_at timestamptz default now();
alter table leads add column if not exists intake jsonb default '{}';
create table if not exists shipments (id text primary key, ref text, lead_id text, lead_name text, consignee text, mode text, lines jsonb default '[]', "values" jsonb default '{}', docs jsonb default '{}', status text, created_at timestamptz default now(), eta date, notes text);
alter table shipments enable row level security; create policy "all" on shipments for all using (true) with check (true);
create table if not exists silitex_contacts (id text primary key, dept text, name text, role text, email text, phone text, mobile text, linkedin text, address text, notes text);
create table if not exists threads (id text primary key, dept text, contact_id text, subject text, topic text, refs jsonb default '{}', due date, owner text, status text, next text, created_at timestamptz default now(), last_at timestamptz, conversation_id text);
create table if not exists hub_messages (id text primary key, thread_id text references threads(id) on delete cascade, at timestamptz, "from" text, "to" text, direction text, body text, source text, external_id text unique);
alter table silitex_contacts enable row level security; create policy "all" on silitex_contacts for all using (true) with check (true);
alter table threads enable row level security; create policy "all" on threads for all using (true) with check (true);
alter table hub_messages enable row level security; create policy "all" on hub_messages for all using (true) with check (true);
create table if not exists hub_tokens (id text primary key, refresh_token text, account text, last_sync timestamptz, last_result text, updated_at timestamptz default now());
alter table hub_tokens enable row level security;
create table if not exists samples (id text primary key, lead_id text, lead_name text, sku text, kg numeric, sent_at date, status text, result text, followup_at date);
alter table samples enable row level security; create policy "all" on samples for all using (true) with check (true);
create table if not exists form_submissions (id bigserial primary key, created_at timestamptz default now(), kind text, company text, name text, email text, phone text, product text, message text, fields jsonb default '{}', lang text);
alter table form_submissions enable row level security; create policy "all" on form_submissions for all using (true) with check (true);
create table if not exists kb_docs (id text primary key, title text, doc_type text, product_ref text, created_at timestamptz default now(), chunks int default 0);
create table if not exists kb_chunks (id text primary key, doc_id text references kb_docs(id) on delete cascade, title text, doc_type text, product_ref text, text text);
create table if not exists ai_usage (id bigserial primary key, at timestamptz default now(), feature text, model text, input_tokens int, output_tokens int, cost_usd numeric);
-- mockup: open RLS (single user). Lock down before multi-user.
alter table leads enable row level security; create policy "all" on leads for all using (true) with check (true);
alter table activities enable row level security; create policy "all" on activities for all using (true) with check (true);
alter table tasks enable row level security; create policy "all" on tasks for all using (true) with check (true);
alter table kb_docs enable row level security; create policy "all" on kb_docs for all using (true) with check (true);
alter table kb_chunks enable row level security; create policy "all" on kb_chunks for all using (true) with check (true);
-- next step: pgvector — alter table kb_chunks add column embedding vector(1024); (Voyage/OpenAI embeddings) and swap lib/rag.ts scoring.
