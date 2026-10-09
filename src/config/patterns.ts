// patterns.ts (src/config/patterns.ts) · updated 09.10.2026 18:20 (Asia/Jerusalem)
// Personal-care formulation patterns: silicone role per product type → Silitex equivalents. Reference pattern (KCC personal-care guide structure), not a commercial formula.
export const ROLES = [
  { role: "Emollient / slip", chem: "Dimethicone, cyclopentasiloxane", silitex: "Silitex DM 5–350 (linear PDMS) · CM 040 (D5)", d5free: "DM 5 / DM 10" },
  { role: "Volatile carrier", chem: "D5 / cyclic siloxanes", silitex: "Silitex CM 040 / Volatile D5 Fluid", d5free: "DM 5 (low-viscosity linear) — slower dry-down" },
  { role: "Film former / wear", chem: "Trimethylsiloxysilicate (MQ), silicone copolyols", silitex: "Silitex MQ Resin Blends / Idrorepellenti MQ", d5free: "MQ in DM carrier" },
  { role: "Texture / cushion", chem: "Dimethicone crosspolymer elastomer gels", silitex: "Silitex SG 9040 (D5) · SG 9041 / Velvet Gel (D5-free)", d5free: "SG 9041 / Velvet Gel" },
  { role: "Emulsifier W/Si, W/O", chem: "PEG/PPG-18/18 dimethicone, cetyl PEG/PPG dimethicone", silitex: "Silitex Emulsifier 5225C / Advanced Emulsion Bases", d5free: "5225C in DM carrier (confirm with Silitex)" },
  { role: "Hair conditioning", chem: "Amodimethicone, silicone quats", silitex: "AMINOQUAT 250/350 · MACROAMISIL (E1386) · AMODIMETHICONE fluid", d5free: "MACROAMISIL E1386 / MICROAMISIL E1352" },
  { role: "Natural / silicone-free feel", chem: "Vegetal emollients, waxes", silitex: "EVEROIL 35 / EVERIX 35 · CARNAUBEX · WASPER D", d5free: "all" },
];
export const PRODUCT_TYPES = [
  { type: "Gel serum / water-gel cream", role: "Lightweight sensory base, spreadability", chem: "Volatile fluid + elastomer gel", silitex: "CM 040 or DM 5 + SG 9041 Velvet Gel" },
  { type: "Sunscreen", role: "Carrier, water resistance, sensory", chem: "Volatile silicone + film former", silitex: "DM 5/CM 040 + MQ Resin Blend" },
  { type: "Primer / foundation", role: "Slip, blur, soft-focus, wear", chem: "Elastomer + dimethicone + film former", silitex: "SG 9041 + DM 100 + MQ Resin Blend" },
  { type: "Cleansing balm", role: "Oil-phase solvent, rinse-off feel", chem: "Silicone fluids / volatile carrier", silitex: "DM 5–50 (or EVEROIL 35 for natural claim)" },
  { type: "Hair oil / treatment", role: "Conditioning, shine, detangling", chem: "Dimethicone + amodimethicone", silitex: "DM 350 + AMODIMETHICONE fluid / MACROAMISIL E1386" },
  { type: "Lip products", role: "Gloss, slip, wear", chem: "Silicone fluids + film former", silitex: "DM 1000 + MQ Resin Blend" },
  { type: "Hand cream / body lotion", role: "Non-tacky after-feel, emolliency", chem: "Elastomer gel + light fluid", silitex: "SG 9041 + DM 10 (see CareSil 729-AAL-69 pattern)" },
];
export const SIW_PATTERN = ["Prepare the water phase separately (water, humectants, water-soluble actives).", "Prepare the silicone/oil phase with the silicone emulsifier (PEG/PPG-18/18 dimethicone type — Silitex 5225C) and the silicone fluids/gel.", "Add the water phase SLOWLY into the silicone phase under mixing.", "High-shear (rotor-stator) 10–30 min until uniform; cool; add fragrance/preservative below 40°C.", "Dry-touch variant: D5 (CM 040) as volatile carrier + 1–3% non-volatile dimethicone (DM 100–350) for residual smoothness; add elastomer gel for cushion/soft-focus."];
