// equiv-search.ts (src/lib/equiv-search.ts) · updated 26.10.2026 11:20 (Asia/Jerusalem) — v0.99.0 every hit carries verified (official leaflet / NuSil docs / catalogue) or not · updated 19.10.2026 12:45 (Asia/Jerusalem) — + official Silitex cosmetic countertypes (leaflet 19/10/2026) first · 18.10.2026 12:20 — uses gaps_lite.json (no owner action notes in the browser) · 16.10.2026 08:45 — + NuSil CareSil CSF-3504 / CXG-1104
// Competitor-code quick search: type any Dow / XIAMETER / Wacker / Momentive / Shin-Etsu / Evonik … code (or a Silitex name, code or INCI)
// → ranked Silitex equivalents. Sources: offsets.json (37 families × producers), gaps.json (cosmetic molecules, covered/alternative only),
// catalog_2026.json (Silitex 2026 catalogues — for the catalogue rows + PDF behind each answer). Pure client-side, no AI cost.
import offsets from "@/data/offsets.json";
import gaps from "@/data/gaps_lite.json"; // lite copy (no owner action notes) — built by scripts/build-index.mjs
import { CAT26, type CatRow } from "@/lib/catalog";
import { COSMETIC_COUNTERTYPES } from "@/config/cosmetic-range";
import { isVerifiedProducer } from "./offsets-trust";

type OffRow = { category_id: string; family: string; dow_corning?: string; inci?: string; silitex_product: string; kosher?: string; fda?: string; eco_certs?: string; offsets?: Record<string, string> };
type GapRow = { id: string; query: string; aliases: string[]; producers: string; silitex: string; status: string };
export type EquivHit = {
  key: string; kind: "offset" | "gap" | "catalogue";
  competitor: string; producer: string; family: string; inci: string;
  silitex: string; silitexNames: string[]; certs: string[]; ref: string;
  exact: boolean; score: number; rows: CatRow[]; also: string[];
  /** true only for verified sources (Silitex official countertype leaflet, NuSil CareSil docs, Silitex catalogue) — else show ⚠ unverified */
  verified: boolean;
};
type Entry = Omit<EquivHit, "exact" | "score" | "rows" | "also"> & { norm: string; toks: string[] };

const ROWS = (offsets as { rows: OffRow[] }).rows;
const GAPS = gaps as GapRow[];
const norm = (s: string) => s.toLowerCase().replace(/[®™]/g, "").replace(/[^a-z0-9]/g, "");
const STOP = new Set(["dow", "corning", "dowsil", "xiameter", "fluid", "emulsion", "series", "and", "the", "silicone", "for", "with", "type", "grade"]);
const toks = (s: string) => s.toLowerCase().replace(/[®™]/g, " ").split(/[^a-z0-9]+/).filter((t) => t.length > 1 && !STOP.has(t));
/** split "A / B, C; D · E" on top-level separators only (keeps "(5-1,000 cSt)" intact) */
function splitSkus(s: string): string[] {
  const out: string[] = []; let depth = 0, cur = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i]; if (c === "(") depth++; if (c === ")") depth = Math.max(0, depth - 1);
    const sep = depth === 0 && (c === ";" || c === "," || c === "·" || (c === "/" && s[i - 1] === " " && s[i + 1] === " "));
    if (sep) { out.push(cur); cur = ""; } else cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter((x) => x && !/^n\/?a\b/i.test(x));
}
const CODE_RE = /\b(PO\d{3}|H\d{4}|E\d{3,4})\b/g;
/** Silitex catalogue codes quoted in a text (PO594, H2296 …) → catalogue rows */
const rowsByCode = (s: string): CatRow[] => { const codes = Array.from(new Set(s.match(CODE_RE) || [])); return codes.map((c) => CAT26.find((r) => r.code === c)).filter((r): r is CatRow => !!r); };

