-- projects.sql (supabase/projects.sql) · created 10.11.2026 12:20 (Asia/Jerusalem) — v1.9.8 📁 Projects
-- One project per RFQ (technical data / sample / price). Ref #SPR-0001 … from a DB sequence (two RFQs at once can never get the same number).
-- One OPEN project per customer — a new RFQ on an open project = new version (v+1). Applied to Supabase 10.11.2026.
create sequence if not exists project_seq;
create table if not exists projects (
  id text primary key default ('SPR-' || lpad(nextval('project_seq')::text, 4, '0')),
  lead_id text not null,
  lead_name text not null default '',
  opened_at timestamptz not null default now(),
  version int not null default 1,
  description text not null default '',
  request text not null default '',
  stage text not null default 'rfq',
  quote_ref text, quote_at date,
  po_sample text, po_sample_at date,
  po_product text, po_product_at date,
  invoice text, invoice_at date,
  team jsonb not null default '[]',      -- [{name, email, org, role: "to" | "cc"}]
  history jsonb not null default '[]',   -- [{v, at, text}]
  source text not null default 'manual', -- auto:whatsapp · auto:mail · auto:form · manual
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists projects_one_open_per_lead on projects (lead_id) where stage not in ('closed', 'lost');
create index if not exists projects_opened on projects (opened_at desc);
alter table projects enable row level security; -- server routes only (service role, behind the PIN gate)
-- 10.11.2026 v1.10.0: Silitex answer read from the Hub mail · files (PO / invoice photos on Cloudinary) · hold (stall alarm paused until a date)
alter table projects add column if not exists files jsonb not null default '[]';     -- [{kind, url, name, at, text}]
alter table projects add column if not exists silitex_answer jsonb;                    -- {grade, price, currency, unit, moq, lead_time, pack, tds, sds, sample, notes}
alter table projects add column if not exists answer_at timestamptz;
alter table projects add column if not exists answer_msg text;                         -- last Silitex mail already read (id)
alter table projects add column if not exists hold_until date;
