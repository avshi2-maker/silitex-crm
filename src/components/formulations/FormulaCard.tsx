"use client";
// FormulaCard.tsx (src/components/formulations/FormulaCard.tsx) · updated 09.10.2026 18:00 (Asia/Jerusalem) — one formulation: phases table with Silitex substitution column, procedure, properties
import { Badge } from "@/components/ui";
import { useLang } from "@/i18n";
import { isSilicone, subFor, type Formulation } from "@/lib/formulations";
export default function FormulaCard({ f }: { f: Formulation }) {
  const { t: tr } = useLang();
  return (
    <div className="space-y-4" dir="ltr">
      <div className="flex flex-wrap gap-2 items-center"><Badge tone="blue">{f.type}</Badge><Badge>{f.category}</Badge><span className="text-xs text-slate-500">{f.source}</span><a className="text-xs underline text-brand-600" href={f.pdf} target="_blank">PDF</a></div>
      <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 text-sm"><b>Hero silicone:</b> {f.hero_ingredient}</div>
      <div className="grid md:grid-cols-4 gap-2 text-xs">{Object.entries(f.properties).map(([k, v]) => <div key={k} className="border rounded-lg p-2"><div className="text-slate-500 capitalize">{k}</div><div className="font-medium">{v}</div></div>)}</div>
      <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50"><tr><th className="p-2 text-left">Phase</th><th className="p-2 text-left">INCI</th><th className="p-2 text-right">wt %</th><th className="p-2 text-left">Trade name / supplier</th><th className="p-2 text-left">{tr("מקבילת Silitex")}</th></tr></thead>
        <tbody>{f.phases.flatMap((p) => p.rows.map((r, i) => { const sil = isSilicone(r[0]); const s = sil ? subFor(r[0]) : undefined; return (<tr key={p.phase + i} className={"border-t " + (sil ? "bg-amber-50" : "")}><td className="p-2 font-bold">{i === 0 ? p.phase : ""}</td><td className="p-2">{r[0]}</td><td className="p-2 text-right tabular-nums">{r[1]}</td><td className="p-2 text-slate-500">{r[2]}</td><td className="p-2">{sil ? (<div><div className="font-medium text-brand-700">{s?.silitex || "ask Silitex"}</div>{s?.note && <div className="text-slate-500">{s.note}</div>}{s && <Badge tone={s.d5free ? "green" : "amber"}>{s.d5free ? "D5-free option" : "cyclic carrier"}</Badge>}</div>) : ""}</td></tr>); }))}</tbody></table></div>
      <div><div className="font-bold text-sm mb-1">Procedure</div><ol className="list-decimal list-inside text-sm space-y-0.5">{f.procedure.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
      <div className="flex flex-wrap gap-1">{f.claims.map((c) => <Badge key={c}>{c}</Badge>)}</div>
    </div>
  );
}
