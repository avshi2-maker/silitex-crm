// scan.ts (src/lib/scan.ts) · updated 22.10.2026 16:55 (Asia/Jerusalem) — withScan() also fills industry (when "לסיווג") + sub-industry from the scan · 22.10.2026 12:45 (Asia/Jerusalem) — withoutScan() + noMatch() (clear scans without a Silitex match) · 22.10.2026 07:35 (Asia/Jerusalem) — timeout → clear Hebrew message + readScan() (HTML time-out page no longer shown as 'invalid AI answer') · 20.10.2026 10:45 (Asia/Jerusalem) — failed scans remembered on the lead (intake.scan_err) so "scan all" skips them; separate retry · 06:00 — CUSTOMER WEBSITE SCAN result type + where it lives on the lead (intake.scan_json / scan_at — no database change) + text for export / Pini list.
import { INDUSTRY_LIST, isUnclassified } from "@/config/industry-list";
import type { Lead } from "@/lib/types";
export type ScanData = { industry?: string; sub_industry?: string; summary?: string; product_lines?: { name: string; type?: string; examples?: string[] }[]; silicone_uses?: { function: string; where: string }[]; matches?: { silitex: string; code?: string; countertype?: string; for?: string; why?: string; confidence?: string }[]; questions?: string[]; value_angle?: string; not_found?: string };
export type ScanResult = { data: ScanData; at: string; pages: number; urls: string[]; sector: string };
export function scanOf(l: Lead): ScanResult | null { try { const s = l.intake?.scan_json; return s ? (JSON.parse(s) as ScanResult) : null; } catch { return null; } }
/** saves the scan + fills the industry when the customer is still "לסיווג" (only a name from the CRM list) and the sub-industry when empty */
export const withScan = (l: Lead, r: ScanResult): Lead => {
  const it: Record<string, unknown> = { ...(l.intake || {}), scan_json: JSON.stringify(r), scan_at: r.at }; delete it.scan_err;
  const ind = INDUSTRY_LIST.find((x) => x.toLowerCase() === String(r.data.industry || "").trim().toLowerCase());
  const sub = String(r.data.sub_industry || "").trim().slice(0, 80);
  return { ...l, ...(ind && isUnclassified(l.industry) ? { industry: ind } : {}), ...(sub && !(l.sub_industry || "").trim() ? { sub_industry: sub } : {}), intake: it as Lead["intake"] };
};
/** remove a scan result (customer stays; goes back to "not scanned" so it can be scanned again, e.g. with a corrected website) */
export const withoutScan = (l: Lead): Lead => { const it: Record<string, unknown> = { ...(l.intake || {}) }; delete it.scan_json; delete it.scan_at; delete it.scan_err; return { ...l, intake: it as Lead["intake"] }; };
/** scanned but no Silitex match at all (or only low confidence) */
export const noMatch = (l: Lead): boolean => { const r = scanOf(l); return !!r && !(r.data.matches || []).some((m) => m.confidence !== "low"); };
export const scanErr = (l: Lead): string => (scanOf(l) ? "" : String(l.intake?.scan_err || ""));
export const withScanErr = (l: Lead, msg: string): Lead => ({ ...l, intake: { ...(l.intake || {}), scan_err: msg + " · " + new Date().toLocaleDateString("en-GB") } as Lead["intake"] });
/** server error → Hebrew reason */
/** read a scan response safely: a server time-out returns HTML, not JSON */
export const readScan = async (r: Response): Promise<Record<string, any>> => { try { return await r.json(); } catch { return { error: r.status === 504 || r.status === 502 ? "timeout" : "server " + r.status }; } }; // eslint-disable-line @typescript-eslint/no-explicit-any
export const errHe = (e: string) => /not reachable/.test(e) ? "האתר חוסם / לא זמין" : /nothing read/.test(e) ? "לא נקרא תוכן מהאתר" : /bad website/.test(e) ? "כתובת אתר שגויה" : /timeout|server 50[24]/i.test(e) ? "האתר איטי — הסריקה חרגה מהזמן, לנסות שוב" : /no answer|JSON/i.test(e) ? "תשובת AI לא תקינה — לנסות שוב" : /fetch|network|Failed/i.test(e) ? "תקלת רשת — לנסות שוב" : e;
export const skuFromScan = (r: ScanResult) => (r.data.matches || []).filter((m) => m.confidence !== "low").map((m) => m.silitex + (m.countertype ? " (= " + m.countertype + ")" : "")).filter((v, i, a) => a.indexOf(v) === i).join(" · ");
export function scanText(name: string, r: ScanResult): string {
  const d = r.data;
  return [name, d.summary || "",
    "מוצרים: " + (d.product_lines || []).map((p) => p.name + (p.examples?.length ? " (" + p.examples.slice(0, 3).join(", ") + ")" : "")).join(" · "),
    "התאמות Silitex: " + (d.matches || []).map((m) => m.silitex + (m.countertype ? " = " + m.countertype : "") + " → " + (m.for || "") + " [" + (m.confidence || "") + "]").join(" · "),
    "שאלות למו\"פ: " + (d.questions || []).map((q, i) => (i + 1) + ") " + q).join(" "),
    "זווית ערך: " + (d.value_angle || "")].join("\n");
}
