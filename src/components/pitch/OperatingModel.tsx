"use client";
// OperatingModel.tsx (src/components/pitch/OperatingModel.tsx) · updated 16.10.2026 06:05 (Asia/Jerusalem) — /pitch "Sapirim 2.0": then (Dow Corning-era office + SAP) vs now (lean team + own AI system), what the system does 24/7 (each card = a live CRM screen), 2-year build-up with hiring triggers. Copy in config/operating.ts.
import { OPS } from "@/config/operating";
export const opsText = () => OPS.title + "\n" + OPS.sub + "\n\n" + OPS.then.label + ": " + OPS.then.people.join("; ") + ". " + OPS.then.tools + "\n" + OPS.now.label + ": " + OPS.now.people.join("; ") + ". " + OPS.now.tools + "\n\nWhat the system does:\n" + OPS.system.map(([, t, d]) => "  • " + t + " — " + d).join("\n") + "\n\nBuild-up:\n" + OPS.buildup.map((b) => "  • " + b.when + " — " + b.head + ": " + b.text).join("\n") + "\n" + OPS.note;
export default function OperatingModel() {
  const col = "rounded-xl p-4 border";
  return (
    <section className="bg-white border-2 border-brand-200 rounded-2xl p-6 shadow-sm" dir="ltr">
      <h2 className="text-2xl font-bold text-ink-900">{OPS.title}</h2>
      <p className="text-slate-600 mt-1 mb-4">{OPS.sub}</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className={col + " bg-slate-50"}>
          <div className="text-xs uppercase tracking-wide text-slate-400 font-bold mb-2">{OPS.then.label}</div>
          <ul className="text-sm text-slate-500 space-y-1">{OPS.then.people.map((p) => <li key={p}>👤 {p}</li>)}</ul>
          <div className="text-sm text-slate-500 mt-2">🗄️ {OPS.then.tools}</div>
        </div>
        <div className={col + " bg-brand-50/50 border-brand-200"}>
          <div className="text-xs uppercase tracking-wide text-brand-600 font-bold mb-2">{OPS.now.label}</div>
          <ul className="text-sm text-ink-900 space-y-1">{OPS.now.people.map((p) => <li key={p}>👤 {p}</li>)}</ul>
          <div className="text-sm text-ink-900 font-medium mt-2">⚙️ {OPS.now.tools}</div>
        </div>
      </div>
      <h3 className="font-bold text-ink-900 mt-6 mb-2">What the system does, every day</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {OPS.system.map(([i, t, d]) => (<div key={t} className="border rounded-xl p-3"><div className="font-bold text-sm">{i} {t}</div><div className="text-xs text-slate-600 mt-1">{d}</div></div>))}
      </div>
      <h3 className="font-bold text-ink-900 mt-6 mb-2">First two years</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {OPS.buildup.map((b) => (<div key={b.when} className="border rounded-xl p-3"><div className="text-xs text-brand-600 font-bold uppercase">{b.when}</div><div className="font-bold text-sm">{b.head}</div><div className="text-sm text-slate-600 mt-1">{b.text}</div></div>))}
      </div>
      <p className="text-sm text-ink-900 font-medium mt-4">{OPS.note}</p>
    </section>
  );
}
