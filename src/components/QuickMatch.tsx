"use client";
// QuickMatch.tsx (src/components/QuickMatch.tsx) · updated 16.10.2026 09:40 (Asia/Jerusalem) — + ✕ Clear button / Esc · — competitor-code quick search: type a Dow / XIAMETER / Wacker / Momentive / Evonik … code → Silitex equivalent + catalogue rows + PDF. Client-side (lib/equiv-search.ts), no AI cost; AI fallback link to /ask. Used on dashboard, /offsets, /partner.
import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, inputCls, certTone } from "@/components/ui";
import { searchEquiv } from "@/lib/equiv-search";
import { useLang } from "@/i18n";
const EXAMPLES = ["OFX-0193", "DC 5225C", "9040", "Silsoft 034", "ABIL EM 90", "SAG 30", "PMX-200"];
export default function QuickMatch({ autoFocus = false }: { autoFocus?: boolean }) {
  const { t: tr } = useLang();
  const [q, setQ] = useState("");
  const hits = useMemo(() => searchEquiv(q, 6), [q]);
  const box = "bg-white border-2 border-brand-200 rounded-2xl p-4 shadow-sm space-y-3";
  return (
    <section className={box}>
      <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-bold text-ink-900">⚡ {tr("התאמה מהירה — קוד מתחרה → Silitex")}</h2><span className="text-[11px] text-slate-400">{tr("Dow · XIAMETER · Wacker · Momentive · Shin-Etsu · Evonik · Elkem ועוד")}</span></div>
      <div className="relative" dir="ltr"><input autoFocus={autoFocus} dir="ltr" className={inputCls + " text-base pe-24"} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setQ(""); }} placeholder={tr("הקלד קוד מתחרה, למשל OFX-0193 או DC 5225C — או שם / קוד Silitex")} />{q && <button onClick={() => setQ("")} title="Clear (Esc)" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm text-slate-600">✕ Clear</button>}</div>
      {!q && <div className="flex flex-wrap gap-1 text-xs"><span className="text-slate-400">{tr("נסה:")}</span>{EXAMPLES.map((x) => <button key={x} onClick={() => setQ(x)} className="px-2 py-0.5 rounded-full border bg-slate-50 hover:bg-brand-50">{x}</button>)}</div>}
      {q.trim().length >= 2 && hits.length === 0 && (
        <div className="text-sm text-slate-600">{tr("אין התאמה בטבלת המקבילות.")} <Link className="text-brand-600 underline" href={"/ask?q=" + encodeURIComponent("Silitex equivalent of " + q)}>{tr("שאל את Silitex AI →")}</Link></div>
      )}
      <ul className="space-y-2" dir="ltr">
        {hits.map((h) => (
          <li key={h.key} className="border rounded-xl p-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {h.kind === "catalogue" ? <Badge tone="purple">{tr("קטלוג Silitex")}</Badge> : <><span className="font-medium">{h.competitor}</span>{h.producer && <span className="text-xs text-slate-400">{h.producer}</span>}<span className="text-slate-400">→</span></>}
              <span className="font-bold text-brand-700">{h.silitexNames.length ? h.silitexNames.slice(0, 4).join(" · ") : h.silitex.slice(0, 90)}</span>
              <Badge tone={h.exact ? "green" : "amber"}>{h.exact ? tr("התאמת קוד") : tr("התאמה חלקית")}</Badge>
              {h.certs.map((c) => <Badge key={c} tone={certTone(c)}>{c}</Badge>)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{h.family}{h.inci && h.inci !== h.family ? " · " + h.inci : ""}</div>
            {h.rows.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{h.rows.map((r) => (
              <a key={r.id} href={"/catalogues/" + r.pdf} target="_blank" rel="noreferrer" title={r.description} className="text-[11px] px-2 py-1 rounded-lg border bg-slate-50 hover:bg-brand-50">
                <b>{r.code || "—"}</b> {r.product}{r.active_pct ? " · " + r.active_pct + "%" : ""} · {r.sector} 📄
              </a>))}</div>}
            {h.also.length > 0 && <div className="text-[11px] text-slate-400 mt-1">{tr("גם:")} {h.also.join(" · ")}</div>}
          </li>
        ))}
      </ul>
      {hits.length > 0 && <div className="text-[11px] text-slate-400">{tr("מקור: טבלת המקבילות + 5 קטלוגי Silitex 2026. התאמה חלקית = לאמת מול TDS לפני הצעה.")} <Link className="underline" href={"/ask?q=" + encodeURIComponent("Silitex equivalent of " + q)}>{tr("שאל את Silitex AI →")}</Link></div>}
    </section>
  );
}
