-- 17/10/2026 leads: columns the app already uses (sales-plan fields, import, city/geo). Without them Supabase rejects the whole lead row on sync. Safe to re-run.
alter table leads add column if not exists recommended_sku text;
alter table leads add column if not exists competitor_offset text;
alter table leads add column if not exists plan_phase text;
alter table leads add column if not exists plan_next_action text;
alter table leads add column if not exists plan_stage text;
alter table leads add column if not exists plan_target_stage text;
alter table leads add column if not exists rd_focus text;
alter table leads add column if not exists buyer_trigger text;
alter table leads add column if not exists website text;
alter table leads add column if not exists city text;
alter table leads add column if not exists lat numeric;
alter table leads add column if not exists lon numeric;
