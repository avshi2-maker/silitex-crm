# SILITEX CRM — ATLAS (read first every session) · v0.4.1 · 09/10/2026

Hebrew RTL CRM for distributing Silitex S.r.l. products in Israel. Next.js 15 / React 19 / Tailwind 3 / Supabase (optional) / Claude API. Repo `avshi2-maker/silitex-crm`, folder `C:\silitex-crm`, Vercel project `silitex-crm`.

## Rules of the build
- Many small files (≤ ~150 lines). One concern per file. Never grow a page — extract a component.
- Every AI output = `AiPanel` → carries `TokenMeter` + `ExportBar` automatically. Never call `/api/ai` from elsewhere.
- Dates on screen via `fmtDate` (dd/mm/yyyy). Never raw ISO.
- i18n: write UI strings in Hebrew wrapped in `tr("…")` (`const { t: tr } = useLang()`), add the English line to `src/i18n/en.ts`. Use logical CSS (`text-start`, `ms-auto`, `ps-2`) so LTR works. AI calls carry `lang` → Claude answers in English when EN is selected.
- In-file stamp header `// <file> (<path>) · updated DD.MM.YYYY HH:MM (Asia/Jerusalem)` on every changed file.
- Version stamp: bump `src/config/app.ts` (APP_VERSION / APP_DATE) on every release — footer shows it.

## "Where do I change X?"
| Want to change… | File |
|---|---|
| Add / rename an industry (filters, campaign, lead matching) | `src/config/industries.ts` |
| Pipeline stages, order, closed stages | `src/config/stages.ts` |
| Daily task wording per stage, weekly cadence | `src/config/cadence.ts` |
| Promo channels + their writing rules | `src/config/channels.ts` |
| Version, owner name/phone/signature | `src/config/app.ts` |
| Claude persona / tone | `src/prompts/system.ts` |
| Lead pitch wording | `src/prompts/pitch.ts` |
| Campaign wording | `src/prompts/campaign.ts` |
| RAG answer wording / citation rule | `src/prompts/rag.ts` |
| Model + $/token prices | `src/lib/pricing.ts` |
| Product catalog / offsets / leads seed | `src/data/*.json` (originals in `public/assets/`) |
| Product ↔ industry classification | `industriesOf()` in `src/lib/data.ts` |
| Retrieval algorithm (BM25 → pgvector later) | `src/lib/rag.ts` |
| PDF/TXT extraction + chunking | `src/app/api/rag/extract/route.ts` |
| Export buttons (print/outlook/gmail/whatsapp/save) | `src/components/ExportBar.tsx` |
| Token/cost meter UI | `src/components/TokenMeter.tsx` |
| Sidebar menu items | `src/components/Nav.tsx` |
| Shared UI atoms (Card, Badge, Stat, button classes) | `src/components/ui.tsx` |
| English translations (HE source string → EN) | `src/i18n/en.ts`; provider/switch `src/i18n/index.tsx`, `components/LangSwitch.tsx` |
| DB tables | `supabase/schema.sql` |
| Offset Sniper matching rules | `src/lib/sniper.ts` (prompt: `src/prompts/sniper.ts`) |
| Daily brief wording / which 5 calls | `src/prompts/brief.ts`; pipeline `src/lib/brief.ts` |
| WhatsApp provider (Twilio / webhook / wa.me fallback) | `src/lib/whatsapp.ts` |
| Cron schedules | `vercel.json` (daily-brief 04:00 UTC = 07:00 IL; crawl Sun 01:30 UTC) |
| silitex.it categories to crawl, limits | `src/config/crawl.ts`; parser `src/lib/crawl.ts` |
| Server-side data for bots (Supabase service role or seed) | `src/lib/server-data.ts` |
| Lead action plan card (phase / next action / SKU) | `src/components/PlanCard.tsx` (data: `plan_*` fields in leads.json) |
| Priority product families on dashboard | `src/components/PrioritiesCard.tsx` (data: `src/data/priorities.json`) |

## File registry
```
src/config/      app.ts · industries.ts · stages.ts · cadence.ts · channels.ts · crawl.ts
src/prompts/     system.ts · pitch.ts · campaign.ts · rag.ts · sniper.ts · brief.ts
src/lib/         types.ts · format.ts · pricing.ts · data.ts · supabase.ts · rag.ts · sniper.ts · [server] ai.ts · brief.ts · whatsapp.ts · crawl.ts · server-data.ts
src/lib/store/   state.ts (persist) · cadence.ts (pure scheduler) · useStore.ts (hook) · index.ts
src/components/  Nav · ui · ExportBar · TokenMeter · AiPanel · PlanCard · PrioritiesCard · CrawlPanel
src/app/         page (dashboard) · products · offsets · leads · leads/[id] · pipeline · schedule · campaign · kb · sniper · brief
src/app/api/     ai · rag/extract · rag/crawl · brief · cron/daily-brief · cron/crawl
src/data/        products.json (45) · offsets.json (37×25, from full_offset…-v5.csv; Dow Corning/DOWSIL/XIAMETER names) · food_grade.json (9) · leads.json (19, with plan_* from action-plan CSV) · priorities.json (5)
supabase/        schema.sql
```

## Data flow
Bundled JSON (read-only catalog) → `lib/data.ts`.  
Mutable state (leads/tasks/activities/KB/spend) → `store/state.ts` → localStorage + Supabase write-through (`sync()`), hook `useStore()`.  
AI: page builds `{context, prompt}` from `src/prompts/*` → `AiPanel` → `POST /api/ai` → `lib/ai.ts` (`ask()`; demo mode without key) → usage → `TokenMeter` + `addSpend`.  
RAG: upload → `/api/rag/extract` (unpdf) → chunks in store → `scoreChunks()` → `prompts/rag.ts` → `AiPanel`.

## Env
`ANTHROPIC_API_KEY` (required for real AI) · `ANTHROPIC_MODEL` (optional) · `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional, client) · `SUPABASE_SERVICE_ROLE_KEY` (bots need it to read/write real data) · `CRON_SECRET` (Vercel sets) · `BRIEF_TO_WHATSAPP` · Twilio trio or `WHATSAPP_WEBHOOK_URL`.

## Bots
- **Daily brief** `/brief` (manual) + cron → `runDailyBrief()` → Claude → WhatsApp. Without a provider: text + wa.me link (ExportBar WhatsApp button).
- **Offset Sniper** `/sniper` — pure matching on numbers/tokens vs `dow_corning_offset_benchmark` + offsets matrix; ≥2 token overlap.
- **Crawler** `/kb` panel (per category, into browser/Supabase via store) + weekly cron (needs service role, writes Supabase directly, dedupes by title). silitex.it has no TDS/MSDS PDFs — those stay manual uploads.

## Roadmap candidates
pgvector embeddings · Supabase auth · Cloudinary attachments on lead · quote PDF generator.
