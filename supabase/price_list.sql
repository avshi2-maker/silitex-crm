-- price_list.sql (supabase/price_list.sql) · created 13.11.2026 13:20 (Asia/Jerusalem) — v1.11.0 💶 Silitex price list
-- One row per product we know something about (quote / INCI / CAS / RDA / TDS / SDS / PO ref). The full list of names comes from the 5 catalogues 2026 (src/lib/pricelist.ts merges).
-- id = product key (upper-case, letters+digits only: "H 160" → H160). Server routes only (service role, behind the PIN gate). Applied to Supabase 13.11.2026.
create table if not exists price_list (
  id text primary key,
  product text not null,
  code text not null default '',
  sector text not null default '',
  inci text not null default '',
  cas text not null default '',
  rda boolean,
  packs jsonb not null default '[]',     -- [{label, kg, eur_kg, incoterm, quoted_at, source, moq_kg}]
  history jsonb not null default '[]',   -- [{at, label, eur_kg, source}] every price change
  tds_url text not null default '',
  sds_url text not null default '',
  po_ref text not null default '',
  countertype text not null default '',
  notes text not null default '',
  updated_at timestamptz not null default now()
);
alter table price_list enable row level security;

-- seed: Eleonora Pravato quote 09/11/2026 (RFQ from Poland), EXW, 25 kg canisters
insert into price_list (id, product, code, sector, packs, history, countertype, notes) values
('H160', 'H 160', 'PO425', 'Detergency', '[{"label":"25 kg canister","kg":25,"eur_kg":5.90,"incoterm":"EXW","quoted_at":"2026-11-09","source":"Eleonora 09/11/2026 — RFQ Poland"}]', '[{"at":"2026-11-09","label":"25 kg canister","eur_kg":5.90,"source":"Eleonora 09/11/2026"}]', 'XIAMETER OFX-8040', 'TDS + MSDS צורפו למייל של Eleonora 09/11/2026. ⚠ קוד במייל PO425, בקטלוג 2026 PO536 — לאמת.'),
('H180', 'H 180', 'PO399', 'Detergency', '[{"label":"25 kg canister","kg":25,"eur_kg":6.20,"incoterm":"EXW","quoted_at":"2026-11-09","source":"Eleonora 09/11/2026 — RFQ Poland"}]', '[{"at":"2026-11-09","label":"25 kg canister","eur_kg":6.20,"source":"Eleonora 09/11/2026"}]', 'XIAMETER OFX-8040 (low cyclics)', 'נוזל סיליקון diamine-functional תעשייתי, תכולת cyclics נמוכה. TDS + MSDS צורפו למייל 09/11/2026.'),
('H380', 'H 380', 'PO356', 'Car care', '[{"label":"25 kg canister","kg":25,"eur_kg":26.57,"incoterm":"EXW","quoted_at":"2026-11-09","source":"Eleonora 09/11/2026 — RFQ Poland"}]', '[{"at":"2026-11-09","label":"25 kg canister","eur_kg":26.57,"source":"Eleonora 09/11/2026"}]', '', 'אמינו-פונקציונלי לטיפוח רכב (polish, wash-and-wax, rinse-off). TDS/MSDS בעדכון אצל Silitex — יישלחו.')
on conflict (id) do nothing;
