# Silitex CRM — Handover 15/10/2026 B (17:35 Asia/Jerusalem)
Build: **v0.37.0 · ac322b2** (live). Read with HANDOVER_15102026.md (morning: v0.34.3–v0.36.1, meeting plan, open tasks).

## Since 14:55
- v0.37.0 /pitch **Technical backbone — why R&D switches (not price)** (config/backbone.ts + components/pitch/TechBackbone.tsx), between the Israel map and the 12-month plan; also in the export text. 5 drivers, every product verified against the 2026 catalogues with PDF link:
  1 Cyclic-free (MICROAMISIL E1352 textiles; C13-15 ALKANE PO657, ISODODECANE PO709, DIMETIBLEND H2057, DIMETHICONE 1,5 cSt PO653 cosmetics) · 2 Plant-origin EO-free (FISIOREX 1000 B1952, FISIOREX FG C2205, EVEROIL 35 E1441, ALCASUN VE PO661) · 3 Food/kosher (SILIFOOD 1000 PO340, SILIFOOD 10 C2239, SILIFOOD 1600 / 3000 K) · 4 Cost-in-use by concentration (DYNAPAN 10→33 %, BERETEX 5→16 %) · 5 One supplier, five sectors (292 grades). "To confirm with Silitex" box = custom grades, sample lead time, chemist line, D4/D5/D6 statements.
- NotebookLM audit (rd_technical_incentive_guide.pdf + talking-points v2) — REJECTED, do not say in the meeting:
  - BERETEX 750 "high-active simethicone, 15–20 % lower dosage" → catalogue: 7.5 % silicone, waste-water antifoam. For detergents use DYNAPAN.
  - MICROAMISIL for AHAVA → it is a textile softener (cyclic-free). Cosmetics D5-free = alkanes / DIMETIBLEND / 1.5 cSt.
  - FISIOREX 1000 = "plant-origin", not "100 % plant-based"; not cosmetics, not an agro adjuvant.
  - Invented, not in any Silitex catalogue: Surfactant PE 193, Silatex D / DM 350, Velvet Gel SG 9040, GOTS-ICEA softeners.
  - Talking-points Q2 offers Silitex real-time access to named accounts → NO (bypass risk; partner view stays knowledge-only).

## Decisions waiting for Avshi
1. Stock model: live /pitch says "Tel Aviv warehouse, 2-day delivery" (config/pitch.ts gets + phases 4) vs talking points "direct drop-ship, no local stock". Pick one → align config/pitch.ts.
2. /pitch priority #5 "GOTS-ICEA Organic Textile Softeners" (data/priorities.json) is unverified → relabel "Textile softeners (cyclic-free, eco-label)"?
3. "Swiss law", "$5.0M / 1,000 t", "35 years", "former exclusive Dow Corning distributor" — use only if provable.

## Meeting — Fri 16/10 10:00 Israel (09:00 Italy), host Eleonora Pravato, with Federica Biti
Join 09:55 · ask Eleonora to record + transcript (backup Win+Alt+R) · Silitex presents first → share Chrome window /pitch (backbone section instead of the NotebookLM product slide) → QuickMatch demo on /offsets → close with Cetyl Dimethicone question + the "to confirm" asks.

## Open tasks (unchanged from HANDOVER_15102026.md)
Post-meeting summary/follow-up/CRM · certificate PDFs → certs.ts · Resend sapirim.com · WhatsApp template · watch /partners · soft follow-up after 5 days silence · later list.

## Gotchas
New session → delete permission for C:\silitex-crm, then `rm -f .git/*.lock .git/objects/*/tmp_obj_* .git/stale-*`. Build-test in cloud clone, copy files with device_commit_files, verify md5, commit+push from the device.
