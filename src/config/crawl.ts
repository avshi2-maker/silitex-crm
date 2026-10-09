// crawl.ts (src/config/crawl.ts) · updated 09.10.2026 10:05 (Asia/Jerusalem)
// silitex.it crawl seeds. Category pages link to product pages under the same path. Add/remove categories here.
export const SILITEX_BASE = "https://www.silitex.it";
export const CATEGORY_PATH = "/en/products/range-of-products/";
export const CATEGORIES = [
  "silicone-antifoams", "silicone-free-antifoams-and-deaerating-agents", "antifoams-food-grade", "antifoams-for-high-temperature",
  "silicone-polyether-antifoams", "vegetal-based-antifoams", "fatty-alcohols-based-antifoams", "powdered-antifoams", "solvent-based-antifoams",
  "wetting-and-levelling-additives-for-water-based-systems", "cationic-softeners", "silicone-based-softeners", "emulsions", "microemulsions", "nanoemulsions",
  "silicone-finishing-for-leather", "rubber-and-plastic-detaching-agents", "welding-detaching-agents", "antistatic-additives-for-offset",
  "water-based-wax-emulsions", "wax-and-lubricant-for-sewing-yarn", "water-repellent-and-stain-resistant-agents", "lubricants-sliding-antistatics",
  "silicone-rubbers", "silicone-pastes-greases", "silicone-linear-fluids", "non-silicone-fluids", "water-emulsion-resins", "solvent-based-resins",
  "silicone-raw-materials", "polyelectrolites", "de-emulsifier-agents", "detergents", "aerosol-cans",
];
export const MAX_PRODUCTS_PER_CALL = 40;
export const FETCH_TIMEOUT_MS = 12000;
