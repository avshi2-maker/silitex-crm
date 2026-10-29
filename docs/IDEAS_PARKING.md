
## 🅿️ WhatsApp auto-feed (Meta Cloud API) — PARKED 11/10/2026
Decision: no new SIM / no partner fee until the Silitex business justifies it. Lost ~2 h on Meta dev-account verification; nothing broken, nothing to pay.
**What is DONE and live (v0.20.0):** webhook `/api/hub/wa` (verify + HMAC), known-number allow-list → running WhatsApp thread per contact, coexistence echoes as outbound, media → Cloudinary, 📥 Unmatched inbox (assign / create prospect / ignore / block), tables `wa_unmatched` + `wa_blocklist` (SQL run), Vercel `WA_VERIFY_TOKEN` set.
**What is DONE on Meta:** developer account (avshi2@gmail.com, verified by card), app **Silitex Hub** (app id 2113401589316760, business portfolio Marble Art), WhatsApp use case, webhook verified against our URL, subscribed to `messages` + `smb_message_echoes`. App is **unpublished** → Meta sends no production webhooks yet.
**Why stopped:** the dashboard "Add phone number" only MIGRATES a number (kills WhatsApp app on 050-5231042). Coexistence (API + phone app same number) is only via a partner's embedded signup (360dialog etc.).
**To resume (pick one):**
1. New SIM/eSIM for Silitex (~₪10/mo) → Meta app → Step 2 → Add new number → SMS code → Step 3 business verification (עוסק מורשה doc) → Publish app → add `WA_APP_SECRET` (App settings → Basic) and `WA_TOKEN` (System user token) to Vercel → test: message the number → appears in 📥 Unmatched. Then build "Send from Hub" (Cloud API /messages, half a day).
2. 360dialog coexistence on 050 (monthly fee, verify price) — keep our webhook URL.
3. Green-API web-bridge on 050 (~$15/mo, ToS risk) — only for a demo.
**Until then:** paste mode on /hub (single copied message or full chat export) is the WhatsApp flow — works, no cost.

## 🅿️ Facebook page "Avshi Sapir AI Solution Architect" — growth plan — PARKED 20/10/2026
Page created 20/10/2026 (cover + AS profile picture + WhatsApp button 050-5231042; Post 1 CRM story pinned, Post 2 field app). Images: `docs/fb/`. Mock-up canvas: "FB Page — Avshi Sapir AI Architect" (Claude artifact).
1. **8 posts in advance + Planner** — Claude writes 8 posts (one per app / case, same style as Post 1–2) + images; Avshi loads them once into Business Suite → Planner, Tuesdays 09:00 for 2 months.
2. **Small weekly boost** — ₪30–50 / week on the best post; audience: business owners & managers, Israel, 35–65. New page = near-zero organic reach, traffic comes from this.
3. **Meta Business Agent** (launched globally 03/06/2026) — AI replies in Messenger / Instagram / WhatsApp, qualifies leads, books a call, hands off. Answers messages only (no posts). Free for now, subscription planned. Turning it on PAUSES existing Business Suite automations (Instant Reply, Away message…). Check the tile in Business Suite → All tools (Israel not named in rollout notes). Turn on after the first inquiries arrive.
4. **Weekly draft bot (Claude scheduled task)** — every Sunday drafts next week's post (text + image) and sends it to Avshi for approval; nothing is published without him.
**Blocked by:** sapirim.com public (PORTAL_PUBLIC=1) → then add the portfolio link as the first comment on the pinned post + website in About.

## 🅿️ Weekly Google report on WhatsApp — PARKED 21/10/2026
Every Monday 08:00 a short WhatsApp to Avshi: clicks + impressions last 7 days, top 10 searches that brought people to www.sapirim.com, new pages Google indexed, pages with errors, best code page (e.g. "DOWSIL 1520 alternative").
**How:** Google Search Console API (service account added as user on the sapirim.com property) → `/api/cron/gsc-weekly` (Vercel cron, Mondays) → existing `sendWhatsApp()` (Meta Cloud API) + same text on /promo.
**Why parked:** the site went public 20/10/2026 — Search Console needs ~3 weeks of data before the numbers mean anything.
**Resume:** from ~10/11/2026. Avshi: Search Console → Settings → Users → add the service-account e-mail (Claude gives it). Claude: route + cron + /promo card, half a day.

