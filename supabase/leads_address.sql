-- 20/10/2026 leads: exact site address for Waze + visit planner. Safe to re-run.
alter table leads add column if not exists address text;
