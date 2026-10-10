# Silitex CRM — Handover 10/10/2026 07:45 (Asia/Jerusalem) — session B (after v0.16.0)

Live: https://silitex.marble-art.co.il · repo avshi2-maker/silitex-crm · folder C:\silitex-crm · Vercel silitex-crm · Supabase silitex-crm (Pro org).
Current: **v0.18.2 · (this commit)**. Bridge commits + pushes itself (token in .git/.creds). Delete permission on C:\silitex-crm re-requested each session (git lock files only). Read docs/SILITEX_ATLAS.md + docs/HANDOVER_10102026.md (morning) first.

## Done this session (all live)
| ver | what |
|---|---|
| 0.16.1 | **Outlook fixed.** AADSTS7000215 killed for good: Microsoft login is now PKCE public client — no `MS_CLIENT_SECRET` anywhere. Callback moved to `/api/hub/outlook/cb` (Azure: Mobile & desktop platform, "Allow public client flows" = Enabled; old Web `/callback` entry still registered, unused, harmless). Verified: connected as avshi@sapirim.com, sync works, cron every 15 min. |
| 0.16.2 | i18n: `t()` now tries the exact key first — keys with leading/trailing spaces (Hub subtitle, Outlook banner) translate in EN/IT. |
| 0.17.0 | Hub contact modal (`ContactModal.tsx`) — same template for all departments: name, role, email, mobile, phone, LinkedIn, address, notes + **paste-signature auto-fill** (`lib/parse-signature.ts`, tested on Federica's signature). Schema: `silitex_contacts` +linkedin,+address (SQL run). WhatsApp/LinkedIn links on dept cards. |
| 0.17.1–3 | Thread routing: **sender/recipient matches a saved contact → that contact's dept** (sync + paste); orphan threads re-routed on every sync; page merge updates existing threads too; thread list shows contact name. Federica Biti (Management, Export Sales Manager) added; her 3 threads sit under Management. |
| 0.18.0 | **Prospect correspondence.** Outlook sync also pulls mails from/to any lead `contact_email` or that company's domain (generic domains = exact address only) → 10th Hub box 🇮🇱 Prospects — Israel, thread refs = lead, status "Waiting on prospect". Lead file lists its threads, deep link `/hub?thread=<id>`. Direction: out = from sapirim.com, in = everything else. `lib/hub-match.ts` shared matcher. |
| 0.18.1 | **Sales plan v3.1** (`docs/sales_action_plan_v3_1.csv`): lead volume/value = **Yr1 target** (total $281k / 54 t), TAM kept in new `tam_tons` (SQL run). One-time auto-correction in `store/state.ts` for stored seed accounts + Supabase sync — ran, verified (ICL $15,000 · 3 t · TAM 60 t). Phase/next action/SKU/competitor/roles refreshed from CSV. |
| 0.18.2 | Pitch tiles: Year-1 target $k · Year-1 volume t · Market capacity (TAM) t/yr. |

## Rules learned today
- Claude cannot delete Azure/Vercel config entries (policy) — design around it (new path instead of delete). Claude never pastes secrets; PKCE/public-client is the pattern for any future OAuth.
- Hub store = localStorage + Supabase write-through; server-side changes reach the browser only through `merge()` in `app/hub/page.tsx` (now updates existing threads).
- Avshi gets lost between Add/Edit dialogs in portals — one click per message, name the exact button.

## Open / next
1. **Back-fill prospect mails** (optional): first sync after 0.18.0 looked ~1h back. To pull last 30 days of prospect mails once: `update hub_tokens set last_sync = null where id='outlook';` then Sync now.
2. Optional cleanup: delete `MS_CLIENT_SECRET` in Vercel; delete old Web redirect `/api/hub/outlook/callback` in Azure. Both harmless if left.
3. Monday checklist unchanged: PIN login on presenting laptop; /kb crawl 4 categories; /notes Grill-me; two team names in `src/config/team.ts`; lab questions (Adama trisiloxane spreader, Iscar alkaline coolant defoamer, Bazan high-temp defoamer).
4. Resend still sandbox → verify marble-art.co.il when convenient.
5. Ferrari queue (ranked): (a) cron drafts AI reply into Outlook Drafts (needs Mail.ReadWrite — re-consent in Azure, then Connect again) — medium; (b) 08:00 daily "waiting on me" digest via Resend — quick; (c) send-from-Hub via Mail.Send — skip for now.
6. Build queue from morning: B Ask-Silitex Wikipedia fallback · E Lead-to-SKU matcher · F Monday follow-up pack · C Principal Portal (after contract) · D Phase-2 auth split.
