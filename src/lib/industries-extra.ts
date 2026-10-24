// industries-extra.ts (src/lib/industries-extra.ts) · created 24.10.2026 06:00 (Asia/Jerusalem)
// INDUSTRIES ADDED FROM THE 🛰️ GAP RADAR (table extra_industries) — merged into every industry pick-list, the scan classification
// and the search briefs, with no code change. Browser: cached in localStorage + refreshed on app start (AppShell). Server: loadExtraServer().
export type ExtraInd = { name: string; who: string; uses: string };
const KEY = "silitex-extra-industries";
let EXTRA: ExtraInd[] = [];
try { if (typeof window !== "undefined") EXTRA = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch {}
export const extraIndustries = () => EXTRA;
export function setExtra(x: ExtraInd[]) { EXTRA = Array.isArray(x) ? x : []; try { if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(EXTRA)); } catch {} }
export async function refreshExtra(): Promise<ExtraInd[]> {
  try { const r = await fetch("/api/industries", { cache: "no-store" }); if (r.ok) { const j = await r.json(); setExtra(j.items || []); } } catch {}
  return EXTRA;
}
