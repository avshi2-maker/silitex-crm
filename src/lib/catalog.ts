// catalog.ts (src/lib/catalog.ts) · updated 12.10.2026 12:20 (Asia/Jerusalem)
// Truth list of Silitex product names scraped from silitex.it (35 category pages, 318 names). isCatalog() lets the UI flag any SKU string that is NOT a real Silitex product.
import site from "@/data/silitex_catalog_site.json";
type SiteProduct = { name: string; categories: string[]; desc_en: string };
const PRODUCTS = (site as { products: SiteProduct[] }).products;
const NAMES = PRODUCTS.map((p) => p.name.toUpperCase());
const FAMILIES = Array.from(new Set(NAMES.map((n) => n.replace(/\s*\(.*\)\s*/g, "").split(/\s+\d/)[0].trim()))).filter((f) => f.length >= 4);
/** exact or family match against the scraped catalogue */
export function isCatalog(token: string): boolean {
  const t = token.toUpperCase().replace(/\s*\(.*?\)\s*/g, " ").trim();
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
  return toks.every((t) => isCatalog(t) || /^(no |not |second supplier|cosmetic|D5|silane)/i.test(t)) ? "ok" : "unknown";
}
export function siteDesc(name: string): string | undefined {
  const n = name.toUpperCase().replace(/\s*\(.*?\)\s*/g, " ").trim();
  return PRODUCTS.find((p) => p.name.toUpperCase() === n || n.startsWith(p.name.toUpperCase() + " "))?.desc_en;
}
export const CATALOG_COUNT = PRODUCTS.length;
