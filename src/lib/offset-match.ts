// offset-match.ts (src/lib/offset-match.ts) · updated 12.10.2026 10:50 (Asia/Jerusalem)
// Match a historical product name (as sold by Sapirim: Dow Corning / Wacker / Momentive / Evonik / Shin-Etsu …) to the Silitex offset table (offsets.json). Token overlap scoring; returns best row + confidence.
import offsets from "@/data/offsets.json";
type Row = { category_id: string; family: string; dow_corning?: string; inci?: string; silitex_product: string; kosher?: string; fda?: string; eco_certs?: string; offsets?: Record<string, string> };
const ROWS = (offsets as { rows: Row[] }).rows;
const STOP = new Set(["dow", "corning", "xiameter", "dowsil", "fluid", "emulsion", "series", "and", "the", "silicone", "wacker", "momentive", "evonik", "shin", "etsu", "belsil", "silfoam", "silres", "abil", "tego", "silsoft", "mirasil", "kf"]);
const toks = (s: string) => s.toLowerCase().replace(/[®™]/g, " ").split(/[^a-z0-9]+/).filter((t) => t.length > 1 && !STOP.has(t));
export type OffsetHit = { row: Row; score: number; silitex: string; via: string };
export function matchOffset(product: string): OffsetHit | null {
  const q = toks(product); if (!q.length) return null; let best: OffsetHit | null = null;
  for (const r of ROWS) {
    const fields: [string, string][] = [["Dow Corning", r.dow_corning || ""], ["family", r.family], ["INCI", r.inci || ""], ...Object.entries(r.offsets || {})];
    for (const [via, text] of fields) {
      const t = new Set(toks(text)); if (!t.size) continue;
      let hit = 0, numHit = 0; for (const x of q) if (t.has(x)) { hit++; if (/\d/.test(x)) numHit++; }
      const score = hit / q.length + numHit * 0.5; // numbers (grade codes) weigh more
      if (hit && (!best || score > best.score)) best = { row: r, score, silitex: r.silitex_product.split(" - ")[0], via };
    }
  }
  return best && best.score >= 0.34 ? best : null;
}
export const offsetRows = () => ROWS;
