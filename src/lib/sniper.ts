// sniper.ts (src/lib/sniper.ts) · updated 09.10.2026 10:05 (Asia/Jerusalem)
// Offset Sniper: map a customer's current competitor purchase lines → Silitex equivalents. Pure, client-safe.
import { PRODUCTS, OFFSETS } from "./data";
import type { SniperHit } from "./types";
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
function tokens(s: string): string[] { return norm(s).split(" ").filter((t) => t.length > 1); }
function overlap(a: string[], b: string[]): number {
  let n = 0; for (const t of a) if (b.includes(t)) n += /^\d/.test(t) ? 2 : 1; // numbers (SAG 30, 1520) weigh more
  return n;
}
export function snipe(line: string): SniperHit[] {
  const q = tokens(line); if (!q.length) return [];
  const hits: SniperHit[] = [];
  for (const p of PRODUCTS) {
    const s = overlap(q, tokens(p.dow_corning_offset_benchmark));
    if (s >= 2) hits.push({ query: line, product: p.product_name, family: p.brand_family, category: p.category_sector, via: p.dow_corning_offset_benchmark, score: s });
  }
  for (const r of OFFSETS.rows) {
    const cells = [r.dow_corning, ...Object.values(r.offsets)].filter((v) => v && v !== "N/A");
    for (const c of cells) {
      const s = overlap(q, tokens(c));
      if (s >= 2) hits.push({ query: line, product: r.silitex_product.split(" - ")[0], family: r.family, category: r.category_id, via: c, score: s });
    }
  }
  const best = new Map<string, SniperHit>();
  for (const h of hits) { const k = h.product; if (!best.has(k) || best.get(k)!.score < h.score) best.set(k, h); }
  return Array.from(best.values()).sort((a, b) => b.score - a.score).slice(0, 3);
}
export function snipeAll(text: string): { line: string; hits: SniperHit[] }[] {
  return text.split(/\n|;|,(?=\s*[A-Za-z])/).map((l) => l.trim()).filter(Boolean).map((line) => ({ line, hits: snipe(line) }));
}
