# Silitex cosmetics coverage — gap annex (for the Federica meeting)
Updated 12/10/2026 · source: silitex.it product pages (fluidi-di-silicone, materie-prime-siliconiche, gomme-siliconiche), checked by Claude 12/10/2026.

## Verdict
Not a bug in the CRM search — a **data error in offsets.json v6** plus a **real structural gap at Silitex**.
- offsets.json listed phantom Silitex products ("Silitex SG 9040", "Silitex Emulsifier 5225C", "Silitex MQ Resin Blends", "Silitex DM Series"). None exist. Corrected: CAT-30/36/37 = GAP, CAT-11/12 = real "Fluido di Silicone" line, CAT-02 = real Amodimethicone.
- products.json (44 SKUs) was missing Silitex's whole raw-material line. Added 4 SKUs (RAW-*): Fluido di Silicone 5–2,000,000 cSt, Dimethicone cosmetic 5–5000, Amodimethicone, Ciclopentasilossano.

## Dow Corning legacy basket (what Sapirim sold for 20 years) vs Silitex today
| DC product | INCI | Silitex | Status |
|---|---|---|---|
| DC 200 fluid 5–1,000,000 cSt | Dimethicone | FLUIDO DI SILICONE (27 grades) / DIMETHICONE cosmetic 5–5000 | ✅ COVERED |
| DC 245 | Cyclopentasiloxane | CICLOPENTASILOSSANO (D4 <0.1%) | ✅ COVERED |
| DC 345 | D5/D6 blend | Ciclopentasilossano (D5 only) | 🟡 PARTIAL |
| DC 2-8566 / 8040 | Amodimethicone | AMODIMETHICONE reactive fluid + MICROAMISIL / MACROAMISIL emulsions | ✅ COVERED |
| DC 949 / 939 cationic emulsions | Amodimethicone emulsion | MICROAMISIL, NANOAMISIL, STONIX, AMINOQUAT | ✅ COVERED (stronger than DC) |
| DC 36 / 1784 / HV emulsions | Dimethicone emulsion | EVERSIL 35 / 60 / 3500 | ✅ COVERED |
| Antifoam A / 1520 / 1510 | Simethicone | ANTISCHIUMA, BERETEX, DYNAPAN, SILIFOOD | ✅ COVERED (core strength) |
| DC 193 | PEG-12 Dimethicone | IDROAMISIL | 🟡 PARTIAL (microemulsion, not fluid) |
| DC 2502 | Cetyl Dimethicone | — | ⛔ GAP-002 |
| DC 5225C / 3225C / BY 11-030 | PEG/PPG-18/18 Dimethicone (W/Si emulsifier) | — | ⛔ GAP-003 |
| DC 9040 / 9041 / 9045 | Dimethicone Crosspolymer gel | — (Gomma Siliconica = technical RTV) | ⛔ GAP-004 |
| MQ-1600 / RSN-0749 / 593 | Trimethylsiloxysilicate | — | ⛔ GAP-005 |
| FZ-3196 | Caprylyl Methicone | — | ⛔ GAP-001 |
| DC 556 | Phenyl Trimethicone | — (not checked on site) | ❓ to ask |
| DC 1501 | Dimethiconol blend | — (not on site) | ❓ to ask |

## What this means
- Silitex = emulsion / microemulsion / antifoam / textile-paper house + basic PDMS raw materials. Strong for **hair care and process (filling, CIP)**. Weak for **colour cosmetics, sun care, skin-feel modifiers** (emulsifiers, gels, resins, alkyl silicones).
- ~40% of the legacy Dow Corning cosmetics basket (by SKU) has no Silitex answer. By tonnage the biggest misses are 5225C-type emulsifiers and 9040-type gels.

## Ask Federica (contract)
1. Can Silitex source or private-label GAP-003 / GAP-004 from a partner (Wacker, Evonik, Grant)? Silitex already resells Wacker-type cyclics (CM 040).
2. If not — written carve-out: Sapirim keeps a second supplier for the 5 gap molecules only, so cosmetics accounts (AHAVA, Peer Pharm, Moroccanoil) get one basket.
3. Confirm Phenyl Trimethicone / Dimethiconol availability.
