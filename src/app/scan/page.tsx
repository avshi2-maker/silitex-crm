"use client";
// page.tsx (src/app/scan/page.tsx) · updated 20.10.2026 06:00 (Asia/Jerusalem) — BATCH WEBSITE SCAN: pick an industry → every customer with a website → "scan all not yet scanned" (one by one, progress, cost) → products + Silitex matches saved on each customer → table + Excel (CSV) + export bar = the list for Pini / the Friday report.
import { useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, H1, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import ScanView from "@/components/scan/ScanView";
import { scanOf, withScan, scanText, type ScanResult } from "@/lib/scan";
import { fmtDate } from "@/lib/format";
import type { Usage } from "@/lib/types";
import { useLang } from "@/i18n";
export default function ScanPage() {
  const { t: tr } = useLang();
  const { state, ready, upsertLead, addSpend } = useStore();
  const [ind, setInd] = useState("Personal Care & Cosmetics"); const [busy, setBusy] = useState(""); const [done, setDone] = useState(0); const [usage, setUsage] = useState<Usage | null>(null); const [runCost, setRunCost] = useState(0); const [errs, setErrs] = useState<Record<string, string>>({}); const [open, setOpen] = useState(""); const stopR = useRef(false);
  if (!ready) return null;
  const inds = Array.from(new Set(state.leads.map((l) => l.industry))).sort();
  const list = state.leads.filter((l) => !ind || l.industry === ind).sort((a, b) => a.name.localeCompare(b.name));
  const todo = list.filter((l) => l.website && !scanOf(l));
  const scanOne = async (id: string) => {
    const l = state.leads.find((x) => x.id === id); if (!l?.website) return; setBusy(id);
    try {
      const r = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: l.name, website: l.website, industry: l.industry }) });
      const j = await r.json(); if (j.usage) { setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); setRunCost((c) => c + j.usage.cost_usd); }
      if (!r.ok || !j.data) throw new Error(j.error || "no answer");
      const res: ScanResult = { data: j.data, at: j.at, pages: j.pages, urls: j.urls || [], sector: j.sector || "" }; upsertLead(withScan(l, res)); setErrs((e) => { const n = { ...e }; delete n[id]; return n; });
    } catch (e) { setErrs((x) => ({ ...x, [id]: e instanceof Error ? e.message : "error" })); }
    setDone((d) => d + 1);
  };
  const runAll = async () => { stopR.current = false; setDone(0); setRunCost(0); for (const l of todo) { if (stopR.current) break; await scanOne(l.id); } setBusy(""); };
  const csv = () => {
    const esc = (s: string) => '"' + String(s || "").replace(/"/g, '""') + '"';
    const rows = [["Customer", "City", "Website", "Scanned", "Products", "Silitex matches", "R&D questions", "Value angle"].join(",")];
    for (const l of list) { const r = scanOf(l); rows.push([l.name, l.city || "", l.website || "", r ? fmtDate(r.at.slice(0, 10)) : "", (r?.data.product_lines || []).map((p) => p.name).join(" · "), (r?.data.matches || []).map((m) => m.silitex + (m.countertype ? " = " + m.countertype : "") + " → " + (m.for || "")).join(" · "), (r?.data.questions || []).join(" | "), r?.data.value_angle || ""].map(esc).join(",")); }
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "silitex_scan_" + (ind || "all").replace(/\W+/g, "_") + ".csv"; a.click();
  };
  const text = list.filter((l) => scanOf(l)).map((l) => scanText(l.name, scanOf(l)!)).join("\n\n— — —\n\n");
  const scanned = list.filter((l) => scanOf(l)).length;
  return (
    <div className="space-y-4">
      <H1 sub={tr("קורא את אתר כל לקוח, מזהה מוצרים ושימושי סיליקון, ומתאים דרגות Silitex (קוסמטיקה = הטווח הרשמי + מקבילות). התוצאה נשמרת על כל לקוח — רשימה מוכנה לפגישה עם פיני ולדוח של יום שישי.")}>🔎 {tr("סריקת אתרי לקוחות")}</H1>
      <Card className="space-y-2">
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-slate-500">{tr("תעשייה")}<select className={inputCls + " mt-1"} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">{tr("הכל")}</option>{inds.map((i) => <option key={i} value={i}>{i} ({state.leads.filter((l) => l.industry === i).length})</option>)}</select></label>
          <div className="text-sm text-slate-600 flex-1"><span dir="ltr">{scanned}/{list.length}</span> {tr("נסרקו")} · <span dir="ltr">{todo.length}</span> {tr("ממתינים")} · <span dir="ltr">{list.filter((l) => !l.website).length}</span> {tr("בלי אתר")}</div>
          {busy ? <button className={btnGhost} onClick={() => { stopR.current = true; }}>⏹ {tr("עצור")}</button> : <button className={btnPrimary} disabled={!todo.length} onClick={runAll}>▶ {tr("סרוק את כל הממתינים")} ({todo.length})</button>}
          <button className={btnGhost} onClick={csv}>⬇️ Excel (CSV)</button>
        </div>
        {busy && <div className="space-y-1"><div className="text-xs text-slate-500">{tr("סורק")}: {state.leads.find((l) => l.id === busy)?.name} · <span dir="ltr">{done}/{todo.length + done}</span> · ≈ <span dir="ltr">${runCost.toFixed(2)}</span></div><div className="h-2 bg-slate-100 rounded"><div className="h-2 bg-brand-500 rounded" style={{ width: Math.round((done / Math.max(1, todo.length + done)) * 100) + "%" }} /></div></div>}
        <div className="text-[11px] text-slate-400">{tr("כ-20–60 שניות ללקוח · עלות משוערת 2–5 סנט ללקוח")}</div>
      </Card>
      <Card className="divide-y">{list.map((l) => { const r = scanOf(l); return (
        <div key={l.id} className="py-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link href={"/leads/" + l.id} className="font-medium text-brand-700 hover:underline">{l.name}</Link><span className="text-xs text-slate-400">{l.city}</span>
            {l.website ? <a href={l.website} target="_blank" rel="noreferrer" className="text-xs text-slate-400 underline" dir="ltr">{l.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a> : <span className="text-xs text-amber-700">{tr("בלי אתר")}</span>}
            <span className="ms-auto text-xs">{busy === l.id ? "⏳" : r ? "✓ " + fmtDate(r.at.slice(0, 10)) + " · " + (r.data.matches?.length || 0) + " " + tr("התאמות") : errs[l.id] ? <span className="text-red-600">⚠️ {errs[l.id]}</span> : ""}</span>
            {r && <button className="text-xs underline" onClick={() => setOpen(open === l.id ? "" : l.id)}>{open === l.id ? tr("סגור") : tr("פתח")}</button>}
            {l.website && !busy && <button className={btnGhost + " text-xs"} onClick={async () => { await scanOne(l.id); setBusy(""); }}>{r ? "🔄" : "🔎"}</button>}
          </div>
          {open === l.id && r && <div className="mt-2 bg-slate-50 rounded-lg p-2"><ScanView r={r} /></div>}
        </div>); })}</Card>
      <TokenMeter usage={usage} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} busy={!!busy} />
      {scanned > 0 && <ExportBar title={tr("סריקת לקוחות") + " — " + (ind || tr("הכל"))} text={text} filename={"scan_" + (ind || "all").replace(/\W+/g, "_") + ".txt"} />}
    </div>
  );
}
