// cosmetic-range.ts (src/config/cosmetic-range.ts) · updated 19.10.2026 12:45 (Asia/Jerusalem) — SILITEX RULE (Federica, 19/10/2026): for cosmetics propose ONLY products of the Silitex Cosmetic range. Official countertype table first (leaflet), then the rest of the Cosmetics 2026 catalogue. Detergency / agro maps wait for Silitex review.
import table from "@/data/silitex_cosmetic_countertypes.json";
import { CAT26 } from "@/lib/catalog";
export type CounterRow = { code: string; product: string; inci: string; dow: string; brb: string; momentive: string; wacker: string };
export const COSMETIC_COUNTERTYPES = (table as { rows: CounterRow[] }).rows;
export const COSMETIC_LEAFLET = COSMETIC_COUNTERTYPES.map((r) => r.product);
/** every product in the Silitex Cosmetics 2026 catalogue (the cosmetic range) */
export const COSMETIC_RANGE: string[] = Array.from(new Set(CAT26.filter((r) => /cosmetic/i.test(r.sector)).map((r) => r.product.toUpperCase())));
export const isCosmeticProduct = (name: string) => { const n = name.toUpperCase().trim(); return COSMETIC_LEAFLET.some((p) => p.toUpperCase() === n) || COSMETIC_RANGE.includes(n); };
export const REVIEW_PENDING_SECTORS = ["Detergency", "Agro"]; // Federica 19/10/2026: product maps to be reviewed by Silitex before use
