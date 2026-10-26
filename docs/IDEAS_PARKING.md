
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

## 🅿️ Expo Ready — research packs for Federica's 2 shows — PARKED 26/10/2026 (deadline: PDF to Federica ~03–04/11/2026)
Shows: **Fi Europe** Frankfurt 17–19/11/2026 + **Paint & Coatings** Barcelona 18–19/11/2026 — decided 25/10: build BOTH.
**Process (per show):** 1) exhibitor list (official site / floor plan) → 2) Claude web search scores each exhibitor for silicone fit (antifoam, emulsions, softeners, release, coatings additives) A/B/C → 3) top 30–40 with stand + hall + "where Silitex fits" + 3 opening questions + what to avoid → 4) day route per hall (stand-by-stand, booked meetings blocked in) → 5) English PDF "gift" to Federica ~2 weeks before the show.
**Mock-up done 24/10:** Design canvas "Expo Ready" (Day route · Stand brief · After the meeting — card scan + voice note → summary, next steps, follow-up mail via Outlook). Existing CRM pieces to reuse: /expo (partner field mode on silitex-field), ExpoList / ExpoMeet, QR_Silitex_Expo.png.
**Rules:** food sector stays out (Fi Europe = food ingredients → only non-food angles: fermentation/process antifoam for ingredient makers, disclosed to Federica); English only; no "local stock" claims.

## 🅿️ Sales meetings & calls tab ("🤝 פגישות ושיחות מכירה") — PROPOSED 26/10/2026, mock-up pending
Gap: meetings with Pini (partner) / customers — physical, phone, Teams, WhatsApp — fit neither /meetings (Silitex Teams) nor /field (visit capture) nor the customer-card transcript box.
Idea: one tab in "לקוחות ומכירות": who + type + date → notes box (type / paste / dictate) → AI: summary, per-customer decision + next step, tasks to "My day", updates each customer card; links the meeting sheet + its ticks. First record: Pini 25/10/2026 cosmetics meeting.
