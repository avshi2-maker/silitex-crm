// need-search.ts (src/portal/need-search.ts) · updated 20.10.2026 19:05 (Asia/Jerusalem) — no food-grade products · created 18:40 — PUBLIC PORTAL: free-text "what do you need" search (he / en / ru / it) over the Silitex 2026 catalogue (no food) — e.g. "קרם הגנה לשמש" → skin emollients / emulsions. Pure client-side, no AI cost. Used by CodeFinder when the competitor-code search finds nothing.
import { CAT26, type CatRow } from "@/lib/catalog";
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[®™]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
export type NeedHit = CatRow & { slug: string; score: number };
const seen = new Set<string>();
const ROWS = CAT26.filter((r) => r.sector !== "Food & Agri" && !/\bfood\b/i.test(r.product)).filter((r) => { const k = r.product.toUpperCase().trim(); if (seen.has(k)) return false; seen.add(k); return true; })
  .map((r) => ({ r, name: (r.product + " " + r.inci).toLowerCase(), hay: (r.section + " " + r.type + " " + r.description + " " + r.application + " " + r.sector).toLowerCase() }));
/** local word (stem) → English catalogue words */
const DICT: [string, string[]][] = [
  ["קרם", ["cream", "emulsion", "emollient"]], ["שמש", ["sun", "uv", "spf", "emollient"]], ["קרינ", ["uv"]], ["עור", ["skin"]], ["שיער", ["hair"]], ["שמפו", ["shampoo", "hair"]],
  ["מרכך", ["conditioner", "softener", "softening"]], ["ריכוך", ["softener", "softening"]], ["לחות", ["moistur", "emollient"]], ["איפור", ["make-up", "makeup", "colour", "color"]], ["שפתון", ["lipstick", "lip"]],
  ["דאודורנט", ["deodorant", "antiperspirant"]], ["סבון", ["soap", "cleans"]], ["ניקוי", ["clean", "detergent"]], ["כביסה", ["laundry", "detergent"]], ["כלים", ["dishwash"]],
  ["קצף", ["foam", "antifoam", "defoam"]], ["תבני", ["release", "mould", "mold"]], ["שחרור", ["release"]], ["טקסטיל", ["textile", "fabric"]], ["=בד", ["textile", "fabric"]], ["בדים", ["textile", "fabric"]], ["נייר", ["paper"]],
  ["צבע", ["paint", "coating"]], ["ציפוי", ["coating"]], ["מים", ["water"]], ["דוחה", ["repellent", "hydrophob"]], ["ברק", ["gloss", "shine", "polish"]], ["הברק", ["polish", "shine"]], ["רכב", ["car", "auto"]],
  ["שפכים", ["wastewater", "effluent"]], ["גומי", ["rubber"]], ["פלסטיק", ["plastic"]], ["שמן", ["oil"]], ["סיכה", ["lubric"]], ["=חום", ["heat", "temperature"]], ["איטום", ["seal"]], ["דבק", ["adhesive"]],
  ["אמולסי", ["emulsion"]], ["החלק", ["slip"]], ["פיזור", ["dispers"]], ["הרטב", ["wetting"]], ["=דיו", ["ink"]], ["עץ", ["wood"]], ["בטון", ["concrete"]], ["אבן", ["stone"]], ["מתכת", ["metal"]], ["שעו", ["wax"]],
  ["טבעי", ["natural", "vegetable"]], ["מתכל", ["biodegradable"]], ["ציפורנ", ["nail"]], ["תינוק", ["baby"]], ["גילוח", ["shav"]],
  ["крем", ["cream", "emulsion", "emollient"]], ["солн", ["sun", "uv", "spf"]], ["волос", ["hair"]], ["кож", ["skin"]], ["пен", ["foam", "antifoam"]], ["краск", ["paint", "coating"]], ["текстил", ["textile"]], ["бумаг", ["paper"]], ["мыл", ["soap"]], ["вод", ["water"]],
  ["crema", ["cream", "emulsion", "emollient"]], ["solar", ["sun", "uv", "spf"]], ["capell", ["hair"]], ["pelle", ["skin"]], ["schium", ["foam", "antifoam"]], ["vernic", ["paint", "coating"]], ["tessil", ["textile"]], ["carta", ["paper"]], ["sapon", ["soap"]], ["distacc", ["release"]], ["acqua", ["water"]],
];
const HE_PREFIX = /^[והבלמש]{1,2}(?=[֐-׿]{3,})/;
const STOP = new Set(["for", "the", "and", "with", "של", "עם", "או", "גם", "для", "per", "con"]);
export function needWords(q: string): string[] {
  const out = new Set<string>();
  for (const raw of q.toLowerCase().split(/[^a-z0-9֐-׿Ѐ-ӿàèéìòù-]+/)) {
    if (raw.length < 2 || STOP.has(raw)) continue;
    const variants = [raw, raw.replace(HE_PREFIX, "")];
    let hit = false;
    for (const [k, en] of DICT) if (variants.some((v) => (k[0] === "=" ? v === k.slice(1) : v.startsWith(k) || (k.length >= 4 && v.includes(k))))) { en.forEach((e) => out.add(e)); hit = true; }
    if (!hit && /^[a-z0-9-]{3,}$/.test(raw)) out.add(raw.replace(/s$/, ""));
  }
  return Array.from(out);
}
export function needSearch(q: string, max = 6): NeedHit[] {
  const w = needWords(q); if (!w.length) return [];
  return ROWS.map(({ r, name, hay }) => ({ r, score: w.reduce((n, x) => n + (name.includes(x) ? 3 : 0) + (hay.includes(x) ? 1 : 0), 0) }))
    .filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, max).map(({ r, score }) => ({ ...r, slug: slugify(r.product), score }));
}
/** compact catalogue for the AI answer (server) */
export const catalogLines = () => ROWS.map(({ r }) => [r.product, r.sector, r.inci, r.description.slice(0, 90)].filter(Boolean).join(" | ")).join("\n");
export const slugOfProduct = (name: string) => { const n = name.toUpperCase().trim(); const row = ROWS.find(({ r }) => r.product.toUpperCase().trim() === n); return row ? slugify(row.r.product) : null; };
