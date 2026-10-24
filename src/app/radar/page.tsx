"use client";
// page.tsx (src/app/radar/page.tsx) · created 24.10.2026 06:00 (Asia/Jerusalem)
// 🛰️ INDUSTRY GAP RADAR (owner): one click → Claude + web search reads Dow / Wacker / Momentive / Shin-Etsu / KCC Basildon industry pages
// → industries where Silitex-type products sell (electronics / medical / rubber moulding excluded) → matched to our CRM list → ⚠ gaps
// → ➕ add to the industry list (DB, every pick-list + scan + search brief) · 🧲 search now. Every run saved with date + cost (history). Meter + export bar.
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useLang } from "@/i18n";
import { Card, H1, Badge, btnPrimary, inputCls } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import RadarTable from "@/components/radar/RadarTable";
import { allIndustries } from "@/config/industry-list";
import { refreshExtra } from "@/lib/industries-extra";
import { PRODUCERS, EXCLUDE, radarText, type RadarRow, type RadarRun } from "@/lib/radar";
import { fmtDate } from "@/lib/format";

const mmss = (s: number) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");

export default function RadarPage() {
  const { t: tr } = useLang(); const { state, ready, addSpend } = useStore();
  const [runs, setRuns] = useState<RadarRun[]>([]); const [sel, setSel] = useState(0); const [onlyGaps, setOnlyGaps] = useState(false);
  const [busy, setBusy] = useState(false); const [t0, setT0] = useState(0); const [now, setNow] = useState(0); const [err, setErr] = useState("");
  const [added, setAdded] = useState<Record<string, boolean>>({}); const [, setTick] = useState(0);
  useEffect(() => { fetch("/api/radar", { cache: "no-store" }).then((r) => r.json()).then((j) => setRuns(j.runs || [])).catch(() => {}); refreshExtra().then(() => setTick((x) => x + 1)); }, []);
  useEffect(() => { if (!busy) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [busy]);
  const list = allIndustries();
  const inList = useMemo(() => (r: RadarRow) => { const low = (s: string) => s.trim().toLowerCase(); const hit = list.find((x) => low(x) === low(r.our_match)) || list.find((x) => low(x) === low(r.industry)); return hit || ""; }, [list]);
  if (!ready) return null;
  const run = runs[sel]; const rows = run ? run.rows.filter((r) => !onlyGaps || (!inList(r) && r.silitex_fit !== "no")) : [];
  const gaps = run ? run.rows.filter((r) => !inList(r) && r.silitex_fit !== "no").length : 0; const covered = run ? run.rows.filter((r) => inList(r)).length : 0;
  const count = (ind: string) => state.leads.filter((l) => l.industry === ind).length;
  const go = async () => {
    setBusy(true); setErr(""); const s = Date.now(); setT0(s); setNow(s);
    try {
      const r = await fetch("/api/radar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ours: list }) });
      const j = await r.json().catch(() => ({ error: "server " + r.status }));
      if (!r.ok || !j.run) setErr(j.error || tr("אין תשובה")); else { setRuns((x) => [j.run, ...x]); setSel(0); addSpend(j.run.input_tokens + j.run.output_tokens, Number(j.run.cost_usd)); }
    } catch { setErr(tr("תקלת רשת — נסה שוב")); }
    setBusy(false);
  };
  const add = async (r: RadarRow) => {
    const res = await fetch("/api/industries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: r.industry, who: r.who, uses: r.uses || r.functions, source: "radar " + fmtDate(new Date()) }) });
    if (res.ok) { await refreshExtra(); setAdded((a) => ({ ...a, [r.industry]: true })); } else setErr(tr("השמירה נכשלה"));
  };
  return (
    <div className="space-y-4">
      <H1 sub={tr("Claude קורא את דפי התעשיות של יצרני הסיליקון הגדולים, משאיר רק תעשיות שבהן נמכרים מוצרים מסוג Silitex, ומשווה לרשימה שלנו")}>🛰️ {tr("מכ״ם פערי תעשייה")}</H1>
      <Card className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button className={btnPrimary} disabled={busy} onClick={go}>{busy ? "⏳ " + tr("סורק יצרנים…") + " " + mmss((now - t0) / 1000) : "🛰️ " + tr("הרץ מכ״ם עכשיו")}</button>
          <span className="text-xs text-slate-500">{busy ? tr("בדרך כלל 2–5 דקות") : tr("עלות משוערת ≈ $1–2 לריצה · מספיק פעם בחודש")}</span>
          {runs.length > 0 && <select className={inputCls + " w-56 ms-auto"} value={sel} onChange={(e) => setSel(Number(e.target.value))}>{runs.map((x, i) => <option key={x.id} value={i}>{fmtDate(x.created_at)} · {x.rows.length} {tr("תעשיות")} · ${Number(x.cost_usd).toFixed(2)}</option>)}</select>}
        </div>
        <div className="text-[11px] text-slate-500" dir="ltr">Producers: {PRODUCERS.join(" · ")} — excluded: {EXCLUDE}</div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </Card>
      {run && (
        <Card className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="amber">⚠ {gaps} {tr("פערים")}</Badge><Badge tone="green">✓ {covered} {tr("כבר ברשימה")}</Badge><Badge>{run.rows.length} {tr("תעשיות")}</Badge>
            <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={onlyGaps} onChange={(e) => setOnlyGaps(e.target.checked)} />{tr("רק פערים")}</label>
            <span className="ms-auto text-xs text-slate-500">{fmtDate(run.created_at)} · 🔎 {run.searches} {tr("חיפושים")} · {(run.input_tokens + run.output_tokens).toLocaleString()} tokens · <b>${Number(run.cost_usd).toFixed(3)}</b> · {run.model} · {tr("סה״כ בסשן")}: ${state.spend.cost.toFixed(3)}</span>
          </div>
          <RadarTable rows={rows} inList={inList} count={count} added={added} onAdd={add} />
          <ExportBar title={"Silitex Israel — industry gap radar " + fmtDate(run.created_at)} text={radarText(run, inList)} filename="silitex-gap-radar.txt" />
        </Card>
      )}
      {!run && !busy && <Card><p className="text-sm text-slate-500">{tr("עוד לא הורץ מכ״ם — לחץ על הכפתור למעלה.")}</p></Card>}
    </div>
  );
}
