"use client";
// PitchQA.tsx (src/components/pitch/PitchQA.tsx) · updated 16.10.2026 08:55 (Asia/Jerusalem) — /pitch mini Q&A: 5 likely Silitex questions with corrected answers (config/pitchqa.ts). Click a question to open it.
import { PITCH_QA } from "@/config/pitchqa";
export const qaText = () => "Q&A\n" + PITCH_QA.map((x, i) => (i + 1) + ". " + x.q + "\n" + x.a.map((l) => "   " + l).join("\n")).join("\n\n");
export default function PitchQA() {
  return (
    <section className="bg-white border rounded-2xl p-6 shadow-sm" dir="ltr">
      <h2 className="text-2xl font-bold text-ink-900 mb-3">Questions you may have</h2>
      <div className="space-y-2">
        {PITCH_QA.map((x, i) => (
          <details key={x.q} className="border rounded-xl p-3 group">
            <summary className="cursor-pointer font-medium text-ink-900 list-none flex gap-2"><span className="text-brand-500 font-bold">{i + 1}.</span><span className="flex-1">{x.q}</span><span className="text-slate-400 group-open:rotate-90 transition-transform">›</span></summary>
            <ul className="mt-2 ms-6 space-y-1 text-sm text-slate-700 list-disc">{x.a.map((l) => <li key={l}>{l}</li>)}</ul>
          </details>
        ))}
      </div>
    </section>
  );
}
