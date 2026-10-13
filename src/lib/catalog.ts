// catalog.ts (src/lib/catalog.ts) · updated 13.10.2026 06:10 (Asia/Jerusalem)
// Truth list of Silitex product names = 5 sector catalogues 2026 (data/catalog_2026.json, from Federica 13/10/2026) ∪ silitex.it scrape (data/silitex_catalog_site.json, 12/10/2026). isCatalog() lets the UI flag any SKU string that is NOT a real Silitex product.
import site from "@/data/silitex_catalog_site.json";
import cat26 from "@/data/catalog_2026.json";
type SiteProduct = { name: string; categories: string[]; desc_en: string };
export type CatRow = { id: string; code: string; product: string; sector: string; section: string; inci: string; type: string; active_pct: string; description: string; application: string; dosage: string; compliance: string; notes: string; pdf: string; edition: string };
const SITE = (site as { products: SiteProduct[] }).products;
export const CAT26 = (cat26 as { rows: CatRow[] }).rows;
const NAMES = Array.from(new Set([...SITE.map((p) => p.name.toUpperCase()), ...CAT26.map((r) => r.product.toUpperCase())]));
const FAMILIES = Array.from(new Set(NAMES.map((n) => n.replace(/\s*\(.*\)\s*/g, "").split(/\s+\d/)[0].trim()))).filter((f) => f.length >= 4);
/** exact or family match against the merged catalogue */
export function isCatalog(token: string): boolean {
  const t = token.toUpperCase().replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
  if (t.length < 3) return true;
  if (NAMES.includes(t)) return true;
  return FAMILIES.some((f) => t === f || t.startsWith(f + " "));
}
/** split a matrix cell like "MICROAMISIL (41 / C) & EVERSIL 35" into product tokens; GAP-xxx tokens are "declared gaps", not phantoms */
export function tokensOf(cell: string): string[] {
  return cell.split(/\s*&\s*|,\s*|\s+—\s+/).map((s) => s.replace(/\(.*?\)/g, "").split(" / ")[0].trim()).filter((s) => s.length >= 3);
}
export type Verdict = "ok" | "gap" | "unknown";
export function verdictOf(cell: string): Verdict {
  if (/GAP-\d{3}/.test(cell)) return "gap";
  const toks = tokensOf(cell);
  return toks.every((t) => isCatalog(t) || /^(no |not |second supplier|cosmetic|D5|silane|elastomer)/i.test(t)) ? "ok" : "unknown";
}
/** 2026 catalogue rows for a product name (may be several sectors) */
export function catRows(name: string): CatRow[] {
  const n = name.toUpperCase().replace(/\s*\(.*?\)\s*/g, " ").trim();
  return CAT26.filter((r) => r.product.toUpperCase() === n || n.startsWith(r.product.toUpperCase() + " "));
}
export function siteDesc(name: string): string | undefined {
  const n = name.toUpperCase().replace(/\s*\(.*?\)\s*/g, " ").trim();
  return SITE.find((p) => p.name.toUpperCase() === n || n.startsWith(p.name.toUpperCase() + " "))?.desc_en;
}
export const CATALOG_COUNT = NAMES.length;
export const SECTORS = Array.from(new Set(CAT26.map((r) => r.sector)));
export const PDFS: Record<string, string> = { Cosmetics: "/catalogues/SILITEX_Cosmetics_2026.pdf", Detergency: "/catalogues/SILITEX_Detergency_2026.pdf", "Food & Agri": "/catalogues/SILITEX_FoodBeverages_2026.pdf", "Paint & Coating": "/catalogues/SILITEX_PaintCoating_2026.pdf", "Water Treatment": "/catalogues/SILITEX_Water_Treatment_2026.pdf" };
