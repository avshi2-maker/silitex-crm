// sheet-offsets.ts (src/lib/sheet-offsets.ts) · updated 25.10.2026 17:40 (Asia/Jerusalem) — v0.93.0 + inciOf / inciOfCompetitor (INCI first on the meeting sheet) · created 08:10
// For the 🖨️ meeting sheet: each Silitex grade → its equivalents from the other producers, from our own data only:
// Federica's cosmetic countertypes leaflet (19/10/2026) · the offsets table (Dow / Shin-Etsu / Momentive / Wacker / Evonik / Elkem / KCC …) · the catalogue's Dow benchmark · the website scan's countertype.
import { COSMETIC_COUNTERTYPES } from "@/config/cosmetic-range";
import { OFFSETS, PRODUCTS } from "@/lib/data";
import { CAT26 } from "@/lib/catalog";

const U = (s: string) => (s || "").toUpperCase().replace(/\s+/g, " ").trim();
const base = (s: string) => U(s).replace(/^[★*\s]+/, "").replace(/\s*\(.*$/, "").trim();
const KEEP = ["Shin-Etsu", "Momentive", "Wacker", "Evonik", "Bluestar", "KCC", "BRB"];
const short = (p: string) => p.split(" ")[0].replace(/[()]/g, "");

export function offsetsFor(silitex: string, countertype?: string): string {
  const n = base(silitex); if (!n) return countertype || "";
  const out: string[] = []; const add = (who: string, v?: string) => { const t = (v || "").trim(); if (t && t !== "-" && !out.some((x) => x.endsWith(": " + t))) out.push(who + ": " + t); };
  const c = COSMETIC_COUNTERTYPES.find((r) => U(r.product) === n || base(r.product) === n);
  if (c) { add("Dow", c.dow); add("Momentive", c.momentive); add("Wacker", c.wacker); add("BRB", c.brb); }
  const first = n.split(" ")[0];
  const o = first.length >= 5 ? OFFSETS.rows.find((r) => U(r.silitex_product).startsWith(first) || U(r.silitex_product).includes(n)) : undefined;
  if (o) { add("Dow", o.dow_corning); for (const [k, v] of Object.entries(o.offsets || {})) if (KEEP.some((x) => k.startsWith(x))) add(short(k), v); }
  const p = PRODUCTS.find((x) => U(x.product_name) === n || base(x.product_name) === n); if (p) add("Dow", p.dow_corning_offset_benchmark);
  if (countertype && !out.some((x) => U(x).includes(U(countertype)))) out.unshift(countertype);
  return out.slice(0, 6).join(" · ");
}

// ── INCI (Pini 25/10/2026: "INCI = 100 % common knowledge" — the sheet leads with INCI, producer P/N only in small print) ──
const clean = (s?: string) => (s || "").replace(/\s+/g, " ").replace(/silosane/gi, "siloxane").replace(/\b(peg|ppg)\b/gi, (m) => m.toUpperCase()).replace(/\s*;\s*/g, ", ").trim();
/** INCI of a Silitex grade: leaflet → Cosmetics 2026 catalogue → products → offsets family */
export function inciOf(silitex: string): string {
  const n = base(silitex); if (!n) return "";
  const c = COSMETIC_COUNTERTYPES.find((r) => base(r.product) === n); if (clean(c?.inci)) return clean(c?.inci);
  const k = CAT26.find((r) => base(r.product) === n); if (clean(k?.inci)) return clean(k?.inci);
  const p = PRODUCTS.find((x) => base(x.product_name) === n); if (clean(p?.inci_chemical_name)) return clean(p?.inci_chemical_name);
  const first = n.split(" ")[0]; const o = first.length >= 5 ? OFFSETS.rows.find((r) => U(r.silitex_product).startsWith(first)) : undefined;
  return clean(o?.inci);
}
const tokens = (s: string) => U(s).replace(/[®™]/g, "").split(/\s*(?:\/|,|·|;|\bOR\b)\s*/).map((t) => t.replace(/^(DOW CORNING|DOWSIL|XIAMETER|DC)\s+/, "").trim()).filter((t) => t.length >= 3 && /\d/.test(t)); // only real part numbers (a bare brand like "ABIL" / "Silsoft" says nothing)
const hit = (field: string, t: string) => { const f = U(field).replace(/[®™]/g, ""); return /\d/.test(t) ? new RegExp("(^|[^A-Z0-9])" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^A-Z0-9]|$)").test(f) : f.includes(t); };
/** INCI of a competitor product name (e.g. "DOWSIL 245", "Silsoft Q"). Returns "" when unknown. */
export function inciOfCompetitor(name: string): string {
  const out: string[] = [];
  for (const t of tokens(name)) {
    const c = COSMETIC_COUNTERTYPES.find((r) => [r.dow, r.brb, r.momentive, r.wacker].some((f) => f && hit(f, t)));
    let v = clean(c?.inci);
    if (!v) { const o = OFFSETS.rows.find((r) => hit(r.dow_corning, t) || Object.values(r.offsets || {}).some((f) => f && hit(f, t))); v = clean(o?.inci); }
    if (!v) { const p = PRODUCTS.find((x) => x.dow_corning_offset_benchmark && hit(x.dow_corning_offset_benchmark, t)); v = clean(p?.inci_chemical_name); }
    if (v && !out.includes(v)) out.push(v);
  }
  return out.join(" · ");
}
