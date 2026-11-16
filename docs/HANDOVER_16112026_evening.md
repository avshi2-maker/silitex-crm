# Handover — 16/11/2026 18:35 · Silitex CRM · Orders, 🤖 back-office agent, 🛡 guards, 📅 calendar + IWC organizer deck

## Done this session (pushed)
| item | version · commit |
|---|---|
| Ari Levy (ארי י. לוי) customer: new industry "Laboratory Equipment & Testing Instruments" (DB extra_industries), card filled from arilevy.co.il | DB |
| Isabel Colognese (international@silitex.it) added to Silitex contacts + #SPR-0002 team (Cc) | DB |
| #SPR-0001 Sabonit Zeit: Silitex offer (PO129 Dimethicone 10 cSt, €4.45/4.00/3.90/5.95 per kg EXW) + TDS 2026 + SDS rev.14 (not DG) on the project card | 6b54a53 |
| Cleanup: 24 fake customer targets cleared, 816 old automatic daily/weekly tasks closed, auto per-customer tasks OFF (backups leads_targets_backup_16112026, tasks_backup_16112026) · dashboard = real process only | v1.12.0 · 131bdac |
| 📦 Orders tab: ORD-S (sample) / ORD-P (product); sample = Hebrew A4 customer form + short mail → signed copy → only then English order to Silitex (Isabel, Cc team); product = proforma → bank text + 🏦 task → paid → shipped → invoice; status report; orders on project card | v1.13.0 · 09537b6 |
| 🤖 Back-office agent /agent (cron every 30 min): each new synced mail → summary + ready actions + draft orders from sample requests; nothing sent without a click; WhatsApp ping · ✨ order "fill from customer's mail / pasted text" | v1.14.0 · 045d29f |
| 🛡 Guards: spam/no-reply/flood blocked before AI, $1/day cap, per-sender cap, ⏸ pause, mail fenced as untrusted, actions only to known people, links stripped | v1.14.1 · 9199525 |
| 🚨 Security nudge on every page + forced review (2 checks + note) + 🧪 test alarm · v1.14.3 shows what is missing | v1.14.2 e8fb387 · v1.14.3 6cf4c95 |
| 📅 Outlook calendar for the agent (free slots, meeting actions → my calendar / send invitation) — Avshi reconnected Outlook with calendar permission | v1.15.0 · 772bf7e |
| Docs: December program for baby diaper & wipes producers (Claude Docs) · Orders mockup (Design) · IWC organizer training deck, 12 slides EN (Slides) | artifacts |

## Found
- Agent cost measured: ~$0.017 per mail → ~$0.10/day at current volume.
- Claude Meetings (beta, Google Meet only, Team/Enterprise plans) joins calls; it will NOT join with external guests (Federica) unless the org admin allows it.

## 🔴 AFTER THE BREAK — tasks
1. Silitex CRM: check footer v1.15.0 · build #772bf7e; open 🤖 סוכן משרד → the 📅 box should say "Outlook calendar connected"
2. 🤖 agent: go through today's cards on /agent, approve or ✕ each; note any wrong suggestion
3. #SPR-0001 Sabonit Zeit: send Isabel the delivery address for the 1 kg sample + answer Federica on volumes; decide the customer price (Silitex €4.45/kg + margin + shipping)
4. #SPR-0001: open 🧪 sample order on the project card → ✨ fill → print customer form → send to Adnan to sign (ask Claude for an English form version if needed)
5. #SPR-0002 Yitzhak: send the mail to Federica / Isabel (TDS+SDS DT 50, BODYAMISIL 35, PO625 + samples + all-in-one trial) and the Hebrew summary to Yitzhak
6. #SPR-0003 Ari Levy: customer page → 📁 Open project → Silitex mail with the ref
7. IWC deck: fill session date, monthly deadline day and month (slides 1, 7, 12); confirm approve/decline registrations + "Not used" for TEST events; share the deck with Maxine
8. Claude Meetings: check Claude plan (Team/Enterprise?) and the external-guest admin setting before a call with Federica
9. December diapers program: request lotion-grade TDS/SDS + regulatory file from Federica; run the search builder for diapers / wet wipes

## Ferrari queue (ideas, not tasks)
- Agent reads WhatsApp too (after the Meta feed reaches the Hub) — same cards, same guards — big
- English version of the customer sample form (per customer language) — quick
- Proforma PDF → AI reads amount + IBAN + SWIFT → bank task fills itself — medium
