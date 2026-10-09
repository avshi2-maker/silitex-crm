// Timeline.tsx (src/components/pitch/Timeline.tsx) · updated 09.10.2026 12:30 (Asia/Jerusalem) — 4-phase 12-month plan
import { PITCH } from "@/config/pitch";
export default function Timeline() {
  return (
    <div className="grid md:grid-cols-4 gap-3" dir="ltr">
      {PITCH.phases.map((p, i) => (
        <div key={p.n} className="relative bg-white border rounded-xl p-4 shadow-sm">
          <div className="absolute -top-3 left-4 bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Phase {p.n}</div>
          <div className="text-xs text-slate-500 mt-1">{p.months}</div>
          <div className="font-bold text-ink-900">{p.title}</div>
          <p className="text-sm text-slate-600 mt-1">{p.text}</p>
          {i < 3 && <div className="hidden md:block absolute top-1/2 -right-3 text-slate-300 text-xl">›</div>}
        </div>
      ))}
    </div>
  );
}
