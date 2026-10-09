# SILITEX CRM — ATLAS (read first every session) · v0.2.0 · 09/10/2026

Hebrew RTL CRM for distributing Silitex S.r.l. products in Israel. Next.js 15 / React 19 / Tailwind 3 / Supabase (optional) / Claude API. Repo `avshi2-maker/silitex-crm`, folder `C:\silitex-crm`, Vercel project `silitex-crm`.

## Rules of the build
- Many small files (≤ ~150 lines). One concern per file. Never grow a page — extract a component.
- Every AI output = `AiPanel` → carries `TokenMeter` + `ExportBar` automatically. Never call `/api/ai` from elsewhere.
- Dates on screen via `fmtDate` (dd/mm/yyyy). Never raw ISO.
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
| DB tables | `supabase/schema.sql` |

## File registry
```
src/config/      app.ts · industries.ts · stages.ts · cadence.ts · channels.ts
src/prompts/     system.ts · pitch.ts · campaign.ts · rag.ts
src/lib/         types.ts · format.ts · pricing.ts · data.ts · supabase.ts · ai.ts (server) · rag.ts
src/lib/store/   state.ts (persist) · cadence.ts (pure scheduler) · useStore.ts (hook) · index.ts
src/components/  Nav · ui · ExportBar · TokenMeter · AiPanel
src/app/         page (dashboard) · products · offsets · leads · leads/[id] · pipeline · schedule · campaign · kb
src/app/api/     ai/route.ts · rag/extract/route.ts
src/data/        products.json (45) · offsets.json (37×24) · food_grade.json (9) · leads.json (18)
supabase/        schema.sql
```

## Data flow
Bundled JSON (read-only catalog) → `lib/data.ts`.  
Mutable state (leads/tasks/activities/KB/spend) → `store/state.ts` → localStorage + Supabase write-through (`sync()`), hook `useStore()`.  
AI: page builds `{context, prompt}` from `src/prompts/*` → `AiPanel` → `POST /api/ai` → `lib/ai.ts` (`ask()`; demo mode without key) → usage → `TokenMeter` + `addSpend`.  
RAG: upload → `/api/rag/extract` (unpdf) → chunks in store → `scoreChunks()` → `prompts/rag.ts` → `AiPanel`.

## Env
`ANTHROPIC_API_KEY` (required for real AI) · `ANTHROPIC_MODEL` (optional) · `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional).

## Roadmap candidates
pgvector embeddings · Supabase auth · WhatsApp Business API send · Cloudinary attachments on lead · weekly digest cron (Vercel cron → `/api/cron/weekly`).
