"use client";
// page.tsx (src/app/scan/page.tsx) · updated 22.10.2026 07:35 (Asia/Jerusalem) — scan response read safely (time-out → clear message) · 22.10.2026 07:25 (Asia/Jerusalem) — ✏️ fix the website inline (paste the corrected link → 💾 save + scan at once) · filter: only failed / no website, for cleaning · 20.10.2026 18:30 (Asia/Jerusalem) — 🎁 free-match-report requests panel on top · 10:55 — live run monitor (timer per customer, ETA, live log) · 10:45 — failed sites saved with the reason, not counted as pending, "retry failed" button · 06:00 — BATCH WEBSITE SCAN: pick an industry → every customer with a website → "scan all not yet scanned" (one by one, progress, cost) → products + Silitex matches saved on each customer → table + Excel (CSV) + export bar = the list for Pini / the Friday report.
import { useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, H1, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import ScanView from "@/components/scan/ScanView";
import RunPanel, { type RunLog } from "@/components/scan/RunPanel";
import MatchRequests from "@/components/scan/MatchRequests";
import { scanOf, withScan, scanText, scanErr, withScanErr, errHe, type ScanResult, readScan } from "@/lib/scan";
import { fmtDate } from "@/lib/format";
import type { Usage, Lead } from "@/lib/types";
const normUrl = (u: string) => { const t = u.trim().replace(/\s+/g, ""); return !t ? "" : /^https?:\/\//i.test(t) ? t : "https://" + t; };
import { useLang } from "@/i18n";
export default function ScanPage() {
  const { t: tr } = useLang();
  const { state, ready, upsertLead, addSpend } = useStore();
  const [ind, setInd] = useState("Personal Care & Cosmetics"); const [busy, setBusy] = useState(""); const [done, setDone] = useState(0); const [usage, setUsage] = useState<Usage | null>(null); const [runCost, setRunCost] = useState(0); const [errs, setErrs] = useState<Record<string, string>>({}); const [open, setOpen] = useState(""); const [qn, setQn] = useState(0); const [log, setLog] = useState<RunLog[]>([]); const [curStart, setCurStart] = useState(0); const [runStart, setRunStart] = useState(0); const stopR = useRef(false); const [ed, setEd] = useState(""); const [url, setUrl] = useState(""); const [fix, setFix] = useState(false);
  if (!ready) return null;
  const inds = Array.from(new Set(state.leads.map((l) => l.industry))).sort();
  const list = state.leads.filter((l) => (!ind || l.industry === ind) && (!fix || !l.website || !!scanErr(l))).sort((a, b) => a.name.localeCompare(b.name));
  const failed = list.filter((l) => l.website && scanErr(l));
  const todo = list.filter((l) => l.website && !scanOf(l) && !scanErr(l));
  const scanOne = async (id: string, fresh?: Lead) => {
    const l = fresh || state.leads.find((x) => x.id === id); if (!l?.website) return; setBusy(id); const t0 = Date.now(); setCurStart(t0); let c = 0;
    try {
      const r = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: l.name, website: l.website, industry: l.industry }) });
      const j = await readScan(r); if (j.usage) { setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); setRunCost((x) => x + j.usage.cost_usd); c = j.usage.cost_usd; }
      if (!r.ok || !j.data) throw new Error(j.error || "no answer");
      const res: ScanResult = { data: j.data, at: j.at, pages: j.pages, urls: j.urls || [], sector: j.sector || "" }; upsertLead(withScan(l, res)); setLog((g) => [...g, { id, name: l.name, sec: (Date.now() - t0) / 1000, ok: true, info: (j.data.matches?.length || 0) + " " + tr("התאמות") + " · " + (j.pages || 0) + " " + tr("עמודים"), cost: c }]); setErrs((e) => { const n = { ...e }; delete n[id]; return n; });
    } catch (e) { const m = errHe(e instanceof Error ? e.message : "error"); setErrs((x) => ({ ...x, [id]: m })); upsertLead(withScanErr(l, m)); setLog((g) => [...g, { id, name: l.name, sec: (Date.now() - t0) / 1000, ok: false, info: m, cost: c }]); }
    setDone((d) => d + 1);
  };
  const runAll = async (q = todo) => { stopR.current = false; setDone(0); setRunCost(0); setQn(q.length); setLog([]); setRunStart(Date.now()); for (const l of q) { if (stopR.current) break; await scanOne(l.id); } setBusy(""); };
  const saveUrl = async (l: Lead) => { const w = normUrl(url); if (!w) return; const fresh = { ...l, website: w }; upsertLead(fresh); setEd(""); setErrs((e) => { const n = { ...e }; delete n[l.id]; return n; }); await scanOne(l.id, fresh); setBusy(""); };
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
      <MatchRequests />
      <Card className="space-y-2">
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-slate-500">{tr("תעשייה")}<select className={inputCls + " mt-1"} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">{tr("הכל")}</option>{inds.map((i) => <option key={i} value={i}>{i} ({state.leads.filter((l) => l.industry === i).length})</option>)}</select></label>
          <div className="text-sm text-slate-600 flex-1"><span dir="ltr">{scanned}/{list.length}</span> {tr("נסרקו")} · <span dir="ltr">{todo.length}</span> {tr("ממתינים")} · {failed.length > 0 && <><span dir="ltr" className="text-red-600">{failed.length}</span> {tr("נכשלו")} · </>} <span dir="ltr">{list.filter((l) => !l.website).length}</span> {tr("בלי אתר")}</div>
          <label className="text-xs flex items-center gap-1 border rounded-lg px-2 py-2 bg-amber-50"><input type="checkbox" checked={fix} onChange={(e) => setFix(e.target.checked)} />🧹 {tr("רק נכשלו / בלי אתר")}</label>
          {busy ? <button className={btnGhost} onClick={() => { stopR.current = true; }}>⏹ {tr("עצור")}</button> : <><button className={btnPrimary} disabled={!todo.length} onClick={() => runAll(todo)}>▶ {tr("סרוק את כל הממתינים")} ({todo.length})</button>{failed.length > 0 && <button className={btnGhost} onClick={() => runAll(failed)}>🔁 {tr("נסה שוב את שנכשלו")} ({failed.length})</button>}</>}
          <button className={btnGhost} onClick={csv}>⬇️ Excel (CSV)</button>
        </div>
        {(busy || log.length > 0) && <RunPanel current={busy ? state.leads.find((l) => l.id === busy)?.name || "" : ""} curStart={curStart} runStart={runStart} done={done} total={qn} cost={runCost} log={log} />}
        <div className="text-[11px] text-slate-400">{tr("כ-20–60 שניות ללקוח · עלות משוערת 2–5 סנט ללקוח")}</div>
      </Card>
      <Card className="divide-y">{list.map((l) => { const r = scanOf(l); return (
        <div key={l.id} className="py-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link href={"/leads/" + l.id} className="font-medium text-brand-700 hover:underline">{l.name}</Link><span className="text-xs text-slate-400">{l.city}</span>
            {ed === l.id ? <span className="flex items-center gap-1"><input autoFocus dir="ltr" className={inputCls + " py-1 w-64 text-xs"} placeholder="https://www.company.co.il" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveUrl(l); if (e.key === "Escape") setEd(""); }} /><button className={btnPrimary + " text-xs py-1"} disabled={!url.trim() || !!busy} onClick={() => saveUrl(l)}>💾 {tr("שמור וסרוק")}</button><button className={btnGhost + " text-xs py-1"} onClick={() => setEd("")}>✕</button></span> : <>{l.website ? <a href={l.website} target="_blank" rel="noreferrer" className="text-xs text-slate-400 underline" dir="ltr">{l.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a> : <span className="text-xs text-amber-700">{tr("בלי אתר")}</span>}<button className="text-xs text-slate-400 hover:text-brand-600" title={tr("תקן כתובת אתר")} disabled={!!busy} onClick={() => { setEd(l.id); setUrl(l.website || ""); }}>✏️</button></>}
            <span className="ms-auto text-xs">{busy === l.id ? "⏳" : r ? "✓ " + fmtDate(r.at.slice(0, 10)) + " · " + (r.data.matches?.length || 0) + " " + tr("התאמות") : errs[l.id] || scanErr(l) ? <span className="text-red-600">⚠️ {errs[l.id] || scanErr(l)}</span> : ""}</span>
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
