# Integrity audit — plan vs Silitex catalogues · 13/10/2026 07:00
Scope: every Silitex SKU named in leads.json (recommended_sku), account_matching.json (matrix), priorities.json, offsets.json, products.json, patterns, FAQ, pitch/notes — checked against (a) the 5 sector catalogues 2026 received from Federica (239 products) and (b) the silitex.it product pages (318 names).

## Result
| | tons Yr-1 | $ Yr-1 | accounts |
|---|---|---|---|
| Core SKU confirmed in 2026 catalogues | **41.5 t** | **$256k** | 13 |
| Core SKU website-only (catalogue not received) | **23 t** | **$98k** | 9 |
| Total plan | 64.5 t | $354k | 22 |

All 64.5 t are desk estimates (plant size × silicone intensity), not customer commitments. Nothing in the app claims otherwise; the /market integrity panel shows the split live.

## Website-only SKUs (exist on silitex.it; not in the 5 PDFs) — ask for the sector catalogue, do not present as confirmed
AGRIWET · ANTISCHIUMA 3 · BERETEX 350 · BLACK OIL 100 / 1RPH · BLACKFLOC 003 · CATLOX HC · DYNAKOS 130 E · DYNAWEED 120 E · FLUIDO DI SILICONE 350 / 12500 · MACROAMISIL · NANOAMISIL HR · REOGUM 500 · SAR BRILL · SILWALL PRF 100 · SINDEKOR · STONIX 5000 · SUREVAT 679 · VOLUMEX · SILIFOOD 3000 **K** (kosher variant — catalogue lists SILIFOOD 3000 without K)
Catalogues to request: Textile · Paper & pulp · Building/water repellents · Water-treatment chemicals (flocculants/demulsifiers) · Industrial/metalworking antifoams · Agro adjuvants · Technical fluids line.

## Bug found and fixed in this audit
`BODYSIL 6000` (string-replace artefact of EVERSIL 3500 → BODYSIL 60) in Peer Pharm / Moroccanoil matrix rows → restored to EVERSIL 3500.

## Claims in the app that are NOT verified facts (keep the wording as estimates)
- Yr-1 tons/$ per account — estimates.
- TAM tons per account — estimates.
- Silitex capacity: catalogues disagree (8K / 15K / 22K t) — do not quote a number; ask.
- GOTS-ICEA certificate for textile grades — not seen in any document — ask.
- Kosher: confirmed in catalogues for SILIFOOD 30, CPL 350, CPL 350 ET, CPL 250 FOOD GRADE. SILIFOOD 3000 K / 1600 kosher status — ask.
- Israeli market tonnage per gap molecule (/market/gaps) — Avshi's estimate, editable on screen.

## What IS verified
- 239 product names, codes, INCI/active, %, dosage, compliance — from the 5 PDFs (automatic extraction; cells flagged where ambiguous).
- 318 names on silitex.it (scraped 12/10/2026).
- 22 plants' product lines — from their own websites (AI-drafted, noted as such on each matrix).
