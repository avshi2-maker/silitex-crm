# Silitex CRM — Handover 13/10/2026 C (13:35 Asia/Jerusalem)
Build: **v0.34.2 · 720b03b** (Vercel green). Earlier: HANDOVER_13102026.md (v0.33.0), HANDOVER_13102026_B.md (v0.34.0).

## Since 11:05
- v0.34.1 NoDataCard: question fallback + server error shown. v0.34.2 WhatsApp webhook logs delivery statuses (`WA status …` in Vercel Logs).
- **WhatsApp outbound LIVE.** Meta: System user `silitex-crm` (Admin; assets: app Silitex Hub full control + both "Sapirim - Silitex Israel" WABAs), permanent token with whatsapp_business_messaging + whatsapp_business_management. Vercel: `WA_TOKEN` (secret), `WA_PHONE_ID=1477174258803732`, `BRIEF_TO_WHATSAPP` deleted (code default 972505231042). Verified: 🆘 alerts arrive on Avshi's 050 inside the chat with the business number (contact saved as "Silitex חיבור ישיר"). Rule: Avshi must NOT reply in that chat (it would land in the Hub as inbound from himself); answer partners from /partners by email. 24 h window: any message from 050 to 054-886-8195 reopens it; template `sapirim_support_alert` still to register for window-closed sends.
- **Email**: Resend sender `onboarding@resend.dev` → delivers only to the Resend account owner = avshi2@gmail.com (sandbox). Gmail filter edited to forward from:onboarding@resend.dev → avshi@sapirim.com (verified forwarding address); Outlook safe-sender added. At 13:30 the forwarded copy had NOT yet appeared on sapirim.com — unverified.
- Meta developer account passed "Account confirmation" (ID/code) today.

## Tasks after the break
1. **Resend domain verification for sapirim.com** (the real email fix): Resend → Domains → Add `sapirim.com` → add the DKIM/SPF TXT records at the sapirim.com DNS → verified → Vercel `FORMS_FROM="Silitex Israel <crm@sapirim.com>"`, `FORMS_TO=avshi@sapirim.com` → redeploy → test. Then the Gmail forward is irrelevant.
2. Check Gmail filter row reads `from:(onboarding@resend.dev) → Forward to avshi@sapirim.com`; if forwarded mails still miss, ignore and do task 1.
3. WhatsApp template `sapirim_support_alert` (Meta → WhatsApp Manager → Message templates, category Utility, body "🆘 Silitex partner {{1}} needs data: {{2}} → reply within 24h") → switch `sendWhatsApp` to template when free-form fails with error 131047.
4. Watch /partners daily for Federica's logins/notes; reply within 24 h by email, mark replied.
5. Waiting on Silitex reply to the 08:35 + 11:00 mails (meeting slots + portal). YES → rehearse per HANDOVER_B; NO/silence 5 days → one soft follow-up.
6. Later: Formulator Portal (customer-facing, invitation-only), purchase-history list, Cleano-Kal identity, LEAD-019 split, own 050 test message in 📥 Unmatched.

## Gotchas
- Each session: delete permission → `rm -f .git/*.lock .git/objects/*/tmp_obj_*`.
- Cloud build-test clone /home/claude/avshi2-maker/silitex-crm (read-only; reset to origin after each push).
- Vercel Secret env values are never displayed again after save — delete + recreate rather than guess.
