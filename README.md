# Silitex CRM — mockup (v0.1.0 · 09/10/2026)

Hebrew RTL CRM for promoting **Silitex S.r.l. (Italy)** silicone products in Israel as official distributor.

## Modules
| Route | What |
|---|---|
| `/` | Dashboard — KPIs, pipeline by stage, today's tasks, Tier-1 targets |
| `/products` | 45-product catalog, filter by industry / category / ionicity / certification / viscosity / free text (INCI, Dow offsets) |
| `/offsets` | 37-category cross-reference: Silitex ↔ Dow, Wacker, Momentive, Evonik + 20 more; Kosher/FDA food line |
| `/leads`, `/leads/[id]` | 18 seeded Israeli targets; intake form, stage, activity log, AI pitch |
| `/pipeline` | Kanban drag-drop |
| `/schedule` | Cadence engine: daily task per stage + weekly review for every open lead |
| `/campaign` | Industry × channel promo generator (email / WhatsApp / LinkedIn / one-pager) |
| `/kb` | RAG: upload TDS / MSDS / sales specs (PDF/TXT) → retrieval → Claude answers with sources |

Every AI output carries the standing footer: **TokenMeter** (per-call + session cost) and **ExportBar** (Print / Outlook / Gmail / WhatsApp / Save).

## Data assets (bundled, `src/data/`)
`products.json` (45), `offsets.json` (37 × 24 producers), `food_grade.json` (9), `leads.json` (18).

## Run
```
npm install
copy .env.example .env.local   # fill ANTHROPIC_API_KEY; Supabase optional
npm run dev
```
Without keys the app runs in **demo mode**: state in browser storage, AI returns a structured placeholder with simulated usage.

## Supabase
Run `supabase/schema.sql`. State is written through automatically once env vars exist.

## Deploy
Vercel → import repo → add env vars → subdomain `silitex.marble-art.co.il`.
