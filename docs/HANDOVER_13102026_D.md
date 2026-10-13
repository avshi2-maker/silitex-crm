# Silitex CRM — Handover 13/10/2026 D (13:40 Asia/Jerusalem)
Build: **v0.34.2 · 720b03b** (unchanged, Vercel green). Read first. Earlier: HANDOVER_13102026_C.md (WhatsApp live, email forwarding), _B (rehearsal), main.

## State at break
- WhatsApp outbound LIVE — do NOT touch Meta.
- Waiting on Silitex reply (Federica + 2 colleagues) to the 08:35 + 11:00 mails.
- Email still on Resend sandbox `onboarding@resend.dev` → only reaches avshi2@gmail.com; Gmail forward to avshi@sapirim.com unverified.
- Code needs NO change for the email fix: src/lib/forms.ts + src/lib/partner-feedback.ts already read `FORMS_FROM` / `FORMS_TO` env (defaults: onboarding@resend.dev / avshi@sapirim.com).
- Known: sapirim.com MX = `sapirim-com.mail.protection.outlook.com` (Microsoft 365). DNS host (NS) not yet identified — check in step 3.
- Chrome: tab open at resend.com/login — **Avshi must log in himself** (Claude can't enter passwords).

## Tasks after the break
1. **Resend domain sapirim.com** (main fix):
   1. Avshi logs in to Resend in Chrome (avshi2@gmail.com) → says "in".
   2. Claude: Resend → Domains → Add `sapirim.com`, region EU (Ireland).
   3. Copy the records Resend shows: DKIM TXT `resend._domainkey`, SPF MX + TXT on `send` (send.sapirim.com), optional DMARC `_dmarc`. Do not change root MX/SPF (Microsoft 365 mail must keep working).
   4. Find sapirim.com DNS host (whois/NS) → Avshi logs in there → Claude adds the records.
   5. Resend → Verify (may take minutes–hours).
   6. Vercel silitex-crm → env: `FORMS_FROM="Silitex Israel <crm@sapirim.com>"`, `FORMS_TO=avshi@sapirim.com` → redeploy.
   7. Test: submit /request form + an "Ask Sapirim" partner note → confirm arrival in avshi@sapirim.com inbox (Outlook; check junk). Then Gmail forward filter becomes irrelevant.
2. Gmail filter check: row must read `from:(onboarding@resend.dev) → Forward to avshi@sapirim.com`. If forwarded mails still missing → ignore, task 1 replaces it.
3. WhatsApp template `sapirim_support_alert` (Meta → WhatsApp Manager → Message templates, Utility, body "🆘 Silitex partner {{1}} needs data: {{2}} → reply within 24h"). Only templates — no other Meta changes. Switch `sendWhatsApp` to template fallback on error 131047.
4. Watch /partners daily for Federica's logins/notes; reply within 24 h by email, mark replied. Never reply inside the "Silitex חיבור ישיר" WhatsApp chat.
5. Silitex reply (meeting slots + portal): YES → rehearse per HANDOVER_13102026_B; NO/silence 5 days (≈18/10) → one soft follow-up.
6. Later: Formulator Portal (customer-facing, invitation-only), purchase-history list, Cleano-Kal identity, LEAD-019 split, own 050 test message in 📥 Unmatched.

## Gotchas
- Each session: delete permission → `rm -f .git/*.lock .git/objects/*/tmp_obj_*`.
- Push works from the bridge (credential helper `.git/.creds`).
- Vercel Secret env values are never shown again — delete + recreate, don't guess.
- DNS lookups from the cloud are blocked; use the DNS host's panel or Resend's own check.
