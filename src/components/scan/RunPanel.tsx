"use client";
// RunPanel.tsx (src/components/scan/RunPanel.tsx) · created 20.10.2026 10:55 (Asia/Jerusalem) — LIVE SCAN MONITOR: current customer with a ticking timer + stage, run clock, average per customer, time left (ETA), finish time, and a live log (name · seconds · ✓ matches / ⚠ reason · cost) with a duration bar per customer.
import { useEffect, useState } from "react";
import { useLang } from "@/i18n";
export type RunLog = { id: string; name: string; sec: number; ok: boolean; info: string; cost: number };
const mmss = (s: number) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
export default function RunPanel({ current, curStart, runStart, done, total, cost, log }: { current: string; curStart: number; runStart: number; done: number; total: number; cost: number; log: RunLog[] }) {
  const { t: tr } = useLang();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const cur = curStart ? (now - curStart) / 1000 : 0; const run = runStart ? (now - runStart) / 1000 : 0;
  const avg = log.length ? log.reduce((a, l) => a + l.sec, 0) / log.length : 40; const left = Math.max(0, total - done) * avg;
  const finish = new Date(now + left * 1000).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const ok = log.filter((l) => l.ok).length; const maxSec = Math.max(60, ...log.map((l) => l.sec));
  const stage = cur < 25 ? tr("קורא את האתר") : cur < 50 ? tr("קורא עמודי מוצרים / קורא חלופי") : tr("AI מנתח ומתאים Silitex");
  const pct = Math.round((done / Math.max(1, total)) * 100);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
        {[[tr("התקדמות"), done + "/" + total + " · " + pct + "%"], [tr("זמן ריצה"), mmss(run)], [tr("ממוצע ללקוח"), Math.round(avg) + "s"], [tr("נותר בערך"), mmss(left)], [tr("סיום משוער"), finish]].map(([k, v]) => (
          <div key={k} className="bg-slate-50 rounded-lg p-2"><div className="text-[11px] text-slate-500">{k}</div><div className="font-bold" dir="ltr">{v}</div></div>))}
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-3 bg-brand-500 transition-all" style={{ width: pct + "%" }} /></div>
      {current && (
        <div className="flex items-center gap-3 border-2 border-brand-500 rounded-xl p-3 bg-brand-50/40">
          <div className="animate-spin text-xl">⏳</div>
          <div className="flex-1 min-w-0"><div className="font-bold truncate">{current}</div><div className="text-xs text-slate-500">{stage}</div></div>
          <div className="text-2xl font-mono font-bold" dir="ltr">{mmss(cur)}</div>
        </div>)}
      <div className="text-xs text-slate-500">✓ {ok} · ⚠ {log.length - ok} · ≈ <span dir="ltr">${cost.toFixed(2)}</span></div>
      {log.length > 0 && (
        <ul className="text-xs divide-y max-h-72 overflow-auto border rounded-lg">
          {[...log].reverse().map((l, i) => (
            <li key={l.id + i} className="flex items-center gap-2 px-2 py-1.5">
              <span className="w-4">{l.ok ? "✓" : "⚠️"}</span>
              <span className="w-48 truncate font-medium">{l.name}</span>
              <span className="flex-1 h-2 bg-slate-100 rounded"><span className={"block h-2 rounded " + (l.ok ? "bg-emerald-500" : "bg-red-400")} style={{ width: Math.round((l.sec / maxSec) * 100) + "%" }} /></span>
              <span className="w-12 text-end font-mono" dir="ltr">{Math.round(l.sec)}s</span>
              <span className={"w-44 truncate " + (l.ok ? "text-slate-600" : "text-red-600")}>{l.info}</span>
              <span className="w-12 text-end text-slate-400" dir="ltr">${l.cost.toFixed(3)}</span>
            </li>))}
        </ul>)}
    </div>
  );
}
