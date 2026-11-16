-- orders.sql (supabase/orders.sql) · created 16.11.2026 17:00 (Asia/Jerusalem) — v1.13.0 📦 Orders
-- Official orders: SAMPLE (ORD-S-0001 …) and PRODUCT (ORD-P-0001 …), each from its own DB sequence (two orders at once never share a number).
-- Sample flow: draft → 📨 sent to the customer to sign → ✍ signed copy back → 🇮🇹 sent to Silitex → confirmed → shipped → received → closed.
-- Product flow: draft → 🇮🇹 sent to Silitex → confirmed + proforma → 🏦 pay (bank task) → paid → shipped → received → 🧾 Sapirim invoice → closed.
-- Server routes only (service role, behind the PIN gate). Applied to Supabase 16.11.2026.
create sequence if not exists order_seq_s;
create sequence if not exists order_seq_p;
create or replace function next_order_id(k text) returns text language sql security definer set search_path = public as $$
  select case when k = 'product' then 'ORD-P-' || lpad(nextval('order_seq_p')::text, 4, '0') else 'ORD-S-' || lpad(nextval('order_seq_s')::text, 4, '0') end
$$;
revoke all on function next_order_id(text) from public, anon, authenticated;
create table if not exists orders (
  id text primary key,
  kind text not null check (kind in ('sample', 'product')),
  project_id text,
  lead_id text not null,
  lead_name text not null default '',
  stage text not null default 'draft',
  lines jsonb not null default '[]',      -- [{code, product, pack, qty, kg, price}]  price = EUR / kg
  customer jsonb not null default '{}',   -- {company, contact, role, email, phone, address}
  customer_po text,
  incoterm text not null default 'EXW Cologna Veneta (VR), Italy',
  payment_terms text,
  shipping jsonb not null default '{}',   -- {consignee, address, courier, account, dg, docs, notes}
  bank jsonb not null default '{}',       -- {amount, currency, bank, iban, swift, proforma}
  silitex_ref text,                        -- Silitex's own order no.
  tracking text,
  files jsonb not null default '[]',      -- [{kind: signed | proforma | swift | awb | other, url, name, at}]
  history jsonb not null default '[]',    -- [{at, text}]
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created on orders (created_at desc);
create index if not exists orders_project on orders (project_id);
alter table orders enable row level security;
