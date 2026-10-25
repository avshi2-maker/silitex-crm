"use client";
// page.tsx (src/app/sheet/page.tsx) · updated 25.10.2026 06:45 (Asia/Jerusalem) — ✉ send by e-mail (Excel attached + table in the mail, short Hebrew body) · created 25.10.2026 06:30
// 🖨️ MEETING SHEET — printable table per industry (any industry): company · contact · what they make · current supplier / offset ·
// Silitex match (website scan) · est. t/yr · priority A–D · EMPTY columns to write by hand ("עדכון / הערות", ✓).
// For meetings with Pini (and anyone): print A4 landscape, mark by pen, then type the updates back into the customer card.
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useLang } from "@/i18n";
import { Card, H1, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { scanOf } from "@/lib/scan";
import { scoreLead, type Grade } from "@/lib/priority";
import { fmtDate, todayIso } from "@/lib/format";
import SheetEmail from "@/components/sheet/SheetEmail";

const RANK: Record<Grade, number> = { A: 0, B: 1, C: 2, D: 3 };
const PRINT_CSS = "@media print { @page { size: A4 landscape; margin: 10mm; } body { background: #fff !important; } .sheet-table { font-size: 9.5pt; } .sheet-table thead { display: table-header-group; } .sheet-table tr { break-inside: avoid; } }";
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export default function SheetPage() {
  const { t: tr } = useLang(); const { state, ready } = useStore();
  const [ind, setInd] = useState("Personal Care & Cosmetics"); const [minG, setMinG] = useState<Grade>("D"); const [onlyScan, setOnlyScan] = useState(false); const [who, setWho] = useState("פיני"); const [mail, setMail] = useState(false);
  useEffect(() => { const q = new URLSearchParams(window.location.search); if (q.get("industry")) setInd(q.get("industry") || ""); }, []);
  const inds = useMemo(() => Array.from(new Set(state.leads.map((l) => l.industry))).sort(), [state.leads]);
  const rows = useMemo(() => state.leads.filter((l) => (!ind || l.industry === ind) && l.stage !== "lost").map((l) => {
    const sc = scanOf(l); const s = scoreLead(l, state.tasks);
    const ms = (sc?.data.matches || []).filter((m) => m.confidence !== "low").sort((a, b) => (a.confidence === "high" ? 0 : 1) - (b.confidence === "high" ? 0 : 1));
    const sil = Array.from(new Set(ms.map((m) => m.silitex + (m.countertype ? " (= " + m.countertype + ")" : "")))).slice(0, 4).join(" · ") || l.recommended_sku || "";
    const make = sc?.data.summary || l.sub_industry || l.use_case || "";
    const cur = [l.competitor_offset, l.intake?.current_supplier as string | undefined].filter(Boolean).join(" · ") || "";
    return { l, s, sil, make, cur, scanned: !!sc };
  }).filter((r) => RANK[r.s.grade] <= RANK[minG] && (!onlyScan || r.scanned)).sort((a, b) => RANK[a.s.grade] - RANK[b.s.grade] || b.s.total - a.s.total), [state.leads, state.tasks, ind, minG, onlyScan]);
  if (!ready) return null;
  const tons = rows.reduce((a, r) => a + r.s.tons, 0);
  // one table for Excel, CSV and the e-mail (Hebrew headers, same order as the printed sheet)
  const head = ["#", "חברה / עיר", "איש קשר / טלפון", "מה מייצרים", "ספק / מוצר נוכחי", "התאמת Silitex", "ט'/שנה", "עדיפות", "עדכון / הערות — " + who];
  const table: (string | number)[][] = rows.map((r, i) => [i + 1, r.l.name + (r.l.city ? " · " + r.l.city : ""), [r.l.contact_name, r.l.contact_role, r.l.contact_phone].filter(Boolean).join(" · "), cut(r.make, 220), r.cur, r.sil || (r.scanned ? "אין התאמה" : "לא נסרק"), r.s.tons, r.s.grade, ""]);
  const csv = () => {
    const esc = (v: string | number) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const body = table.map((r) => r.map(esc).join(","));
    const b = new Blob(["﻿" + [head.map(esc).join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "meeting_sheet_" + (ind || "all").replace(/\W+/g, "_") + "_" + todayIso() + ".csv"; a.click();
  };
  const th = "border border-slate-400 p-1 text-start align-bottom bg-slate-100"; const td = "border border-slate-300 p-1 align-top";
  return (
    <div className="space-y-3">
      <style>{PRINT_CSS}</style>
      <div className="print:hidden space-y-3">
        <H1 sub={tr("טבלה להדפסה לכל תעשייה — לסמן ביד בפגישה, ואחר כך להקליד את העדכונים בכרטיס הלקוח")}>🖨️ {tr("דף פגישה להדפסה")}</H1>
        <Card className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-slate-500">{tr("תעשייה")}<select className={inputCls + " mt-1"} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">{tr("הכל")}</option>{inds.map((i) => <option key={i} value={i}>{i} ({state.leads.filter((l) => l.industry === i).length})</option>)}</select></label>
          <label className="text-xs text-slate-500">{tr("עדיפות עד")}<select className={inputCls + " mt-1 !w-28"} value={minG} onChange={(e) => setMinG(e.target.value as Grade)}>{(["A", "B", "C", "D"] as Grade[]).map((g) => <option key={g} value={g}>{g}</option>)}</select></label>
          <label className="text-xs text-slate-500">{tr("פגישה עם")}<input className={inputCls + " mt-1 !w-32"} value={who} onChange={(e) => setWho(e.target.value)} /></label>
          <label className="text-xs flex items-center gap-1 border rounded-lg px-2 py-2"><input type="checkbox" checked={onlyScan} onChange={(e) => setOnlyScan(e.target.checked)} />{tr("רק לקוחות שנסרקו")}</label>
          <button className={btnPrimary} onClick={() => window.print()}>🖨️ {tr("הדפס / PDF")}</button>
          <button className={btnGhost} onClick={csv}>⬇️ Excel</button>
          <button className={btnGhost} disabled={!rows.length} onClick={() => setMail((m) => !m)}>✉ {tr("שלח במייל")}</button>
        </Card>
        {mail && <SheetEmail head={head} rows={table} ind={ind} who={who} date={fmtDate(todayIso())} tons={Math.round(tons * 10) / 10} onClose={() => setMail(false)} />}
      </div>
      <div dir="rtl" className="bg-white">
        <div className="flex flex-wrap items-baseline gap-x-4 mb-2">
          <h2 className="text-lg font-bold">{tr("דף פגישה")} — {ind || tr("כל התעשיות")}</h2>
          <span className="text-sm text-slate-600">{tr("פגישה עם")} {who} · {fmtDate(todayIso())} · {rows.length} {tr("לקוחות")} · ~{Math.round(tons * 10) / 10} {tr("טון/שנה (הערכה)")}</span>
          <span className="text-xs text-slate-500">{tr("ספירים — Silitex ישראל · פנימי")}</span>
        </div>
        <table className="sheet-table w-full border-collapse text-[12px]">
          <thead><tr>
            <th className={th + " w-6"}>#</th><th className={th + " w-[15%]"}>{tr("חברה / עיר")}</th><th className={th + " w-[11%]"}>{tr("איש קשר")}</th><th className={th + " w-[17%]"}>{tr("מה מייצרים")}</th><th className={th + " w-[11%]"}>{tr("ספק / מוצר נוכחי")}</th><th className={th + " w-[16%]"}>{tr("התאמת Silitex")}</th><th className={th + " w-10"}>{tr("ט'/שנה")}</th><th className={th + " w-8"}>{tr("עדיפות")}</th><th className={th + " w-[18%]"}>{tr("עדכון / הערות")} — {who}</th><th className={th + " w-6"}>✓</th>
          </tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={r.l.id}>
              <td className={td}>{i + 1}</td>
              <td className={td}><b>{r.l.name}</b>{r.l.city && <div className="text-slate-500">{r.l.city}</div>}</td>
              <td className={td}>{r.l.contact_name || "—"}{r.l.contact_role && <div className="text-slate-500">{r.l.contact_role}</div>}{r.l.contact_phone && <div dir="ltr" className="text-end">{r.l.contact_phone}</div>}</td>
              <td className={td} dir="auto">{cut(r.make, 160) || "—"}</td>
              <td className={td} dir="auto">{r.cur || "—"}</td>
              <td className={td} dir="ltr">{r.sil || <span className="text-slate-400">{r.scanned ? tr("אין התאמה") : tr("לא נסרק")}</span>}</td>
              <td className={td + " text-center"}>{r.s.tons}</td>
              <td className={td + " text-center"}><Badge tone={r.s.grade === "A" ? "green" : r.s.grade === "B" ? "blue" : r.s.grade === "C" ? "amber" : "slate"}>{r.s.grade}</Badge></td>
              <td className={td + " h-14"}></td><td className={td}></td>
            </tr>))}</tbody>
        </table>
        {rows.length === 0 && <p className="text-sm text-slate-500 mt-2">{tr("אין לקוחות לפי הסינון.")}</p>}
      </div>
    </div>
  );
}
