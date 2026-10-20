// scan.ts (src/lib/scan.ts) · updated 20.10.2026 06:00 (Asia/Jerusalem) — CUSTOMER WEBSITE SCAN result type + where it lives on the lead (intake.scan_json / scan_at — no database change) + text for export / Pini list.
import type { Lead } from "@/lib/types";
export type ScanData = { summary?: string; product_lines?: { name: string; type?: string; examples?: string[] }[]; silicone_uses?: { function: string; where: string }[]; matches?: { silitex: string; code?: string; countertype?: string; for?: string; why?: string; confidence?: string }[]; questions?: string[]; value_angle?: string; not_found?: string };
export type ScanResult = { data: ScanData; at: string; pages: number; urls: string[]; sector: string };
export function scanOf(l: Lead): ScanResult | null { try { const s = l.intake?.scan_json; return s ? (JSON.parse(s) as ScanResult) : null; } catch { return null; } }
export const withScan = (l: Lead, r: ScanResult): Lead => ({ ...l, intake: { ...(l.intake || {}), scan_json: JSON.stringify(r), scan_at: r.at } });
export const skuFromScan = (r: ScanResult) => (r.data.matches || []).filter((m) => m.confidence !== "low").map((m) => m.silitex + (m.countertype ? " (= " + m.countertype + ")" : "")).filter((v, i, a) => a.indexOf(v) === i).join(" · ");
export function scanText(name: string, r: ScanResult): string {
  const d = r.data;
  return [name, d.summary || "",
    "מוצרים: " + (d.product_lines || []).map((p) => p.name + (p.examples?.length ? " (" + p.examples.slice(0, 3).join(", ") + ")" : "")).join(" · "),
    "התאמות Silitex: " + (d.matches || []).map((m) => m.silitex + (m.countertype ? " = " + m.countertype : "") + " → " + (m.for || "") + " [" + (m.confidence || "") + "]").join(" · "),
    "שאלות למו\"פ: " + (d.questions || []).map((q, i) => (i + 1) + ") " + q).join(" "),
    "זווית ערך: " + (d.value_angle || "")].join("\n");
}
