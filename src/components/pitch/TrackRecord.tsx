"use client";
// TrackRecord.tsx (src/components/pitch/TrackRecord.tsx) · updated 16.10.2026 08:45 (Asia/Jerusalem) — + NuSil CareSil → Silitex switch table — + full-disclosure new ground — /pitch credibility block: Sapirim's Dow Corning sales history in Israel by packaging scale; lines also covered by the Silitex range are flagged. Data in config/pitch.ts (TRACK).
import { TRACK, NUSIL_SWITCH } from "@/config/pitch";
export const trackText = () => TRACK.title + "\n" + TRACK.sub + "\n" + TRACK.groups.map((g) => g.pack + ": " + g.items.map(([n, q, s]) => n + (q ? " (" + q + ")" : "") + (s ? " ✓Silitex" : "")).join("; ")).join("\n") + "\n" + TRACK.newGround.title + ": " + TRACK.newGround.text + "\n\n" + NUSIL_SWITCH.title + "\n" + NUSIL_SWITCH.rows.map((r) => "  • " + r.nusil + " (" + r.what + ") → " + r.silitex + " — " + r.fit).join("\n");
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
      <div className="mt-4 border rounded-xl p-3">
        <div className="font-bold text-ink-900">{NUSIL_SWITCH.title}</div>
        <div className="text-sm text-slate-600 mb-2">{NUSIL_SWITCH.sub}</div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-xs text-slate-400 text-left"><tr><th className="py-1 pe-3">NuSil today</th><th className="py-1 pe-3">Chemistry</th><th className="py-1 pe-3">Silitex replacement</th><th className="py-1">Fit</th></tr></thead>
        <tbody>{NUSIL_SWITCH.rows.map((r) => <tr key={r.nusil} className="border-t align-top"><td className="py-1.5 pe-3 font-medium whitespace-nowrap">{r.nusil}</td><td className="py-1.5 pe-3 text-slate-600">{r.what}</td><td className="py-1.5 pe-3 text-brand-700">{r.silitex}</td><td className="py-1.5 text-slate-600">{r.fit}</td></tr>)}</tbody></table></div>
      </div>
      <p className="text-xs text-slate-400 mt-3">Quantities: lifetime Sapirim sales of Dow Corning products in Israel (container loads / drums / pails). Pink = product line Silitex also covers — the accounts we re-open first.</p>
    </section>
  );
}
