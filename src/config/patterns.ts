// patterns.ts (src/config/patterns.ts) · updated 13.10.2026 06:10 (Asia/Jerusalem)
// Personal-care formulation patterns: silicone role per product type → Silitex equivalents. Reference pattern (KCC personal-care guide structure), not a commercial formula.
export const ROLES = [
  { role: "Emollient / slip", chem: "Dimethicone, cyclopentasiloxane", silitex: "DIMETHICONE 5–350 · CYCLOPENTASILOXANE PO200 · PHENYL TRIMETHICONE", d5free: "DIMETHICONE 5 / 10" },
  { role: "Volatile carrier", chem: "D5 / cyclic siloxanes", silitex: "CYCLOPENTASILOXANE (PO200) · ESABLEND (D5/D6)", d5free: "DIMETHICONE 1,5 cSt / DISILOXANE / C13-15 ALKANE / ISODODECANE" },
  { role: "Film former / wear", chem: "Trimethylsiloxysilicate (MQ), silicone copolyols", silitex: "IDROSIL (trimethylsiloxysilicate) · SILIBLEND DT 50", d5free: "IDROSIL in DIMETHICONE / alkane carrier" },
  { role: "Texture / cushion", chem: "Dimethicone crosspolymer elastomer gels", silitex: "SILIBLEND CROSS D (7% gel) · DIVICROSS (100% crosspolymer)", d5free: "SILIBLEND CROSS D (dimethicone carrier)" },
  { role: "Emulsifier W/Si, W/O", chem: "PEG/PPG-18/18 dimethicone, cetyl PEG/PPG dimethicone", silitex: "DIMETISIL 18/18 P · DIMEPOL 18/18 · PEG-10 DIMETHICONE", d5free: "DIMETISIL 18/18 P (100%, D5-free)" },
  { role: "Hair conditioning", chem: "Amodimethicone, silicone quats", silitex: "AMINOQUAT 250/350 · MACROAMISIL (E1386) · AMODIMETHICONE fluid", d5free: "MACROAMISIL E1386 / MICROAMISIL E1352" },
  { role: "Natural / silicone-free feel", chem: "Vegetal emollients, waxes", silitex: "EVEROIL 35 / EVERIX 35 · CARNAUBEX · WASPER D", d5free: "all" },
];
export const PRODUCT_TYPES = [
  { type: "Gel serum / water-gel cream", role: "Lightweight sensory base, spreadability", chem: "Volatile fluid + elastomer gel", silitex: "CYCLOPENTASILOXANE or DIMETHICONE 1,5 cSt + SILIBLEND CROSS D" },
  { type: "Sunscreen", role: "Carrier, water resistance, sensory", chem: "Volatile silicone + film former", silitex: "ISODODECANE / CYCLOPENTASILOXANE + IDROSIL + DIMEPOL 18/18" },
  { type: "Primer / foundation", role: "Slip, blur, soft-focus, wear", chem: "Elastomer + dimethicone + film former", silitex: "SILIBLEND CROSS D + DIMETHICONE 100 + IDROSIL" },
  { type: "Cleansing balm", role: "Oil-phase solvent, rinse-off feel", chem: "Silicone fluids / volatile carrier", silitex: "DIMETHICONE 5–50 (or EVEROIL 35 for natural claim)" },
  { type: "Hair oil / treatment", role: "Conditioning, shine, detangling", chem: "Dimethicone + amodimethicone", silitex: "DIMETHICONE 350 + AMODIMETHICONE fluid / MACROAMISIL (E1386)" },
  { type: "Lip products", role: "Gloss, slip, wear", chem: "Silicone fluids + film former", silitex: "DIMETHICONE 1000 + IDROSIL + PHENYL TRIMETHICONE" },
  { type: "Hand cream / body lotion", role: "Non-tacky after-feel, emolliency", chem: "Elastomer gel + light fluid", silitex: "SILIBLEND CROSS D + DIMETHICONE 10 (see CareSil 729-AAL-69 pattern)" },
];
export const SIW_PATTERN = ["Prepare the water phase separately (water, humectants, water-soluble actives).", "Prepare the silicone/oil phase with the silicone emulsifier (PEG/PPG-18/18 dimethicone type — Silitex DIMETISIL 18/18 P) and the silicone fluids/gel.", "Add the water phase SLOWLY into the silicone phase under mixing.", "High-shear (rotor-stator) 10–30 min until uniform; cool; add fragrance/preservative below 40°C.", "Dry-touch variant: D5 (CM 040) as volatile carrier + 1–3% non-volatile dimethicone (DM 100–350) for residual smoothness; add elastomer gel for cushion/soft-focus."];
