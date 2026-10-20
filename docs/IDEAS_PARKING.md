
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
