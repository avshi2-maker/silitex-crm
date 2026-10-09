// data.ts (src/lib/data.ts) · updated 09.10.2026 10:05 (Asia/Jerusalem)
// Bundled assets (src/data/*.json) — the read-only catalog layer. Mutable CRM state lives in store.ts.
import products from "@/data/products.json";
import offsets from "@/data/offsets.json";
import foodGrade from "@/data/food_grade.json";
import leadsSeed from "@/data/leads.json";
import priorities from "@/data/priorities.json";
import type { Product, OffsetRow, FoodGrade, Lead, Priority } from "./types";

export const PRODUCTS = products as Product[];
export const OFFSETS = offsets as { producers: string[]; rows: OffsetRow[] };
export const FOOD_GRADE = foodGrade as FoodGrade[];
export const LEADS_SEED = leadsSeed as Lead[];
export const PRIORITIES = priorities as Priority[];

export { INDUSTRIES } from "@/config/industries";
import { INDUSTRIES as _IND } from "@/config/industries";
export function industriesOf(p: Product): string[] {
  const hay = p.application_field + " " + p.category_sector + " " + p.key_features;
  return _IND.filter((i) => i.match.test(hay)).map((i) => i.key);
}
export function productById(id: string): Product | undefined { return PRODUCTS.find((p) => p.id === id); }
export function offsetForProduct(p: Product): OffsetRow | undefined {
  const fam = p.brand_family.split(" ")[0].toUpperCase();
  return OFFSETS.rows.find((r) => r.silitex_product.toUpperCase().includes(fam));
}