/** "AMINOQUAT (250 / 350 / 1000) - text · ESABLEND (…)" → ["AMINOQUAT", "ESABLEND"] */
export function silitexNames(s: string): string[] {
  const out: string[] = [];
  for (const part of s.split(/\s+·\s+/)) {
    const head = part.split(/\s+-\s+/)[0].replace(/\(.*?\)/g, "").replace(/^(COVERED|NOT|No)\b.*?:\s*/i, "").trim();
    for (const n of head.split(/\s+\/\s+/)) { const t = n.trim().toUpperCase(); if (t.length >= 3 && /^[A-Z0-9][A-Z0-9 .,'+-]*$/.test(t)) out.push(t); }
  }
  return Array.from(new Set(out));
}
/** catalogue rows behind a Silitex name (exact first, then same family prefix) */
export function catalogueRows(names: string[], max = 4, text = ""): CatRow[] {
  const seen = new Set<string>(); const out: CatRow[] = [];
  for (const r of rowsByCode(text)) if (!seen.has(r.id)) { seen.add(r.id); out.push(r); }
  for (const n of names) {
    const exact = CAT26.filter((r) => r.product.toUpperCase() === n);
    const fam = CAT26.filter((r) => r.product.toUpperCase().startsWith(n.split(/\s+\d/)[0]));
    for (const r of [...exact, ...fam]) if (!seen.has(r.id)) { seen.add(r.id); out.push(r); }
  }
  return out.slice(0, max);
}

let ENTRIES: Entry[] | null = null;
function entries(): Entry[] {
  if (ENTRIES) return ENTRIES;
  const out: Entry[] = [];
  const add = (e: Omit<Entry, "norm" | "toks" | "verified">) => out.push({ ...e, verified: e.ref.startsWith("SILITEX-COS-") || e.ref.startsWith("NUSIL-") || (e.kind === "offset" && !!e.producer && isVerifiedProducer(e.producer)), norm: norm(e.competitor), toks: toks(e.competitor + " " + e.producer) });
  // OFFICIAL Silitex cosmetic countertypes (leaflet from Federica, 19/10/2026) — listed first, marked as official
  for (const c of COSMETIC_COUNTERTYPES) {
    const base = { kind: "offset" as const, family: "Cosmetic range (official Silitex countertype)", inci: c.inci, silitex: c.product + " (" + c.code + ")", silitexNames: [c.product.toUpperCase()], certs: ["✓ Silitex official"], ref: "SILITEX-COS-" + c.code };
    for (const [prod, v] of [["Dow / DOWSIL / XIAMETER", c.dow], ["BRB", c.brb], ["Momentive", c.momentive], ["Wacker", c.wacker]] as [string, string][]) for (const sku of splitSkus(v)) { add({ ...base, key: base.ref + "|" + prod + "|" + sku, competitor: sku, producer: prod }); const dc = /DOW CORNING\s+(\S+)/i.exec(sku); if (dc) add({ ...base, key: base.ref + "|dc|" + dc[1], competitor: "DC " + dc[1], producer: prod }); }
  }
  for (const r of ROWS) {
    const certs = [r.kosher && !/^no/i.test(r.kosher) ? "Kosher" : "", r.fda && !/^no/i.test(r.fda) ? "FDA" : ""].filter(Boolean);
    const base = { kind: "offset" as const, family: r.family, inci: r.inci || "", silitex: r.silitex_product, silitexNames: silitexNames(r.silitex_product), certs, ref: r.category_id };
    for (const sku of splitSkus(r.dow_corning || "")) add({ ...base, key: r.category_id + "|Dow|" + sku, competitor: sku, producer: "Dow / DOWSIL / XIAMETER" });
    for (const [p, v] of Object.entries(r.offsets || {})) for (const sku of splitSkus(v)) add({ ...base, key: r.category_id + "|" + p + "|" + sku, competitor: sku, producer: p });
  }
  // today's NuSil CareSil spot products (pitch NUSIL_SWITCH) — so the live demo answers them too
  const EXTRA: [string, string, string, string][] = [
    ["CareSil CSF-3504", "NuSil (Avantor)", "Dimethicone (and) Dimethiconol — gum blend 50 %", "DIMETIBLEND (H2057) · ALKABLEND 6800 (H2256)"],
    ["CareSil CXG-1104", "NuSil (Avantor)", "Dimethicone (and) Dimethicone/Vinyl Dimethicone Crosspolymer — elastomer gel 12 %", "SILIBLEND CROSS D (PO597) · DIVICROSS (PO680)"],
  ];
  for (const [comp, prod, chem, sil] of EXTRA) {
    const base = { kind: "offset" as const, family: chem.split(" — ")[1] || chem, inci: chem.split(" — ")[0], silitex: sil, silitexNames: Array.from(new Set(rowsByCode(sil).map((r) => r.product.toUpperCase()))), certs: [], ref: "NUSIL-" + comp.slice(-4) };
    add({ ...base, key: base.ref + "|" + comp, competitor: comp, producer: prod });
    add({ ...base, key: base.ref + "|short", competitor: comp.replace("CareSil ", ""), producer: prod });
  }
  for (const g of GAPS) {
    if (!/covered|alternative/.test(g.status)) continue;
    const text = g.silitex.replace(/^COVERED\s*—\s*/i, "");
    const names = Array.from(new Set(rowsByCode(text).map((r) => r.product.toUpperCase())));
    const base = { kind: "gap" as const, family: g.query, inci: g.query, silitex: text, silitexNames: names, certs: [], ref: g.id };
    for (const chunk of g.producers.split(/\s+·\s+/)) {
      const producer = chunk.trim().split(/\s+/)[0]; const rest = chunk.trim().slice(producer.length).replace(/^\s*\/\s*/, "");
      const brand = rest.split(/\s+/)[0]; let first = true;
      for (const sku of splitSkus(rest)) { add({ ...base, key: g.id + "|" + producer + "|" + sku, competitor: first || !/^\d/.test(sku) ? sku : brand + " " + sku, producer }); first = false; }
    }
    for (const a of g.aliases) add({ ...base, key: g.id + "|alias|" + a, competitor: a, producer: "" });
  }
  ENTRIES = out; return out;
}

/** ranked equivalents for a competitor code / name; also direct Silitex catalogue hits (name, code, INCI) */
export function searchEquiv(q: string, k = 6): EquivHit[] {
  const qn = norm(q); const qt = toks(q); if (qn.length < 2) return [];
  const scored: EquivHit[] = [];
  for (const e of entries()) {
    let score = 0; let exact = false;
    if (e.norm && (e.norm === qn || (qn.length >= 4 && (e.norm.includes(qn) || (e.norm.length >= 4 && qn.includes(e.norm)))))) { exact = true; score = 2 + (e.norm === qn ? 1 : 0); }
    else if (qt.length) {
      let hit = 0, num = 0; const set = new Set(e.toks); for (const t of qt) if (set.has(t)) { hit++; if (/\d/.test(t)) num++; }
      score = hit / qt.length + num * 0.5; if (score < 0.5) score = 0;
    }
    if (score) scored.push({ ...e, exact, score: score + (e.kind === "gap" ? 0.2 : 0) + (e.ref.startsWith("SILITEX-COS-") ? 1.5 : 0), rows: [], also: [] }); // official Silitex countertypes rank first
  }
  scored.sort((a, b) => b.score - a.score);
  const out: EquivHit[] = [];
  for (const h of scored) {
    // one card per Silitex answer (family / gap row); other matching competitor names listed under "also"
    const prev = out.find((o) => o.ref === h.ref);
    if (prev) { const lc = h.competitor.toLowerCase(); if (prev.competitor.toLowerCase() !== lc && !prev.also.some((a) => a.toLowerCase() === lc) && prev.also.length < 4) prev.also.push(h.competitor); continue; }
    if (out.length >= k) continue;
    out.push({ ...h, rows: catalogueRows(h.silitexNames, 4, h.silitex) });
  }
  // direct Silitex catalogue hits (user typed a Silitex name / code / INCI)
  if (out.length < k) {
    const cat = CAT26.filter((r) => norm(r.code) === qn || norm(r.product).includes(qn) || (qn.length >= 5 && norm(r.inci).includes(qn))).slice(0, k - out.length);
    for (const r of cat) out.push({ verified: true, key: "cat|" + r.id, kind: "catalogue", competitor: "", producer: "", family: r.section, inci: r.inci, silitex: r.product, silitexNames: [r.product.toUpperCase()], certs: r.compliance ? [r.compliance] : [], ref: r.code, exact: true, score: 1, rows: [r], also: [] });
  }
  return out;
}
