
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
