"use client";
// TrackRecord.tsx (src/components/pitch/TrackRecord.tsx) · updated 16.10.2026 06:05 (Asia/Jerusalem) — + full-disclosure new ground — /pitch credibility block: Sapirim's Dow Corning sales history in Israel by packaging scale; lines also covered by the Silitex range are flagged. Data in config/pitch.ts (TRACK).
import { TRACK } from "@/config/pitch";
export const trackText = () => TRACK.title + "\n" + TRACK.sub + "\n" + TRACK.groups.map((g) => g.pack + ": " + g.items.map(([n, q, s]) => n + (q ? " (" + q + ")" : "") + (s ? " ✓Silitex" : "")).join("; ")).join("\n") + "\n" + TRACK.newGround.title + ": " + TRACK.newGround.text;
export default function TrackRecord() {
  const overlap = TRACK.groups.flatMap((g) => g.items).filter((x) => x[2]).length;
  return (
    <section className="bg-white border rounded-2xl p-6 shadow-sm" dir="ltr">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-2xl font-bold text-ink-900">{TRACK.title}</h2><span className="text-sm text-slate-500"><span className="inline-block w-3 h-3 rounded-full bg-brand-500 align-middle me-1" />{overlap} lines also in the Silitex range</span></div>
      <p className="text-slate-600 mt-1 mb-4">{TRACK.sub}</p>
      <div className="grid md:grid-cols-2 gap-4">
        {TRACK.groups.map((g) => (
          <div key={g.pack} className="border rounded-xl p-3">
            <div className="text-xs uppercase tracking-wide text-slate-400 font-bold mb-2">{g.pack}</div>
            <ul className="space-y-1 text-sm">{g.items.map(([n, q, s]) => (
              <li key={n} className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><span className={"w-2.5 h-2.5 rounded-full shrink-0 " + (s ? "bg-brand-500" : "bg-slate-200")} />{n}</span>{q && <span className="text-slate-500 tabular-nums whitespace-nowrap">{q}</span>}</li>
            ))}</ul>
          </div>
        ))}
      </div>
      <div className="mt-4 border border-amber-200 bg-amber-50/60 rounded-xl p-3 text-sm"><b>{TRACK.newGround.title}:</b> {TRACK.newGround.text}</div>
      <p className="text-xs text-slate-400 mt-3">Quantities: lifetime Sapirim sales of Dow Corning products in Israel (container loads / drums / pails). Pink = product line Silitex also covers — the accounts we re-open first.</p>
    </section>
  );
}
