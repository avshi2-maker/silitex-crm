// data.ts (src/portal/data.ts) · updated 20.10.2026 19:05 (Asia/Jerusalem) — no food-grade product pages (CPL 250 FOOD) · 20.10.2026 17:55 (Asia/Jerusalem) — + Italian industry names · 16:30 — + /complementary /flooring · 13:50 — + /group /ai in sitemap · 18.10.2026 17:50 — PUBLIC PORTAL data, built from the same files as the CRM (catalogue 2026, offsets table, FAQ, industry lines). Public-safe: no customer records, no owner strategy, no Israel market pitch, no food sector (on hold).
import offsets from "@/data/offsets.json";
import faq from "@/data/faq.json";
import { CAT26, type CatRow } from "@/lib/catalog";
import { INDUSTRIES } from "@/config/industries";
import { industryLine, QUESTIONS } from "@/lib/industry-lines";
import type { PLang } from "./config";
export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[®™]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
// ── industries
const IND_NAMES: Record<string, { en: string; ru: string; it: string }> = {
  water: { en: "Water & wastewater treatment", ru: "Водоподготовка и очистка стоков", it: "Trattamento acque e reflui" }, agro: { en: "Agrochemicals & fertilisers", ru: "Агрохимия и удобрения", it: "Agrochimica e fertilizzanti" },
  textile: { en: "Textiles", ru: "Текстиль", it: "Tessile" }, paper: { en: "Paper & packaging", ru: "Бумага и упаковка", it: "Carta e imballaggio" }, paint: { en: "Paints & coatings", ru: "Краски и покрытия", it: "Pitture e rivestimenti" },
  clean: { en: "Detergents & cleaning", ru: "Моющие средства", it: "Detergenza e pulizia" }, build: { en: "Construction & sealing", ru: "Строительство и гидроизоляция", it: "Edilizia e impermeabilizzazione" },
  plastic: { en: "Plastics & rubber", ru: "Пластмассы и резина", it: "Plastica e gomma" }, auto: { en: "Automotive & polishes", ru: "Автохимия и полироли", it: "Automotive e polish" },
  cosm: { en: "Cosmetics", ru: "Косметика", it: "Cosmetica" }, metal: { en: "Metal & heavy industry", ru: "Металлообработка и тяжёлая промышленность", it: "Metalli e industria pesante" },
};
export type PInd = { key: string; name: Record<PLang, string> };
export const P_INDUSTRIES: PInd[] = INDUSTRIES.filter((i) => i.key !== "food" && IND_NAMES[i.key]).map((i) => ({ key: i.key, name: { he: i.he, en: IND_NAMES[i.key].en, ru: IND_NAMES[i.key].ru, it: IND_NAMES[i.key].it } }));
export const industryRows = (key: string) => industryLine(key).rows;
export const industryQuestions = (key: string) => QUESTIONS[key] || [];
// ── products (catalogue 2026, food sector excluded), one page per product name
export type PProduct = CatRow & { slug: string };
const seen = new Set<string>();
export const P_PRODUCTS: PProduct[] = CAT26.filter((r) => r.sector !== "Food & Agri" && !/\bfood\b/i.test(r.product)).filter((r) => { const k = r.product.toUpperCase().trim(); if (seen.has(k)) return false; seen.add(k); return true; }).map((r) => ({ ...r, slug: slugify(r.product + (r.code ? "-" + r.code : "")) }));
export const productBySlug = (s: string) => P_PRODUCTS.find((p) => p.slug === s);
export const productSlugFor = (name: string) => P_PRODUCTS.find((p) => p.product.toUpperCase() === name.toUpperCase().trim())?.slug;
export const P_SECTORS = Array.from(new Set(P_PRODUCTS.map((p) => p.sector)));
// ── alternatives (offsets table): one page per product family
type OffRow = { category_id: string; family: string; dow_corning: string; inci: string; silitex_product: string; kosher: string; fda: string; eco_certs: string; offsets: Record<string, string> };
export type PFamily = OffRow & { slug: string; codes: { producer: string; code: string }[]; silitexNames: string[] };
const ROWS = (offsets as { rows: OffRow[] }).rows;
export const P_FAMILIES: PFamily[] = ROWS.map((r) => {
  const codes = [{ producer: "Dow / DOWSIL / XIAMETER", code: r.dow_corning }, ...Object.entries(r.offsets).map(([producer, code]) => ({ producer, code }))].filter((c) => c.code && !/^n\/?a\b/i.test(c.code));
  const silitexNames = r.silitex_product.split(" - ")[0].replace(/\(.*?\)/g, "").split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean);
  return { ...r, silitex_product: r.silitex_product.replace(/\s+—\s+full lines.*$/i, ""), slug: slugify(r.family) || r.category_id.toLowerCase(), codes, silitexNames };
});
export const familyBySlug = (s: string) => P_FAMILIES.find((f) => f.slug === s);
/** catalogue products named in a family's Silitex column (for links to product pages) */
export const familyProducts = (f: PFamily) => { const t = f.silitex_product.toUpperCase(); return P_PRODUCTS.filter((p) => p.product.length >= 4 && t.includes(p.product.toUpperCase())).slice(0, 8); };
// ── FAQ (public-safe categories only)
type Faq = { n: number; cat: string; q: string; a: string; src: string };
export const P_FAQ: Faq[] = (faq as { items: Faq[] }).items.filter((f) => f.cat !== "Israel" && f.cat !== "Food grade");
// ── every portal page path (without the /lang prefix) — sitemap
export function portalPaths(): string[] {
  return ["", "/industries", "/alternatives", "/products", "/faq", "/regulation", "/group", "/ai", "/complementary", "/flooring", "/match", ...P_INDUSTRIES.map((i) => "/industries/" + i.key), ...P_FAMILIES.map((f) => "/alternatives/" + f.slug), ...P_PRODUCTS.map((p) => "/products/" + p.slug)];
}