## 🅿️ artfloor.co.il rebuild — PARKED 21/10/2026
Site is ~20 years old (not in GitHub, no footer link to sapirim.com possible). Avshi: maybe rebuild next year. When rebuilt — same stack as marble-art.co.il (Next.js + Vercel), footer link "חלק מקבוצת ספירים" → www.sapirim.com/he, and tick it on CRM /promo.

## 🅿️ Sapirim Distributor Toolkit — productize the CRM for other Silitex distributors — PARKED 22/10/2026
Idea (Avshi, 22/10): sell the system we built to other Silitex distributors as a service. Draft offer page (private artifact): https://claude.ai/artifact/9ndaHRxssZX1Mx6CCQimQ1 — plans Scout €190 / Growth €340 / Pro €590 a month (50 / 100 / 200 website scans), setup €900, cost & margin calculator.
**Modules to sell (all live in the Israel CRM):** AI website scanner + server scan queue (v0.74.0) · 🎯 potential analytics + monthly call plan (v0.73.0) · English monthly report to Silitex without customer names · sales CRM (My day, playbooks, intake, validation) · mail + WhatsApp hub · public product finder portal (code pages, regulation, match report, AI answer in the visitor's language) · **NEW: Ask Silitex → 📮 automatic technical request e-mail to Silitex + questions into the open-questions register (v0.76.0)** · Friday report register with ticker · meeting recording → transcript → summary (Whisper ~$0.006/min).
**Measured cost:** ~$0.06 per website scan (Sonnet), real cost per scan now recorded in table scan_jobs → replace estimates after the first server runs.
**To do when we resume:**
1. Ask Silitex for approval (their catalogue + countertype data powers it) — best buyer = Silitex itself as one group plan.
2. Add the Ask Silitex → Silitex-request module to the offer page.
3. Build a full PITCH covering everything (Slides deck: problem → system tour with screenshots → measured results from Israel → plans → pilot offer) for Silitex management.
4. One pilot distributor at a reduced fee for 3 months; per-distributor copy of the system (own Supabase + Vercel + domain, ~1–2 days setup each).
**Don't:** show prices to Federica before Silitex approves the idea; don't build multi-tenant until a second paying distributor exists.

## ✅ Expo Ready — research packs for Federica's 2 shows — BUILT 28/10/2026 (v1.3.0, /expo-ready) — was PARKED 26/10/2026
Shows: **Fi Europe** Frankfurt 17–19/11/2026 + **Paint & Coatings** Barcelona 18–19/11/2026 — decided 25/10: build BOTH.
**Process (per show):** 1) exhibitor list (official site / floor plan) → 2) Claude web search scores each exhibitor for silicone fit (antifoam, emulsions, softeners, release, coatings additives) A/B/C → 3) top 30–40 with stand + hall + "where Silitex fits" + 3 opening questions + what to avoid → 4) day route per hall (stand-by-stand, booked meetings blocked in) → 5) English PDF "gift" to Federica ~2 weeks before the show.
**Mock-up done 24/10:** Design canvas "Expo Ready" (Day route · Stand brief · After the meeting — card scan + voice note → summary, next steps, follow-up mail via Outlook). Existing CRM pieces to reuse: /expo (partner field mode on silitex-field), ExpoList / ExpoMeet, QR_Silitex_Expo.png.
**Rules:** ~~food sector stays out~~ → CHANGED 28/10/2026 by Avshi: the packs are for Federica's OWN market, not the Israeli market, so ALL food angles are in (food processing, fermentation, release, non-food). The "no food" rule still applies only to Sapirim's Israeli promotion. English only; no "local stock" claims.
**Built 28/10:** Fi Europe — 1,532 exhibitors keyword-screened, 118 assessed, 40 briefs (27 A), Silitex itself at 41N56. Paint & Coatings — all 151 exhibitors screened, only 10 producer targets (supplier-side show; producers come as visitors) + 29 distributors + 8 competitors. Data: src/data/expo-ready/*.json · PDFs: public/expo-ready/ · NotebookLM website sources: /api/cron/expo/<slug> (slugs in that route).

## 🅿️ Sales meetings & calls tab ("🤝 פגישות ושיחות מכירה") — PROPOSED 26/10/2026, mock-up pending
Gap: meetings with Pini (partner) / customers — physical, phone, Teams, WhatsApp — fit neither /meetings (Silitex Teams) nor /field (visit capture) nor the customer-card transcript box.
Idea: one tab in "לקוחות ומכירות": who + type + date → notes box (type / paste / dictate) → AI: summary, per-customer decision + next step, tasks to "My day", updates each customer card; links the meeting sheet + its ticks. First record: Pini 25/10/2026 cosmetics meeting.

## 🅿️ Verify competitor codes → turn ⚠ into ✓ — PARKED 26/10/2026
Since v0.99.0 every competitor code not from a verified source shows 🟨 "⚠ לא מאומת" (CRM, meeting sheet, search, post studio, public portal).
Verified today: Silitex column · Silitex official cosmetic countertype leaflet (Dow/BRB/Momentive/Wacker) · NuSil CareSil docs (2013–2016) · Sapirim Dow purchasing 2010–2013 (INCI of every Dow product bought).
**Plan:** one producer at a time with Claude web search against the producer's own data sheet / product page — start Dow (biggest, and the market-table Dow column has known errors, e.g. Dow 556 under quaternary microemulsions), then Wacker, Momentive, Shin-Etsu, Evonik … Each confirmed code → listed in `verified_producers` / per-code verified list in offsets.json with the source URL → ✓, notice disappears. Wrong codes → corrected or cleared ("? לא ידוע"). Never mark ✓ without a producer source.

## 🅿️ Federica Expo phone kit — offer to build, needs Federica + Silitex owners OK — PARKED 29/10/2026
Idea: turn the Expo Ready packs into a phone tool Federica uses ON the stand floor (Fi Europe 17–19/11, Paint & Coatings 18–19/11).
**Modules:** day route per hall (stand-by-stand, tick done) · stand brief card (fit, 3 opening questions, avoid) · business-card scan → contact · voice note → AI summary + next step · one-tap follow-up mail draft (Outlook, English) · product encyclopedia / countertype search offline · e-card / QR of Silitex.
**Reuse:** /expo field mode on silitex-field.marble-art.co.il (encyclopedia, meeting + AI, contacts, e-card) + src/data/expo-ready/*.json.
**Blocker:** Silitex IT blocks our CRM domain → deliver as separate domain or installable PWA on her private phone; or NotebookLM-only fallback.
**Status:** offer mail drafted 29/10 (plain English, Outlook). Build only after Federica AND Silitex owners approve. ~2–3 days build. Deadline to decide: ~05/11 (needs testing before 17/11).

## 🅿️ WhatsApp Central Hub — all WA messages → one inbox → TAG → right CRM — PARKED 29/10/2026
Mock-up (Design canvas, 3 boards: inbox · routing rules · flow): https://claude.ai/artifact/BibmNPhNKP8e455n9JKk4x
**Destinations (7 tags):** NutriClinic · Marble Art sinks · Artfloor · Industrial epoxy (new mini-CRM) · Silitex · AI Architect leads (new, FB + personal site) · Personal (never routed).
**Routing order:** 1) number already in a CRM → auto · 2) source code in WA button text (#NUTRI #SINK #ART #EPOXY #SIL #AI) → auto · 3) keywords + AI with % → confirm (auto >90% optional) · 4) unknown → manual, remembered per number.
**Bridge options (050-5231042, WhatsApp Business app):**
- Green-API Business ~690 RUB ≈ $8–9/mo — linked-device (like WhatsApp Web), unofficial → ban risk on the main number. Free dev tier (3 chats) for testing.
- Whapi.cloud ~$29/mo — same linked-device method, better support/docs, same risk.
- 360dialog Cloud API coexistence ~€49–99/mo + Meta fees — official, app keeps working, app messages mirrored; open app every 13 days; WhatsApp Web/desktop companions get unlinked.
**DECISION 29/10/2026 (Avshi):** NO paid bridge for now — not taking the $9 Green-API ban risk on 050, and not paying for 360dialog yet. Messages enter the Hub by paste / share from phone. Re-evaluate in ~3 months (late 01/2027) using the Hub's own message count per week: if paste volume is high enough to justify ~$59/mo, go official (360dialog coexistence).
**Hub build:** STARTED 29/10/2026 — new app sapirim-hub (Hub inbox + Artfloor CRM + AI Architect CRM), paste-in mode.

## 🅿️ Industrial epoxy mini-CRM — build NEXT WEEK (from 02/11/2026)
Basic: leads, contacts, site visit (m², substrate, photos), quote, status, tasks. Same stack as other CRMs; ingest endpoint ready for the WhatsApp Hub. Current epoxy work stays as-is until then.
