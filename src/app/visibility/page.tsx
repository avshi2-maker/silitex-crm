"use client";
// page.tsx (src/app/visibility/page.tsx) · updated 18.10.2026 19:05 (Asia/Jerusalem) — AI VISIBILITY BOT (owner): asks your target buyer questions to Claude + ChatGPT with live web search and shows whether Sapirim is cited / mentioned, whether Silitex appears, which competitor brands the AI names, and the trend by month. Runs by itself on the 1st of every month; "Run now" for an instant check. Cost meter + export bar.
import { useEffect, useMemo, useState } from "react";
import { Card, H1, Stat, btnPrimary } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import VisMatrix, { type VisRow } from "@/components/visibility/VisMatrix";
import { VIS_QUESTIONS } from "@/config/visibility";
import { fmtDateTime, fmtMoney } from "@/lib/format";
import { useLang } from "@/i18n";
const ENGINES = ["claude", "chatgpt"] as const;
export default function VisibilityPage() {
  const { t: tr } = useLang();
  const [rows, setRows] = useState<VisRow[]>([]); const [configured, setConfigured] = useState(true); const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(0); const [runCost, setRunCost] = useState(0); const [err, setErr] = useState("");
  useEffect(() => { fetch("/api/visibility/history").then((r) => r.json()).then((j) => { setRows(j.rows || []); setConfigured(!!j.configured); }).catch(() => setConfigured(false)).finally(() => setLoaded(true)); }, []);
  const total = ENGINES.length * VIS_QUESTIONS.length;
  const runAll = async () => {
    setBusy(true); setDone(0); setRunCost(0); setErr("");
    const jobs = ENGINES.flatMap((engine) => VIS_QUESTIONS.map((q) => ({ engine, qid: q.id })));
    for (let i = 0; i < jobs.length; i += 3) {
      const res = await Promise.all(jobs.slice(i, i + 3).map((j) => fetch("/api/visibility/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(j) }).then((r) => r.json()).catch(() => null)));
      const got = res.filter(Boolean).map((r) => r.row as VisRow);
      setRows((x) => [...got, ...x]); setDone((d) => d + got.length); setRunCost((c) => c + got.reduce((s, r) => s + (r.cost_usd || 0), 0));
      const e = got.find((r) => r.error); if (e) setErr(e.error || "");
    }
    setBusy(false);
  };
  // latest result per engine × question
  const latest = useMemo(() => { const m = new Map<string, VisRow>(); for (const r of rows) { const k = r.engine + "|" + r.qid; if (!m.has(k)) m.set(k, r); } return m; }, [rows]);
  const score = (engine: string, f: (r: VisRow) => boolean) => VIS_QUESTIONS.filter((q) => { const r = latest.get(engine + "|" + q.id); return r && !r.error && f(r); }).length;
  const months = useMemo(() => { const m: Record<string, Record<string, { n: number; cited: number; ment: number; silitex: number }>> = {}; for (const r of rows) { if (r.error) continue; const k = r.at.slice(0, 7); const e = ((m[k] ||= {})[r.engine] ||= { n: 0, cited: 0, ment: 0, silitex: 0 }); e.n++; if (r.sapirim_cited) e.cited++; if (r.sapirim_mentioned) e.ment++; if (r.silitex_mentioned) e.silitex++; } return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12); }, [rows]);
  const brands = useMemo(() => { const c: Record<string, number> = {}; latest.forEach((r) => r.brands?.forEach((b) => (c[b] = (c[b] || 0) + 1))); return Object.entries(c).sort((a, b) => b[1] - a[1]); }, [latest]);
  const month30 = rows.filter((r) => Date.now() - new Date(r.at).getTime() < 30 * 864e5).reduce((s, r) => s + (r.cost_usd || 0), 0);
  const report = ENGINES.map((e) => e.toUpperCase() + ": Sapirim cited " + score(e, (r) => r.sapirim_cited) + "/" + VIS_QUESTIONS.length + " · mentioned " + score(e, (r) => r.sapirim_mentioned) + " · Silitex " + score(e, (r) => r.silitex_mentioned)).join("\n") + "\n\n" + VIS_QUESTIONS.map((q) => q.q + "\n" + ENGINES.map((e) => { const r = latest.get(e + "|" + q.id); return "  " + e + ": " + (!r ? "—" : r.error ? "error" : (r.sapirim_cited ? "✅ cited" : r.sapirim_mentioned ? "🟡 mentioned" : "⬜ not found") + (r.silitex_mentioned ? " · Silitex" : "") + (r.brands?.length ? " · " + r.brands.join(", ") : "")); }).join("\n")).join("\n\n");
  const last = rows[0]?.at;
  return (
    <div className="space-y-4">
      <H1 sub={tr("שואלים את Claude ואת ChatGPT (עם חיפוש באינטרנט) את השאלות שקונה אמיתי שואל — ובודקים אם ספירים מצוטטת, אם Silitex מופיעה, ואילו מותגים ה-AI ממליץ. רץ לבד ב-1 לכל חודש.")}>📡 {tr("נראות ב-AI")}</H1>
      {loaded && !configured && <Card className="bg-amber-50 border-amber-200 text-sm">⚠️ {tr("כדי לשמור היסטוריה: להריץ פעם אחת את supabase/ai_visibility.sql ב-Supabase → SQL Editor. בלי זה הבדיקה עובדת אבל התוצאות לא נשמרות.")}</Card>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ENGINES.map((e) => <Stat key={e} label={(e === "claude" ? "Claude" : "ChatGPT") + " · " + tr("ספירים מצוטטת")} value={"\u200E" + score(e, (r) => r.sapirim_cited) + " / " + VIS_QUESTIONS.length} hint={tr("מוזכרת: ") + score(e, (r) => r.sapirim_mentioned) + " · Silitex: " + score(e, (r) => r.silitex_mentioned)} />)}
        <Stat label={tr("בדיקה אחרונה")} value={last ? fmtDateTime(last) : "—"} hint={total + " " + tr("בדיקות בכל ריצה")} />
        <Stat label={tr("עלות")} value={fmtMoney(busy || runCost ? runCost : month30)} hint={busy || runCost ? tr("הריצה הזו") : tr("30 הימים האחרונים")} />
      </div>
      <Card className="space-y-2">
        <div className="flex flex-wrap items-center gap-3"><button className={btnPrimary + (rows.length || busy ? "" : " ai-pulse")} disabled={busy} onClick={runAll}>{busy ? tr("בודק… ") + done + " / " + total : "▶️ " + tr("הרץ בדיקה עכשיו")}</button><span className="text-xs text-slate-500">{tr("כ-2–4 דקות · פחות מדולר")}</span></div>
        {busy && <div className="h-2 bg-slate-100 rounded"><div className="h-2 bg-brand-500 rounded transition-all" style={{ width: Math.round((done / total) * 100) + "%" }} /></div>}
        {err && <div className="text-xs text-red-600">{err}</div>}
      </Card>
      <VisMatrix latest={latest} />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card><div className="font-bold mb-2">📈 {tr("מגמה לפי חודש")}</div>
          {months.length === 0 ? <div className="text-sm text-slate-400">{tr("עוד אין נתונים")}</div> : <table className="w-full text-sm"><thead><tr className="text-xs text-slate-500"><th className="text-start p-1">{tr("חודש")}</th>{ENGINES.map((e) => <th key={e} className="text-start p-1">{e === "claude" ? "Claude" : "ChatGPT"}</th>)}</tr></thead>
            <tbody>{months.map(([m, v]) => <tr key={m} className="border-t"><td className="p-1">{m.split("-").reverse().join("/")}</td>{ENGINES.map((e) => <td key={e} className="p-1"><span dir="ltr">{v[e] ? "✅ " + v[e].cited + " · 🟡 " + v[e].ment + " · S " + v[e].silitex + " / " + v[e].n : "—"}</span></td>)}</tr>)}</tbody></table>}
          <div className="text-[11px] text-slate-400 mt-1">✅ {tr("מצוטטת (קישור לאתר)")} · 🟡 {tr("מוזכרת בשם")} · S = Silitex</div>
        </Card>
        <Card><div className="font-bold mb-2">🏷️ {tr("מותגים שה-AI מזכיר")}</div>
          {brands.length === 0 ? <div className="text-sm text-slate-400">{tr("עוד אין נתונים")}</div> : <ul className="space-y-1 text-sm">{brands.map(([b, n]) => <li key={b} className="flex items-center gap-2"><span className="w-24">{b}</span><span className="h-2 bg-brand-500 rounded" style={{ width: Math.max(6, (n / (VIS_QUESTIONS.length * 2)) * 220) + "px" }} /><span className="text-xs text-slate-500">{n}</span></li>)}</ul>}
        </Card>
      </div>
      {rows.length > 0 && <ExportBar title={"AI visibility — Sapirim · " + (last ? fmtDateTime(last) : "")} text={report} filename="ai_visibility.txt" />}
    </div>
  );
}
