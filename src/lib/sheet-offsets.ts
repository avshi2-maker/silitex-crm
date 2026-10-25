// sheet-offsets.ts (src/lib/sheet-offsets.ts) · created 25.10.2026 08:10 (Asia/Jerusalem)
// For the 🖨️ meeting sheet: each Silitex grade → its equivalents from the other producers, from our own data only:
// Federica's cosmetic countertypes leaflet (19/10/2026) · the offsets table (Dow / Shin-Etsu / Momentive / Wacker / Evonik / Elkem / KCC …) · the catalogue's Dow benchmark · the website scan's countertype.
import { COSMETIC_COUNTERTYPES } from "@/config/cosmetic-range";
import { OFFSETS, PRODUCTS } from "@/lib/data";

const U = (s: string) => (s || "").toUpperCase().replace(/\s+/g, " ").trim();
const base = (s: string) => U(s).replace(/\s*\(.*$/, "").trim();
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
