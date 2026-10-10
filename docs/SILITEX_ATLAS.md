# SILITEX CRM — ATLAS (read first every session) · v0.12.0 · 09/10/2026

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
| Pipeline stages, order, closed stages (prospect → contacted → sample → rfq → quote → negotiation → won/lost) | `src/config/stages.ts` |
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
| Live clock in header | `src/components/Clock.tsx` |
| Shared UI atoms (Card, Badge, Stat, button classes) | `src/components/ui.tsx` |
| English / Italian translations (HE source string → EN / IT) | `src/i18n/en.ts`, `src/i18n/it.ts`; provider/switch `src/i18n/index.tsx`, `components/LangSwitch.tsx`; `?lang=he|en|it` |
| Pitch page copy (title, phases, gets, needs) | `src/config/pitch.ts`; page `src/app/pitch/page.tsx`; parts `components/pitch/*` |
| Israel map outline / pin colors | `src/components/pitch/IsraelMap.tsx` (coords: `city/lat/lon` in leads.json) |
| Demo state for presentations | `src/data/demo.ts` (load: ⚙ on dashboard or `?demo=1`) |
| Sample tracker | `src/components/SampleCard.tsx`; store `addSample/setSampleStatus` |
| Principal report wording | `src/prompts/report.ts`; page `src/app/report/page.tsx` |
| "Ask Silitex" search index (all assets) | `scripts/build-index.mjs` → `src/data/search_index.json` (auto on `npm run build`; manual `npm run index`); search `src/lib/search.ts`; prompt `src/prompts/ask.ts` |
| Brand palette | `tailwind.config.ts` (brand = Silitex magenta, ink = sidebar); logo `public/silitex-logo.png` |
| 50 Q&A content | `src/data/faq.json` (also indexed into Ask Silitex); page `src/app/faq/page.tsx` |
| Public forms (technical / sample / price) | `src/app/(public)/request/page.tsx` → `POST /api/forms` → `lib/forms.ts` (Resend email + Supabase form_submissions) |
| Customer satisfaction survey (public) + criteria | `src/app/(public)/survey/page.tsx`; criteria `src/config/survey.ts`; internal view `src/app/satisfaction/page.tsx`; AI prompt `src/prompts/satisfaction.ts` |
| Public-page header/footer | `src/components/PublicShell.tsx` (sidebar hides itself on /request, /survey in Nav.tsx) |
| Version · commit · build-time stamp under the clock | `src/components/VersionStamp.tsx` (commit via VERCEL_GIT_COMMIT_SHA in next.config.ts) |
| Pitch "Commercial model" block | `src/config/pitch.ts` → `model` |
| Starter formulations + Silitex substitution map + case studies + NotebookLM prompt | `src/data/formulations.json`; lib `src/lib/formulations.ts`; page `src/app/formulations/page.tsx`; card `components/formulations/FormulaCard.tsx`; prompt `src/prompts/formulation.ts`; PDFs `public/assets/formulations/` |
| Sales process A–Z (9 steps), follow-up delays per document, lead sources, offer defaults / incoterms | `src/config/sales.ts` |
| Sapirim team (names, bios, roles, photos) | `src/config/team.ts`; page `src/app/team/page.tsx` (also shown on /pitch) |
| Fact-finding intake: 8 sections, fields, options, guidance | `src/config/intake.ts`; form `components/leads/IntakeForm.tsx`; helpers `lib/intake.ts` (`intakeOf`, `intakePct`, `intakeSummary` → feeds pitch/offer/datasheet/transcript prompts); seed records for 10 accounts `src/data/intake_records.json` (NotebookLM, SKUs corrected to catalog) |
| Contact role groups (filter on /leads, suggestions in forms) | `src/config/roles.ts` |
| CRM intake (mandatory company + contact + mobile) | `src/components/leads/NewLeadForm.tsx`; website inbox → lead `components/leads/InboxCard.tsx` (needs Supabase) |
| Documents sent / price offers per lead | `components/leads/DocsCard.tsx` (list + status + stage moves), `TdsPanel.tsx` (TDS/MSDS cover note), `OfferPanel.tsx` (lines, EUR/kg, validity → AI draft); store `addDoc` (auto follow-up task) / `setDocStatus`; prompts `prompts/offer.ts`, `prompts/datasheet.ts` |
| Transcript box (WhatsApp / phone → summary → log + task + stage) | `components/leads/TranscriptCard.tsx`; prompt `prompts/transcript.ts` (`NEXT:` line parsed) |
| Open offers on dashboard | `components/OffersCard.tsx` |
| Funnel KPIs on /report | `components/FunnelStats.tsx` (`funnel()`); report context includes offers |
| "Grill me" rehearsal bot on /notes | `components/GrillPanel.tsx`; prompt `prompts/grill.ts` |
| Source-type counts on /ask | inline badges in `src/app/ask/page.tsx` |
| Logistics: shipment data-request checklist (7 sections, who-fills, defaults, HS, DG), docs list, statuses, importer identity | `src/config/shipping.ts`; helpers `lib/shipping.ts` (prefill, EN/IT text, CSV); page `src/app/logistics/page.tsx`; `components/logistics/ShipmentForm.tsx`, `ShipmentCard.tsx`; prompt `prompts/shipping.ts`; store `addShipment/updateShipment/removeShipment`; table `shipments` |
| Silitex Hub: departments (roles, phones, keywords → auto-routing), topics, statuses, waiting alert | `src/config/hub.ts`; helpers `lib/hub.ts` (parseEmail, matchRefs, waitingDays); page `src/app/hub/page.tsx`; `components/hub/DeptBoxes.tsx` (contacts), `PasteMail.tsx`, `ThreadView.tsx`; prompts `prompts/hub.ts` (summary → FIELDS line parsed into the thread); store `upsertContact/addThread/updateThread/addMsg`; tables `silitex_contacts`, `threads`, `hub_messages` |
| Outlook → Hub feed (Phase B) | `POST /api/hub/ingest` (header `x-hub-secret` = env `HUB_SECRET`; body `{messages:[{id,from,to,subject,at,body,conversationId}]}`) — dedup by external_id, thread by conversationId/subject; `GET` returns server threads for the page to merge. Feed it from a Microsoft Graph cron or a forwarding webhook. |
| Outlook 365 connector (Phase B) | `src/lib/outlook.ts` (OAuth, token refresh in `hub_tokens`, Graph pull filtered to HUB_MAIL_DOMAIN) · routes `/api/hub/outlook/{connect,callback,sync,status}` · cron `/api/cron/hub-sync` every 15 min · banner `components/hub/OutlookBar.tsx` · shared `lib/hub-ingest.ts` · env MS_CLIENT_ID / MS_CLIENT_SECRET / MS_TENANT_ID / HUB_MAIL_DOMAIN |
| DB tables | `supabase/schema.sql` (incl. `docs`, `leads.source`) |
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
src/app/         page (dashboard) · team · logistics · hub · products · offsets · leads · leads/[id] · pipeline · schedule · campaign · kb · sniper · brief
src/app/api/     ai · rag/extract · rag/crawl · brief · cron/daily-brief · cron/crawl
src/data/        products.json (45, v2 — Dow Corning / DuPont / XIAMETER benchmark names) · offsets.json (37×26, from full_offset…-v6.csv; incl. NuSil/Avantor column) · food_grade.json (9) · leads.json (19, with plan_* from action-plan CSV) · priorities.json (5)
supabase/        schema.sql
```

## Data flow
Bundled JSON (read-only catalog) → `lib/data.ts`.  
Mutable state (leads/tasks/activities/KB/spend) → `store/state.ts` → localStorage + Supabase write-through (`sync()`), hook `useStore()`.  
AI: page builds `{context, prompt}` from `src/prompts/*` → `AiPanel` → `POST /api/ai` → `lib/ai.ts` (`ask()`; demo mode without key) → usage → `TokenMeter` + `addSpend`.  
RAG: upload → `/api/rag/extract` (unpdf) → chunks in store → `scoreChunks()` → `prompts/rag.ts` → `AiPanel`.

## Env
`ANTHROPIC_API_KEY` (required for real AI) · `ANTHROPIC_MODEL` (optional) · `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional, client) · `SUPABASE_SERVICE_ROLE_KEY` (bots need it to read/write real data) · `CRON_SECRET` (Vercel sets) · `BRIEF_TO_WHATSAPP` · Twilio trio or `WHATSAPP_WEBHOOK_URL` · `RESEND_API_KEY` + `FORMS_TO` + `FORMS_FROM` (customer forms → email).

## Access (Phase 1 gate)
`src/middleware.ts` + `src/lib/gate.ts`: everything is PIN-gated (env `ACCESS_PIN`) except `/request`, `/survey`, `/login`, forms API, assets. Cookie 30 days; 🔒 in sidebar = logout. `X-Robots-Tag: noindex` + robots.txt on all. Phase 2 = Supabase Auth + roles (owner / silitex_* / customer), route groups, public vs internal search index.

## Presentation
`/pitch?lang=en&demo=1` — English, demo pipeline loaded. `?lang=en` on any URL forces English. ⚙ on dashboard: load demo / copy link / reset.

## Bots
- **Daily brief** `/brief` (manual) + cron → `runDailyBrief()` → Claude → WhatsApp. Without a provider: text + wa.me link (ExportBar WhatsApp button).
- **Offset Sniper** `/sniper` — pure matching on numbers/tokens vs `dow_corning_offset_benchmark` + offsets matrix; ≥2 token overlap.
- **Crawler** `/kb` panel (per category, into browser/Supabase via store) + weekly cron (needs service role, writes Supabase directly, dedupes by title). silitex.it has no TDS/MSDS PDFs — those stay manual uploads.

## Roadmap candidates
pgvector embeddings · Supabase auth · Cloudinary attachments on lead · quote PDF generator.
