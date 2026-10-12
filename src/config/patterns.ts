// patterns.ts (src/config/patterns.ts) · updated 12.10.2026 12:05 (Asia/Jerusalem)
// Personal-care formulation patterns: silicone role per product type → Silitex equivalents. Reference pattern (KCC personal-care guide structure), not a commercial formula.
export const ROLES = [
  { role: "Emollient / slip", chem: "Dimethicone, cyclopentasiloxane", silitex: "DIMETHICONE 5–350 (cosmetic) · CICLOPENTASILOSSANO (D5)", d5free: "DIMETHICONE 5 / 10" },
  { role: "Volatile carrier", chem: "D5 / cyclic siloxanes", silitex: "CICLOPENTASILOSSANO (D5)", d5free: "DIMETHICONE 5 (low-viscosity linear) — slower dry-down" },
  { role: "Film former / wear", chem: "Trimethylsiloxysilicate (MQ), silicone copolyols", silitex: "GAP-005 (no Silitex cosmetic MQ resin)", d5free: "GAP-005 — second supplier" },
  { role: "Texture / cushion", chem: "Dimethicone crosspolymer elastomer gels", silitex: "GAP-004 (no Silitex elastomer gel)", d5free: "GAP-004 — second supplier" },
  { role: "Emulsifier W/Si, W/O", chem: "PEG/PPG-18/18 dimethicone, cetyl PEG/PPG dimethicone", silitex: "GAP-003 (no Silitex W/Si emulsifier)", d5free: "GAP-003 — second supplier (Evonik ABIL EM 90 / Shin-Etsu KF-6028)" },
  { role: "Hair conditioning", chem: "Amodimethicone, silicone quats", silitex: "AMINOQUAT 250/350 · MACROAMISIL (E1386) · AMODIMETHICONE fluid", d5free: "MACROAMISIL E1386 / MICROAMISIL E1352" },
  { role: "Natural / silicone-free feel", chem: "Vegetal emollients, waxes", silitex: "EVEROIL 35 / EVERIX 35 · CARNAUBEX · WASPER D", d5free: "all" },
];
export const PRODUCT_TYPES = [
  { type: "Gel serum / water-gel cream", role: "Lightweight sensory base, spreadability", chem: "Volatile fluid + elastomer gel", silitex: "D5 or DIMETHICONE 5 + elastomer gel (GAP-004)" },
  { type: "Sunscreen", role: "Carrier, water resistance, sensory", chem: "Volatile silicone + film former", silitex: "DIMETHICONE 5 / D5 + MQ resin (GAP-005)" },
  { type: "Primer / foundation", role: "Slip, blur, soft-focus, wear", chem: "Elastomer + dimethicone + film former", silitex: "elastomer gel (GAP-004) + DIMETHICONE 100 + MQ resin (GAP-005)" },
  { type: "Cleansing balm", role: "Oil-phase solvent, rinse-off feel", chem: "Silicone fluids / volatile carrier", silitex: "DIMETHICONE 5–50 (or EVEROIL 35 for natural claim)" },
  { type: "Hair oil / treatment", role: "Conditioning, shine, detangling", chem: "Dimethicone + amodimethicone", silitex: "DIMETHICONE 350 + AMODIMETHICONE fluid / MACROAMISIL (E1386)" },
  { type: "Lip products", role: "Gloss, slip, wear", chem: "Silicone fluids + film former", silitex: "DIMETHICONE 1000 + MQ resin (GAP-005)" },
  { type: "Hand cream / body lotion", role: "Non-tacky after-feel, emolliency", chem: "Elastomer gel + light fluid", silitex: "elastomer gel (GAP-004) + DIMETHICONE 10 (see CareSil 729-AAL-69 pattern)" },
];
export const SIW_PATTERN = ["Prepare the water phase separately (water, humectants, water-soluble actives).", "Prepare the silicone/oil phase with the silicone emulsifier (PEG/PPG-18/18 dimethicone type — NOT Silitex, GAP-003) and the silicone fluids/gel.", "Add the water phase SLOWLY into the silicone phase under mixing.", "High-shear (rotor-stator) 10–30 min until uniform; cool; add fragrance/preservative below 40°C.", "Dry-touch variant: D5 (CM 040) as volatile carrier + 1–3% non-volatile dimethicone (DM 100–350) for residual smoothness; add elastomer gel for cushion/soft-focus."];
