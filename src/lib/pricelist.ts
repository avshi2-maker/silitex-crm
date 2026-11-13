// pricelist.ts (src/lib/pricelist.ts) · created 13.11.2026 13:20 (Asia/Jerusalem) — v1.11.0 💶 Silitex price list: types, catalogue merge (all 239 names), price age, landed-cost calculator
// The truth list of names = the 5 Silitex catalogues 2026 (CAT26). DB table price_list holds only what we KNOW: quotes, INCI/CAS fixes, RDA, TDS/SDS links, PO ref.
// A quoted product that is not in the catalogues (e.g. H 380) is still listed — flagged "לא בקטלוג".
import { CAT26, PDFS } from "@/lib/catalog";

export type Pack = { label: string; kg: number; eur_kg: number; incoterm?: string; quoted_at?: string; source?: string; moq_kg?: number };
export type PriceHist = { at: string; label: string; eur_kg: number; source?: string };
export type PriceRow = {
  id: string; product: string; code: string; sector: string; inci: string; cas: string;
  rda: boolean | null; packs: Pack[]; history: PriceHist[];
  tds_url: string; sds_url: string; po_ref: string; countertype: string; notes: string;
  updated_at?: string | null;
};
export type ListRow = PriceRow & { inCatalog: boolean; catCode: string; catInci: string; catalogPdf: string; inDb: boolean };

/** stable key of a product name: "H 160", "h160", "H 160 [PO425]" → "H160" */
export function keyOf(name: string): string { return name.toUpperCase().replace(/\[.*?\]|\(.*?\)/g, "").replace(/[^A-Z0-9]/g, ""); }

type Cat = { product: string; code: string; sectors: string[]; inci: string };
const CATS: Cat[] = (() => {
  const m = new Map<string, Cat>();
  for (const r of CAT26) {
    const k = keyOf(r.product); const c = m.get(k);
    if (!c) m.set(k, { product: r.product, code: r.code || "", sectors: [r.sector], inci: r.inci || "" });
    else { if (!c.sectors.includes(r.sector)) c.sectors.push(r.sector); if (!c.code && r.code) c.code = r.code; if (!c.inci && r.inci) c.inci = r.inci; }
  }
  return Array.from(m.values());
})();
export const CATALOG_NAMES = CATS.length;

export function emptyRow(product: string): PriceRow {
  return { id: keyOf(product), product, code: "", sector: "", inci: "", cas: "", rda: null, packs: [], history: [], tds_url: "", sds_url: "", po_ref: "", countertype: "", notes: "" };
}

/** catalogue names ∪ DB rows → one list (DB values win, catalogue fills the blanks) */
export function mergeList(db: PriceRow[]): ListRow[] {
  const byKey = new Map(db.map((r) => [r.id || keyOf(r.product), r]));
  const out: ListRow[] = CATS.map((c) => {
    const k = keyOf(c.product); const d = byKey.get(k); byKey.delete(k);
    const base = d || emptyRow(c.product);
    return { ...base, id: k, product: base.product || c.product, code: base.code || c.code, sector: base.sector || c.sectors.join(" · "), inci: base.inci || c.inci, inCatalog: true, catCode: c.code, catInci: c.inci, catalogPdf: PDFS[c.sectors[0]] || "", inDb: !!d };
  });
  for (const d of Array.from(byKey.values())) out.push({ ...d, inCatalog: false, catCode: "", catInci: "", catalogPdf: "", inDb: true });
  return out.sort((a, b) => Number(b.packs.length > 0) - Number(a.packs.length > 0) || a.product.localeCompare(b.product, "en", { numeric: true }));
}

/** price age: fresh < 90 days · aging 90–180 · stale > 180 · none */
export type Age = "fresh" | "aging" | "stale" | "none";
export function ageOf(p?: Pack): Age {
  if (!p?.quoted_at) return "none";
  const d = (Date.now() - new Date(p.quoted_at).getTime()) / 86400000;
  return d < 90 ? "fresh" : d < 180 ? "aging" : "stale";
}
export const AGE_TONE: Record<Age, string> = { fresh: "green", aging: "amber", stale: "red", none: "slate" };
export const AGE_HE: Record<Age, string> = { fresh: "מחיר עדכני", aging: "מחיר 3–6 חודשים", stale: "מחיר ישן (6+ חודשים)", none: "ללא תאריך" };

/** cheapest €/kg among the packs */
export function bestPack(r: PriceRow): Pack | undefined { return [...r.packs].sort((a, b) => a.eur_kg - b.eur_kg)[0]; }

/** landed cost in Israel: EXW €/kg → + freight % + duty % → cost; + margin % → selling price; × EUR/ILS */
export type Landed = { freight: number; duty: number; margin: number; rate: number };
export const LANDED_DEFAULT: Landed = { freight: 18, duty: 0, margin: 25, rate: 4.0 };
export function landed(eurKg: number, l: Landed) {
  const cost = eurKg * (1 + l.freight / 100) * (1 + l.duty / 100);
  const sell = cost * (1 + l.margin / 100);
  return { cost, sell, costIls: cost * l.rate, sellIls: sell * l.rate };
}
export const eur = (n: number) => "€" + n.toFixed(2);
export const ils = (n: number) => "₪" + n.toFixed(2);

/** a PO ref that is a project number links to the project card */
export function poLink(ref: string): string | null { const m = ref.match(/SPR-\d{4}/i); return m ? "/projects/" + m[0].toUpperCase() : null; }

/** CAS format check (digits-digits-check digit) */
export function casOk(cas: string): boolean {
  return cas.split(/[,;/\s]+/).filter(Boolean).every((c) => {
    const m = c.match(/^(\d{2,7})-(\d{2})-(\d)$/); if (!m) return false;
    const digits = (m[1] + m[2]).split("").reverse(); const sum = digits.reduce((s, d, i) => s + Number(d) * (i + 1), 0);
    return sum % 10 === Number(m[3]);
  });
}
