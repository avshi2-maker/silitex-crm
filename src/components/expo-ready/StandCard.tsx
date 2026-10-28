"use client";
// StandCard.tsx (src/components/expo-ready/StandCard.tsx) · created 28.10.2026 08:30 (Asia/Jerusalem) — v1.3.0 one exhibitor brief: stand, what they make, Silitex fit, 3 opening questions, what to avoid
import { Badge } from "@/components/ui";
import { where, type Stand } from "@/lib/expo-ready";

export default function StandCard({ s, n }: { s: Stand; n: number }) {
  const gradeCls = s.grade === "A" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white";
  const site = s.website ? s.website.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";
  return (
    <div className="border rounded-xl p-3 bg-white break-inside-avoid" dir="ltr">
      <div className="flex items-start justify-between gap-2">
        <div className="font-bold">{n}. {s.company}{s.country ? <span className="font-normal text-slate-500"> · {s.country}</span> : null}</div>
        <span className={"text-xs font-bold px-2 py-0.5 rounded " + gradeCls}>{s.grade}</span>
      </div>
      <div className="text-sm text-brand-700 font-semibold">📍 {where(s)}{s.list_year && s.list_year < 2026 ? " · from the " + s.list_year + " list" : ""}</div>
      {site && <a className="text-xs text-slate-500 underline" href={s.website} target="_blank" rel="noreferrer">{site}</a>}
      <p className="text-sm mt-1"><b>Makes:</b> {s.what_they_make}</p>
      {s.angle && <p className="text-xs text-slate-600"><b>Angle:</b> {s.angle}</p>}
      <p className="text-sm mt-1"><b>Silitex fit:</b> {s.why_silitex}</p>
      <div className="flex flex-wrap gap-1 mt-1">{s.silitex_products.map((p) => <Badge key={p}>{p}</Badge>)}</div>
      <ol className="text-sm mt-2 list-decimal ps-5 space-y-0.5">{s.opening_questions.map((q) => <li key={q}>{q}</li>)}</ol>
      {s.avoid && <p className="text-xs mt-1 text-red-700"><b>Avoid:</b> {s.avoid}</p>}
    </div>
  );
}
