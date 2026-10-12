// gaps-export.ts (src/lib/gaps-export.ts) · updated 12.10.2026 12:40 (Asia/Jerusalem)
// Builds the "Israel Market Request" workbook for Silitex (Federica) to fill and mail back: one row per missing molecule, alphabetical, with empty answer columns. XLSX via SheetJS (dynamic import), CSV fallback.
type Gap = { id: string; query: string; aliases: string[]; what: string; producers: string; silitex: string; history?: string; action: string; status: string; added: string };
export type GapRow = Record<string, string | number>;
export const HEADERS = ["#", "Molecule (INCI / common name)", "Priority (1 = highest Israeli potential)", "Status in Silitex catalogue", "Trade names customers ask for", "Function", "Israeli buyers (named accounts)", "Est. Israeli market t/yr", "Current suppliers (incumbents)", "Silitex today", "SILITEX ANSWER (Make / Source from partner / Resell under Silitex label / No)", "Lead time", "MOQ (kg)", "Indicative price EUR/kg", "Silitex notes"];
export function buildRows(gaps: Gap[], buyers: string, est: Record<string, string>): GapRow[] {
  const sorted = [...gaps].sort((a, b) => a.query.localeCompare(b.query));
  const prio = [...gaps].sort((a, b) => (parseFloat((est[b.id] || "0").replace(/[^\d.]/g, "")) || 0) - (parseFloat((est[a.id] || "0").replace(/[^\d.]/g, "")) || 0)).map((g) => g.id);
  return sorted.map((g, i) => ({ "#": i + 1, "Molecule (INCI / common name)": g.query, "Priority (1 = highest Israeli potential)": prio.indexOf(g.id) + 1, "Status in Silitex catalogue": g.status === "partial" ? "PARTIAL" : "NOT IN CATALOGUE", "Trade names customers ask for": g.aliases.join(", "), "Function": g.what, "Israeli buyers (named accounts)": buyers, "Est. Israeli market t/yr": est[g.id] || "", "Current suppliers (incumbents)": g.producers, "Silitex today": g.silitex, "SILITEX ANSWER (Make / Source from partner / Resell under Silitex label / No)": "", "Lead time": "", "MOQ (kg)": "", "Indicative price EUR/kg": "", "Silitex notes": "" }));
}
const INTRO = [["ISRAEL MARKET REQUEST — silicone molecules Israeli cosmetics plants buy that are not in the Silitex catalogue"], ["Prepared by Sapirim (Avshi Sapir) for Silitex S.r.l. · catalogue verified against silitex.it on 12/10/2026 (318 products, 35 categories)"], ["How to use: fill the yellow columns K–O for every row (answer, lead time, MOQ, indicative price, notes) and mail the file back to avshi@sapirim.com"], ["Context: commodity silicones (dimethicone, D5) are not our fight vs. Wacker / Shin-Etsu ex-stock Israel. These molecules close a complete cosmetics basket for AHAVA, Peer Pharm, Moroccanoil under one hand."], ["For every 'No' we propose a written carve-out: Sapirim may source that molecule from a second supplier."], []];
export async function downloadXlsx(rows: GapRow[], filename: string) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(INTRO);
  XLSX.utils.sheet_add_json(ws, rows, { header: HEADERS, origin: "A7" });
  ws["!cols"] = [4, 34, 12, 18, 40, 48, 36, 12, 48, 60, 34, 14, 10, 14, 40].map((w) => ({ wch: w }));
  ws["!freeze"] = { xSplit: 2, ySplit: 7 };
  XLSX.utils.book_append_sheet(wb, ws, "Israel Market Request");
  const ws2 = XLSX.utils.aoa_to_sheet([["Column", "Meaning"], ["Priority", "1 = largest estimated Israeli volume"], ["Status", "NOT IN CATALOGUE = no product found on silitex.it · PARTIAL = Silitex covers part of the function"], ["SILITEX ANSWER", "Make = Silitex can produce · Source from partner = Silitex buys and supplies · Resell under Silitex label = private label · No = not available"], ["Lead time / MOQ / Price", "Indicative only, for the business plan"]]);
  ws2["!cols"] = [{ wch: 22 }, { wch: 100 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Legend");
  XLSX.writeFile(wb, filename + ".xlsx");
}
export function downloadCsv(rows: GapRow[], filename: string) {
  const esc = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';
  const csv = "﻿" + [HEADERS.map(esc).join(","), ...rows.map((r) => HEADERS.map((h) => esc(r[h] ?? "")).join(","))].join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = filename + ".csv"; a.click();
}
