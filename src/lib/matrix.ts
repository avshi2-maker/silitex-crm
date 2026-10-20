// matrix.ts (src/lib/matrix.ts) · created 20.10.2026 09:40 (Asia/Jerusalem) — MARKET MATRIX engine: builds itself from every customer + its website scan. (1) Pini list: industry → factory → products → Silitex grades. (2) Federica list: industry → product category → Silitex grade(s) → gap yes/no — counts only, no company names.
import type { Lead } from "@/lib/types";
import { scanOf, type ScanData } from "@/lib/scan";
type Match = NonNullable<ScanData["matches"]>[number];
const norm = (s = "") => s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, " ").replace(/\s+/g, " ").trim();
const good = (m: Match) => m.confidence !== "low";
export const gradeLabel = (m: Match) => m.silitex + (m.countertype ? " (= " + m.countertype + ")" : "");
/** which matches belong to a product line (AI writes the line name into m.for) */
export function matchesFor(line: { name: string; type?: string }, ms: Match[]): Match[] {
  const a = norm(line.name), t = norm(line.type);
  return ms.filter((m) => { const f = norm(m.for); return !!f && (f.includes(a) || a.includes(f) || (!!t && (f.includes(t) || t.includes(f)))); });
}
export type PiniRow = { lead: Lead; scanned: boolean; products: string[]; grades: string[]; toCheck: string[]; questions: string[]; supplier: string };
export function piniRows(leads: Lead[]): PiniRow[] {
  return leads.map((l) => {
    const r = scanOf(l); const d = r?.data; const ms = d?.matches || [];
    return { lead: l, scanned: !!r, products: d ? (d.product_lines || []).map((p) => p.name + (p.examples?.length ? " (" + p.examples.slice(0, 3).join(", ") + ")" : "")) : l.sub_industry ? [l.sub_industry] : [], grades: Array.from(new Set(ms.filter(good).map(gradeLabel))), toCheck: Array.from(new Set(ms.filter((m) => !good(m)).map(gradeLabel))), questions: (d?.questions || []).slice(0, 3), supplier: String(l.intake?.BEN_001 || "") || (/Comet guess/.test(l.competitor_offset || "") ? "Lidorr / BSC? (ניחוש Comet)" : l.competitor_offset || "") };
  });
}
export type FedRow = { category: string; producers: number; grades: string[]; gap: "yes" | "no" | "check" };
export type FedIndustry = { industry: string; mapped: number; scanned: number; rows: FedRow[] };
export function federica(leads: Lead[]): FedIndustry[] {
  const by = new Map<string, Lead[]>(); for (const l of leads) by.set(l.industry, [...(by.get(l.industry) || []), l]);
  return Array.from(by.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([industry, ls]) => {
    const cats = new Map<string, { label: string; who: Set<string>; good: Set<string>; low: Set<string> }>(); let scanned = 0;
    for (const l of ls) {
      const d = scanOf(l)?.data; if (!d) continue; scanned++; const ms = d.matches || [];
      for (const p of d.product_lines || []) {
        const label = (p.type || p.name || "").trim(); if (!label) continue; const k = norm(label);
        const c = cats.get(k) || { label, who: new Set(), good: new Set(), low: new Set() }; c.who.add(l.id);
        for (const m of matchesFor(p, ms)) (good(m) ? c.good : c.low).add(gradeLabel(m));
        cats.set(k, c);
      }
    }
    const rows: FedRow[] = Array.from(cats.values()).map((c) => ({ category: c.label, producers: c.who.size, grades: Array.from(c.good.size ? c.good : c.low), gap: c.good.size ? "no" : c.low.size ? "check" : "yes" } as FedRow)).sort((a, b) => b.producers - a.producers || a.category.localeCompare(b.category));
    return { industry, mapped: ls.length, scanned, rows };
  });
}
export const GAP_HE: Record<FedRow["gap"], string> = { yes: "כן — אין מוצר Silitex", no: "לא — יש מוצר", check: "לבדוק — התאמה חלשה" };
export function fedText(inds: FedIndustry[]): string {
  return inds.filter((i) => i.rows.length).map((i) => "■ " + i.industry + " — " + i.mapped + " יצרנים ממופים, " + i.scanned + " נסרקו\n" + i.rows.map((r) => "• " + r.category + " (" + r.producers + ") → " + (r.grades.join(", ") || "—") + " · פער: " + GAP_HE[r.gap]).join("\n")).join("\n\n");
}
export function piniText(rows: PiniRow[]): string {
  const by = new Map<string, PiniRow[]>(); for (const r of rows) by.set(r.lead.industry, [...(by.get(r.lead.industry) || []), r]);
  return Array.from(by.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([ind, rs]) => "■ " + ind + " (" + rs.length + ")\n" + rs.map((r) => "• " + r.lead.name + (r.lead.city ? " — " + r.lead.city : "") + " [" + (r.lead.tier || "").split(" - ")[0] + "]" + (r.scanned ? "" : " (לא נסרק)") + "\n   מוצרים: " + (r.products.join(" · ") || "—") + "\n   Silitex: " + (r.grades.join(" · ") || "—") + (r.toCheck.length ? " · לבדוק: " + r.toCheck.join(", ") : "") + "\n   ספק נוכחי (לפיני): " + (r.supplier || "______") + " · נפח: ______" + (r.questions.length ? "\n   שאלות: " + r.questions.join(" | ") : "")).join("\n")).join("\n\n");
}
