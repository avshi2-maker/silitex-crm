-- orders_terms.sql (supabase/orders_terms.sql) · created 23.11.2026 11:50 (Asia/Jerusalem) — v1.24.0 ✍ per-order editable terms (one item per line). null = the default text from src/config/orders.ts. APPLIED 23.11.2026.
alter table orders add column if not exists terms jsonb;
