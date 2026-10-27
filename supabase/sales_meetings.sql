-- 27/10/2026 Sales meetings & calls (owner only): Pini / customers — physical, phone, Teams, WhatsApp. RLS ON, no policies → server (service role) only. (applied to silitex-crm 27/10/2026)
create table if not exists sales_meetings (
  id text primary key, held_at date not null, kind text not null default 'physical', with_who text not null default '', title text not null default '',
  notes text not null default '', photo_count int not null default 0, summary jsonb not null default '{}'::jsonb, applied jsonb not null default '{}'::jsonb,
  usage jsonb, created_at timestamptz not null default now()
);
create index if not exists sales_meetings_held on sales_meetings (held_at desc);
alter table sales_meetings enable row level security;
