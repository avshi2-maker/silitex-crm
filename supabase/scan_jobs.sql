-- scan_jobs.sql (supabase/scan_jobs.sql) · created 22.10.2026 08:30 (Asia/Jerusalem) — SERVER SCAN QUEUE (already applied to silitex-crm on 22/10/2026; kept here for the record)
create table if not exists public.scan_jobs (
  id text primary key, lead_id text not null, name text, website text, industry text,
  status text not null default 'queued', result jsonb, error text,
  cost_usd numeric default 0, input_tokens int default 0, output_tokens int default 0,
  created_at timestamptz not null default now(), started_at timestamptz, finished_at timestamptz
);
create index if not exists scan_jobs_status_idx on public.scan_jobs (status, created_at);
alter table public.scan_jobs enable row level security;
