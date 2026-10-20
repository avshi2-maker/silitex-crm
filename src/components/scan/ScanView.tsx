"use client";
// ScanView.tsx (src/components/scan/ScanView.tsx) · updated 20.10.2026 06:00 (Asia/Jerusalem) — shows one website scan: summary, product lines, silicone uses, Silitex matches (grade · countertype · for · why · confidence), R&D questions, value angle, pages read.
import type { ScanResult } from "@/lib/scan";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/i18n";
const CONF: Record<string, string> = { high: "bg-emerald-100 text-emerald-800", medium: "bg-amber-100 text-amber-800", low: "bg-slate-100 text-slate-600" };
export default function ScanView({ r }: { r: ScanResult }) {
  const { t: tr } = useLang(); const d = r.data;
  return (
    <div className="space-y-2 text-sm">
      {d.summary && <p dir="auto">{d.summary}</p>}
      {!!d.product_lines?.length && <div className="flex flex-wrap gap-1">{d.product_lines.map((p, i) => <span key={i} className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs" title={(p.examples || []).join(", ")} dir="auto">{p.name}{p.type ? " · " + p.type : ""}</span>)}</div>}
      {!!d.matches?.length && <table className="w-full text-xs"><thead><tr className="text-slate-500"><th className="text-start p-1">Silitex</th><th className="text-start p-1">{tr("מקבילה")}</th><th className="text-start p-1">{tr("עבור")}</th><th className="text-start p-1">{tr("למה")}</th><th></th></tr></thead>
        <tbody>{d.matches.map((m, i) => <tr key={i} className="border-t align-top"><td className="p-1 font-bold text-[#1d3d5c]" dir="ltr">{m.silitex}{m.code ? " (" + m.code + ")" : ""}</td><td className="p-1" dir="ltr">{m.countertype || "—"}</td><td className="p-1" dir="auto">{m.for}</td><td className="p-1" dir="auto">{m.why}</td><td className="p-1"><span className={"px-1.5 rounded-full " + (CONF[m.confidence || "low"] || CONF.low)}>{m.confidence}</span></td></tr>)}</tbody></table>}
      {!!d.questions?.length && <div><div className="text-xs text-slate-500">{tr("שאלות למו\"פ")}</div><ol className="list-decimal ms-5 text-xs space-y-0.5" dir="auto">{d.questions.map((q, i) => <li key={i}>{q}</li>)}</ol></div>}
      {d.value_angle && <div className="text-xs bg-amber-50 rounded p-2" dir="auto">💡 {d.value_angle}</div>}
      <div className="text-[11px] text-slate-400">{fmtDateTime(r.at)} · <span dir="ltr">{r.pages}</span> {tr("עמודים נקראו")}{r.sector ? " · " + r.sector : ""}{r.sector && r.sector !== "Cosmetics" ? " · " + tr("מיפוי ממתין לבדיקת Silitex") : ""}{d.not_found ? " · " + d.not_found : ""}</div>
    </div>
  );
}
