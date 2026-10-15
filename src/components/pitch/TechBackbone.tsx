"use client";
// TechBackbone.tsx (src/components/pitch/TechBackbone.tsx) · updated 15.10.2026 17:30 (Asia/Jerusalem) — /pitch "Technical backbone": 5 non-price drivers for R&D switching, each product linked to its Silitex 2026 catalogue row + PDF (config/backbone.ts). Items Silitex must still confirm are listed separately, never claimed.
import { BACKBONE, BACKBONE_RULE, BACKBONE_CONFIRM } from "@/config/backbone";
import { CAT26 } from "@/lib/catalog";
export const backboneText = () => "TECHNICAL BACKBONE — why R&D switches (not price)\n" + BACKBONE_RULE + "\n\n" + BACKBONE.map((d, i) => (i + 1) + ". " + d.title + "\nProblem: " + d.problem + "\nSilitex answer: " + d.answer + "\nSegments: " + d.segments + (d.items.length ? "\n" + d.items.map((x) => "  • " + (x.code ? x.code + " " : "") + x.name + " — " + x.fact).join("\n") : "") + "\nProof needed: " + d.proof).join("\n\n") + "\n\nTo confirm with Silitex:\n" + BACKBONE_CONFIRM.map((c) => "  • " + c).join("\n");
export default function TechBackbone() {
  return (
    <section className="bg-white border rounded-2xl p-6 shadow-sm" dir="ltr">
      <h2 className="text-2xl font-bold text-ink-900">Technical backbone — why R&amp;D switches (not price)</h2>
      <p className="text-slate-600 mt-1 mb-4">{BACKBONE_RULE}</p>
      <div className="grid lg:grid-cols-2 gap-4">
        {BACKBONE.map((d, i) => (
          <div key={d.title} className={"border rounded-xl p-4 flex flex-col" + (i === BACKBONE.length - 1 && BACKBONE.length % 2 ? " lg:col-span-2" : "")}>
            <div className="font-bold text-ink-900">{d.icon} {i + 1}. {d.title}</div>
            <div className="text-sm text-slate-600 mt-1"><b className="text-slate-700">Problem:</b> {d.problem}</div>
            <div className="text-sm text-slate-600"><b className="text-brand-600">Silitex answer:</b> {d.answer}</div>
            <div className="text-xs text-slate-400 mt-1">{d.segments}</div>
            {d.items.length > 0 && <ul className="mt-2 space-y-1 text-sm flex-1">{d.items.map((x) => { const r = x.code ? CAT26.find((c) => c.code === x.code) : undefined; return (
              <li key={x.name} className="flex gap-2"><span className="text-brand-500">▸</span><span><b>{x.name}</b>{x.code && <span className="text-xs text-slate-400"> {x.code}</span>} — {x.fact}{r?.pdf && <> · <a className="text-brand-600 underline text-xs" href={"/catalogues/" + r.pdf} target="_blank" rel="noreferrer">{r.sector} catalogue 📄</a></>}</span></li>); })}</ul>}
            <div className="text-xs text-amber-700 mt-2">📎 Proof to put on file: {d.proof}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-slate-50 border rounded-xl p-3 text-sm"><b>To confirm with Silitex before we claim it:</b><ul className="list-disc list-inside text-slate-600 mt-1">{BACKBONE_CONFIRM.map((c) => <li key={c}>{c}</li>)}</ul></div>
    </section>
  );
}
