// industry-list.ts (src/config/industry-list.ts) · updated 23.10.2026 16:25 (Asia/Jerusalem) — + Sealants & Construction Chemicals, Metal Surface Treatment, Mining & Minerals (gaps found on Brenntag Israel industries page) · 06:10 — + Flame Retardants & Fire Safety · created 22.10.2026 16:55 (Asia/Jerusalem) — the CRM's customer industries (same names as the customer list) for the 🔽 pick-lists + the website scan's automatic classification. "לסיווג" = not classified yet → the next scan fills it.
export const INDUSTRY_LIST = [
  "Personal Care & Cosmetics", "Paints, Coatings & Varnishes", "Water Treatment & Purification", "Detergents & Cleaning Formulations",
  "Hygiene, Tissue & Nonwovens", "Oil, Gas & Hydrocarbons", "Adhesives, Labels & Release Coatings", "Pharmaceutical & OTC (non-food)",
  "Paper & Packaging", "Rubber & Plastics Processing", "Textiles & Technical Fabrics", "Agriculture & Agrochemicals",
  "Irrigation & Water Equipment", "Car Care & Ceramic Coatings", "Lubricants & Metalworking Fluids", "Power Generation & Cooling Water",
  "Water Repellents & Building Protection", "Food & Bio-Fermentation", "Metalworking & Machining", "Electronics & Electrical", "Flame Retardants & Fire Safety",
  "Sealants & Construction Chemicals", "Metal Surface Treatment", "Mining & Minerals (Potash / Phosphate)",
];
export const UNCLASSIFIED = "לסיווג";
/** empty / "לסיווג" (also its saved translations) / old "אחר" = waiting for classification */
export const isUnclassified = (v?: string) => !v || /^(לסיווג|אחר|other|to classify|da classificare|для классификации|altro|другое)$/i.test(v.trim());
/** pick-list: the fixed list + any other industry already used by a customer */
export const industryOptions = (used: string[] = []) => Array.from(new Set([...INDUSTRY_LIST, ...used.filter((u) => u && !isUnclassified(u))])).sort();
