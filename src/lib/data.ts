// data.ts (src/lib/data.ts) · updated 09.10.2026 09:10 (Asia/Jerusalem)
// Bundled assets (src/data/*.json) — the read-only catalog layer. Mutable CRM state lives in store.ts.
import products from "@/data/products.json";
import offsets from "@/data/offsets.json";
import foodGrade from "@/data/food_grade.json";
import leadsSeed from "@/data/leads.json";
import type { Product, OffsetRow, FoodGrade, Lead } from "./types";

export const PRODUCTS = products as Product[];
export const OFFSETS = offsets as { producers: string[]; rows: OffsetRow[] };
export const FOOD_GRADE = foodGrade as FoodGrade[];
export const LEADS_SEED = leadsSeed as Lead[];

export const INDUSTRIES: { key: string; he: string; match: RegExp }[] = [
  { key: "food", he: "מזון ומשקאות", match: /food|beverage|sugar|yeast|ferment|kosher|bottling/i },
  { key: "water", he: "טיפול במים ושפכים", match: /water|wastewater|effluent|aeration|sludge/i },
  { key: "agro", he: "אגרוכימיה ודשנים", match: /agro|fertig|spray|crop|organic agro/i },
  { key: "textile", he: "טקסטיל", match: /textile|fabric|yarn|dyeing|towel|apparel|garment|microfiber|activewear|sewing/i },
  { key: "paper", he: "נייר ואריזה", match: /paper|pulp|tissue|cardboard|packaging|cellulose/i },
  { key: "paint", he: "צבעים וציפויים", match: /paint|coating|ink|adhesive|varnish/i },
  { key: "clean", he: "דטרגנטים וניקוי", match: /detergent|clean|cip|laundry|washing/i },
  { key: "build", he: "בנייה ואיטום", match: /masonry|concrete|mortar|stone|building/i },
  { key: "plastic", he: "פלסטיק וגומי", match: /mold|rubber|plastic|molding|welding|gasket/i },
  { key: "auto", he: "רכב ופוליש", match: /automotive|tire|polish|car/i },
  { key: "cosm", he: "קוסמטיקה", match: /cosmetic|hair/i },
  { key: "metal", he: "מתכת ותעשייה כבדה", match: /metal|mining|drilling|hydrocarbon|slurry|electronics/i },
];
export function industriesOf(p: Product): string[] {
  const hay = p.application_field + " " + p.category_sector + " " + p.key_features;
  return INDUSTRIES.filter((i) => i.match.test(hay)).map((i) => i.key);
}
export function productById(id: string): Product | undefined { return PRODUCTS.find((p) => p.id === id); }
export function offsetForProduct(p: Product): OffsetRow | undefined {
  const fam = p.brand_family.split(" ")[0].toUpperCase();
  return OFFSETS.rows.find((r) => r.silitex_product.toUpperCase().includes(fam));
}
