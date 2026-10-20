// scan.ts (src/lib/scan.ts) · updated 20.10.2026 10:45 (Asia/Jerusalem) — failed scans remembered on the lead (intake.scan_err) so "scan all" skips them; separate retry · 06:00 — CUSTOMER WEBSITE SCAN result type + where it lives on the lead (intake.scan_json / scan_at — no database change) + text for export / Pini list.
import type { Lead } from "@/lib/types";
export type ScanData = { summary?: string; product_lines?: { name: string; type?: string; examples?: string[] }[]; silicone_uses?: { function: string; where: string }[]; matches?: { silitex: string; code?: string; countertype?: string; for?: string; why?: string; confidence?: string }[]; questions?: string[]; value_angle?: string; not_found?: string };
export type ScanResult = { data: ScanData; at: string; pages: number; urls: string[]; sector: string };
export function scanOf(l: Lead): ScanResult | null { try { const s = l.intake?.scan_json; return s ? (JSON.parse(s) as ScanResult) : null; } catch { return null; } }
export const withScan = (l: Lead, r: ScanResult): Lead => { const it: Record<string, unknown> = { ...(l.intake || {}), scan_json: JSON.stringify(r), scan_at: r.at }; delete it.scan_err; return { ...l, intake: it as Lead["intake"] }; };
export const scanErr = (l: Lead): string => (scanOf(l) ? "" : String(l.intake?.scan_err || ""));
export const withScanErr = (l: Lead, msg: string): Lead => ({ ...l, intake: { ...(l.intake || {}), scan_err: msg + " · " + new Date().toLocaleDateString("en-GB") } as Lead["intake"] });
/** server error → Hebrew reason */
export const errHe = (e: string) => /not reachable/.test(e) ? "האתר חוסם / לא זמין" : /nothing read/.test(e) ? "לא נקרא תוכן מהאתר" : /bad website/.test(e) ? "כתובת אתר שגויה" : /no answer|JSON/i.test(e) ? "תשובת AI לא תקינה — לנסות שוב" : /fetch|network|Failed/i.test(e) ? "תקלת רשת — לנסות שוב" : e;
export const skuFromScan = (r: ScanResult) => (r.data.matches || []).filter((m) => m.confidence !== "low").map((m) => m.silitex + (m.countertype ? " (= " + m.countertype + ")" : "")).filter((v, i, a) => a.indexOf(v) === i).join(" · ");
export function scanText(name: string, r: ScanResult): string {
  const d = r.data;
  return [name, d.summary || "",
    "מוצרים: " + (d.product_lines || []).map((p) => p.name + (p.examples?.length ? " (" + p.examples.slice(0, 3).join(", ") + ")" : "")).join(" · "),
    "התאמות Silitex: " + (d.matches || []).map((m) => m.silitex + (m.countertype ? " = " + m.countertype : "") + " → " + (m.for || "") + " [" + (m.confidence || "") + "]").join(" · "),
    "שאלות למו\"פ: " + (d.questions || []).map((q, i) => (i + 1) + ") " + q).join(" "),
    "זווית ערך: " + (d.value_angle || "")].join("\n");
}
