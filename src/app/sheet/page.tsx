"use client";
// page.tsx (src/app/sheet/page.tsx) · updated 25.10.2026 10:50 (Asia/Jerusalem) — v0.92.4 print + PDF: one customer per page · 10:00 v0.92.2 e-mail "To" filled from the saved contact (פיני → his e-mail) · 25.10.2026 08:25 (Asia/Jerusalem) — 📤 WhatsApp / share with PDF + Excel files · ✉ e-mail with PDF + Excel · 📋 ticks → tasks (TDS to send / sample to request) · 08:10 — #1 meeting tool: 🔎 zoom on ONE company (on-site visit) · "מקבילה מתחרה (הערכה)" (✓ when confirmed in the intake form) · Silitex matches ONE PER LINE in a second full-width row, each with the other producers' equivalents · tick boxes saved on the customer: לקוח של פיני / TDS נדרש / דוגמה נדרשת · landscape note · 06:45 — ✉ e-mail · created 06:30 — printable meeting sheet per industry
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { useLang } from "@/i18n";
import { Card, H1, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { scanOf } from "@/lib/scan";
import { scoreLead, type Grade } from "@/lib/priority";
import { fmtDate, todayIso } from "@/lib/format";
import { offsetsFor } from "@/lib/sheet-offsets";
import SheetEmail from "@/components/sheet/SheetEmail";
import YesNo from "@/components/sheet/YesNo";
import type { Lead } from "@/lib/types";
import { sheetXlsx, sheetPdf, shareFiles, download } from "@/lib/sheet-files";

const RANK: Record<Grade, number> = { A: 0, B: 1, C: 2, D: 3 };
const PRINT_CSS = "@media print { @page { size: A4 landscape; margin: 9mm; } body { background: #fff !important; } .sheet-table thead { display: table-header-group; } .sheet-table { font-size: 11pt; } .sheet-table tbody { break-inside: avoid; break-after: page; } .sheet-table tbody:last-of-type { break-after: auto; } }";
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const TICKS = [{ k: "SHEET_PINI", he: "לקוח של" }, { k: "SHEET_TDS", he: "דפי מידע (TDS) נדרשים" }, { k: "SHEET_SAMPLE", he: "דוגמה נדרשת" }];
const yn = (v?: string) => (v === "yes" ? "כן" : v === "no" ? "לא" : "");
/** Latin names get dir="ltr" — keeps "(Israel)" brackets right in the PDF picture */
const dirOf = (s: string) => (/[\u0590-\u05FF]/.test(s.replace(/\(.*?\)|\[.*?\]/g, "")) ? "rtl" : "ltr");

export default function SheetPage() {
  const { t: tr } = useLang(); const { state, ready, upsertLead, addTask } = useStore(); const sheetRef = useRef<HTMLDivElement>(null); const [busy, setBusy] = useState(""); const [note, setNote] = useState("");
  const [ind, setInd] = useState("Personal Care & Cosmetics"); const [minG, setMinG] = useState<Grade>("D"); const [onlyScan, setOnlyScan] = useState(false); const [who, setWho] = useState("פיני"); const [mail, setMail] = useState(false); const [co, setCo] = useState("");
  useEffect(() => { const q = new URLSearchParams(window.location.search); if (q.get("industry")) setInd(q.get("industry") || ""); if (q.get("lead")) setCo(q.get("lead") || ""); }, []);
  const inds = useMemo(() => Array.from(new Set(state.leads.map((l) => l.industry))).sort(), [state.leads]);
  const focus = state.leads.find((l) => l.id === co);
  const rows = useMemo(() => state.leads.filter((l) => (co ? l.id === co : (!ind || l.industry === ind) && l.stage !== "lost")).map((l) => {
    const sc = scanOf(l); const s = scoreLead(l, state.tasks);
    const ms = (sc?.data.matches || []).filter((m) => m.confidence !== "low").sort((a, b) => (a.confidence === "high" ? 0 : 1) - (b.confidence === "high" ? 0 : 1));
    const seen = new Set<string>(); const sil = ms.filter((m) => !seen.has(m.silitex.toUpperCase()) && seen.add(m.silitex.toUpperCase())).slice(0, 6).map((m) => ({ name: m.silitex, conf: m.confidence || "", eq: offsetsFor(m.silitex, m.countertype), use: m.for || "" }));
    if (!sil.length && l.recommended_sku) l.recommended_sku.split(/,\s*/).slice(0, 6).forEach((x) => sil.push({ name: x.replace(/\s+—.*$/, ""), conf: "plan", eq: offsetsFor(x), use: "" }));
    const conf = [l.intake?.BEN_001, l.intake?.BEN_002].filter(Boolean).join(" · ");
    return { l, s, sil, make: sc?.data.summary || l.sub_industry || l.use_case || "", conf, est: l.competitor_offset || "", scanned: !!sc };
  }).filter((r) => co || (RANK[r.s.grade] <= RANK[minG] && (!onlyScan || r.scanned))).sort((a, b) => RANK[a.s.grade] - RANK[b.s.grade] || b.s.total - a.s.total), [state.leads, state.tasks, ind, minG, onlyScan, co]);
  if (!ready) return null;
  const tons = Math.round(rows.reduce((a, r) => a + r.s.tons, 0) * 10) / 10;
  const setTick = (l: Lead, k: string, v: string) => upsertLead({ ...l, intake: { ...(l.intake || {}), [k]: v } as Lead["intake"] });
  const head = ["#", "חברה / עיר", "איש קשר / טלפון", "מה מייצרים", "מקבילה מתחרה (הערכה)", "התאמות Silitex — ומקבילות אצל יצרנים אחרים", "ט'/שנה", "עדיפות", "לקוח של " + who, "TDS נדרש", "דוגמה נדרשת", "עדכון / הערות — " + who];
  const table: (string | number)[][] = rows.map((r, i) => [i + 1, r.l.name + (r.l.city ? " · " + r.l.city : ""), [r.l.contact_name, r.l.contact_role, r.l.contact_phone].filter(Boolean).join(" · "), cut(r.make, 220), r.conf ? "✓ " + r.conf : r.est, r.sil.map((x) => x.name + (x.eq ? " = " + x.eq : "")).join("\n") || (r.scanned ? "אין התאמה" : "לא נסרק"), r.s.tons, r.s.grade, yn(r.l.intake?.SHEET_PINI), yn(r.l.intake?.SHEET_TDS), yn(r.l.intake?.SHEET_SAMPLE), ""]);
  const csv = () => {
    const esc = (v: string | number) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const b = new Blob(["﻿" + [head.map(esc).join(","), ...table.map((r) => r.map(esc).join(","))].join("\n")], { type: "text/csv;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "meeting_sheet_" + (focus ? focus.name : ind || "all").replace(/\W+/g, "_") + "_" + todayIso() + ".csv"; a.click();
  };
  const base = "meeting_sheet_" + (focus ? focus.name : ind || "all").replace(/\W+/g, "_") + "_" + todayIso();
  const makePdf = async () => { if (!sheetRef.current) throw new Error("no sheet"); return sheetPdf(sheetRef.current, base + ".pdf"); };
  const share = async () => {
    setBusy("share"); setNote("");
    try {
      const files = [await makePdf(), await sheetXlsx(head, table, base + ".xlsx")];
      const text = "דף פגישה — " + (focus ? focus.name : ind || "כל התעשיות") + " — " + fmtDate(todayIso()) + " · " + rows.length + " לקוחות. מצורפים PDF ו-Excel.\nאבשי ספיר · ספירים — Silitex ישראל · 050-5231042";
      const ok = await shareFiles(files, "דף פגישה", text);
      if (!ok) { files.forEach(download); window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank"); setNote(tr("הקבצים ירדו למחשב — צרף אותם בצ׳אט של WhatsApp שנפתח")); }
    } catch { setNote(tr("יצירת הקבצים נכשלה — נסה שוב")); }
    setBusy("");
  };
  // 📋 Ferrari: ticks → ready tasks in "My day" (TDS to send / sample to request), no duplicates of an open task
  const toTasks = () => {
    let n = 0;
    for (const r of rows) {
      const g = r.sil.slice(0, 3).map((x) => x.name).join(", ");
      const want = [r.l.intake?.SHEET_TDS === "yes" && "📄 לשלוח TDS" + (g ? ": " + g : ""), r.l.intake?.SHEET_SAMPLE === "yes" && "🧪 בקשת דוגמה מ-Silitex" + (g ? ": " + g : "")].filter(Boolean) as string[];
      for (const title of want) if (!state.tasks.some((t) => t.lead_id === r.l.id && !t.done && t.title === title)) { addTask({ lead_id: r.l.id, lead_name: r.l.name, title, due: todayIso(), cadence: "once", kind: "followup" }); n++; }
    }
    setNote(n ? "✓ " + n + " " + tr("משימות נוספו ל'היום שלי'") : tr("אין סימוני TDS / דוגמה חדשים"));
  };
  const nTicks = rows.filter((r) => r.l.intake?.SHEET_TDS === "yes" || r.l.intake?.SHEET_SAMPLE === "yes").length;
  const th = "border border-slate-400 p-1 text-start align-bottom bg-slate-100"; const td = "border border-slate-300 p-1 align-top"; const big = co ? " text-[15px]" : "";
  return (
    <div className="space-y-3">
      <style>{PRINT_CSS}</style>
      <div className="print:hidden space-y-3">
        <H1 sub={tr("טבלה להדפסה לכל תעשייה או לחברה אחת — לסמן ביד בפגישה, ואחר כך להקליד את העדכונים בכרטיס הלקוח")}>🖨️ {tr("דף פגישה להדפסה")}</H1>
        <Card className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-slate-500">{tr("תעשייה")}<select className={inputCls + " mt-1"} disabled={!!co} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">{tr("הכל")}</option>{inds.map((i) => <option key={i} value={i}>{i} ({state.leads.filter((l) => l.industry === i).length})</option>)}</select></label>
          <label className="text-xs text-slate-500">🔎 {tr("חברה אחת (ביקור באתר)")}<select className={inputCls + " mt-1 !w-72" + (co ? " !border-brand-500 bg-brand-50" : "")} value={co} onChange={(e) => setCo(e.target.value)}><option value="">{tr("— כל החברות בסינון —")}</option>{state.leads.filter((l) => !ind || l.industry === ind || l.id === co).sort((a, b) => a.name.localeCompare(b.name)).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
          <label className="text-xs text-slate-500">{tr("עדיפות עד")}<select className={inputCls + " mt-1 !w-24"} disabled={!!co} value={minG} onChange={(e) => setMinG(e.target.value as Grade)}>{(["A", "B", "C", "D"] as Grade[]).map((g) => <option key={g} value={g}>{g}</option>)}</select></label>
          <label className="text-xs text-slate-500">{tr("פגישה עם")}<input className={inputCls + " mt-1 !w-28"} value={who} onChange={(e) => setWho(e.target.value)} /></label>
          <label className="text-xs flex items-center gap-1 border rounded-lg px-2 py-2"><input type="checkbox" disabled={!!co} checked={onlyScan} onChange={(e) => setOnlyScan(e.target.checked)} />{tr("רק לקוחות שנסרקו")}</label>
          <button className={btnPrimary} onClick={() => window.print()}>🖨️ {tr("הדפס / PDF")}</button>
          <button className={btnGhost} onClick={csv}>⬇️ Excel</button>
          <button className={btnGhost} disabled={!rows.length} onClick={() => setMail((m) => !m)}>✉ {tr("שלח במייל")}</button>
          <button className={btnGhost} disabled={!rows.length || !!busy} onClick={share}>{busy === "share" ? "⏳" : "📤"} {tr("WhatsApp / שיתוף — PDF + Excel")}</button>
          <button className={btnGhost} disabled={!nTicks} onClick={toTasks} title={tr("כל סימון TDS / דוגמה = משימה ב'היום שלי'")}>📋 {tr("משימות מהדף")} ({nTicks})</button>
          {note && <span className="text-sm text-emerald-700">{note}</span>}
        </Card>
        {mail && <SheetEmail head={head} rows={table} ind={focus ? focus.name : ind} who={who} people={state.contacts.filter((c) => c.email).map((c) => ({ name: c.name, email: c.email || "" }))} date={fmtDate(todayIso())} tons={tons} onClose={() => setMail(false)} makePdf={makePdf} />}
      </div>
      <div dir="rtl" className="bg-white p-1" ref={sheetRef}>
        <div className="flex flex-wrap items-baseline gap-x-4 mb-1">
          <h2 className="text-lg font-bold">{tr("דף פגישה")} — {focus ? focus.name : ind || tr("כל התעשיות")}</h2>
          <span className="text-sm text-slate-600">{tr("פגישה עם")} {who} · {fmtDate(todayIso())} · {rows.length} {tr("לקוחות")} · ~{tons} {tr("טון/שנה (הערכה)")}</span>
          <span className="text-xs text-slate-500">{tr("ספירים — Silitex ישראל · פנימי")}</span>
        </div>
        <div className="text-[11px] text-slate-500 mb-2">📄 {tr("הדפסה ו-PDF: לרוחב (Landscape), לקוח אחד בכל עמוד.")} · {tr("\"מקבילה מתחרה\" היא הערכה מתוכנית השוק; ✓ = אושר מול הלקוח (טופס קליטה).")}</div>
        <table className={"sheet-table w-full border-collapse text-[12px]" + big}>
          <thead><tr>
            <th className={th + " w-6"}>#</th><th className={th + " w-[14%]"}>{tr("חברה / עיר")}</th><th className={th + " w-[11%]"}>{tr("איש קשר")}</th><th className={th + " w-[18%]"}>{tr("מה מייצרים")}</th><th className={th + " w-[13%]"}>{tr("מקבילה מתחרה (הערכה)")}</th><th className={th + " w-10"}>{tr("ט'/שנה")}</th><th className={th + " w-8"}>{tr("עדיפות")}</th>
            <th className={th + " w-14"}>{tr("לקוח של")} {who}</th><th className={th + " w-14"}>{tr("דפי מידע (TDS) נדרשים")}</th><th className={th + " w-14"}>{tr("דוגמה נדרשת")}</th><th className={th + " w-[16%]"}>{tr("עדכון / הערות")} — {who}</th>
          </tr></thead>
          {rows.map((r, i) => (
            <tbody key={r.l.id} data-pdf-page="1" className="border-t-2 border-slate-500">
              <tr>
                <td className={td}>{i + 1}</td>
                <td className={td}><b dir={dirOf(r.l.name)} className="block">{r.l.name}</b>{r.l.city && <div className="text-slate-500">{r.l.city}</div>}</td>
                <td className={td}>{r.l.contact_name || "—"}{r.l.contact_role && <div className="text-slate-500">{r.l.contact_role}</div>}{r.l.contact_phone && <div dir="ltr" className="text-end">{r.l.contact_phone}</div>}</td>
                <td className={td} dir="auto">{cut(r.make, co ? 600 : 170) || "—"}</td>
                <td className={td} dir="ltr">{r.conf ? <b>✓ {r.conf}</b> : r.est ? <span className="text-slate-600">{r.est}</span> : "—"}</td>
                <td className={td + " text-center"}>{r.s.tons}</td>
                <td className={td + " text-center"}><Badge tone={r.s.grade === "A" ? "green" : r.s.grade === "B" ? "blue" : r.s.grade === "C" ? "amber" : "slate"}>{r.s.grade}</Badge></td>
                {TICKS.map((t) => <td key={t.k} className={td}><YesNo v={r.l.intake?.[t.k] || ""} onChange={(v) => setTick(r.l, t.k, v)} /></td>)}
                <td className={td + " h-16"}></td>
              </tr>
              <tr className="bg-slate-50/70">
                <td className={td}></td>
                <td className={td} colSpan={10}>
                  <div className="text-[11px] font-bold text-slate-600 mb-0.5">{tr("התאמות Silitex — ומקבילות אצל יצרנים אחרים")}{r.sil.some((x) => x.conf === "plan") && <span className="font-normal"> ({tr("מתוכנית השוק — לא נסרק")})</span>}</div>
                  {r.sil.length ? r.sil.map((x) => (
                    <div key={x.name} dir="ltr" className="text-start leading-5"><b>{x.name}</b>{x.conf === "high" && <span className="text-emerald-700"> ●</span>}{x.eq && <span className="text-slate-700"> = {x.eq}</span>}{x.use && <span className="text-slate-500" dir="auto"> — {cut(x.use, co ? 200 : 90)}</span>}</div>
                  )) : <span className="text-slate-400">{r.scanned ? tr("אין התאמה") : tr("לא נסרק")}</span>}
                </td>
              </tr>
            </tbody>))}
        </table>
        {rows.length === 0 && <p className="text-sm text-slate-500 mt-2">{tr("אין לקוחות לפי הסינון.")}</p>}
      </div>
    </div>
  );
}
