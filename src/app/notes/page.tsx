"use client";
// page.tsx (src/app/notes/page.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — teleprompter + Grill-me rehearsal bot: big-type speaker notes for the second screen. Script in config/notes.ts.
import { useEffect, useState } from "react";
import Link from "next/link";
import { NOTES } from "@/config/notes";
import ExportBar from "@/components/ExportBar";
import GrillPanel from "@/components/GrillPanel";
export default function NotesPage() {
  const [i, setI] = useState(0); const [big, setBig] = useState(true); const [grill, setGrill] = useState(false);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "ArrowRight" || e.key === " ") setI((x) => Math.min(NOTES.length - 1, x + 1)); if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1)); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);
  const c = NOTES[i];
  const text = NOTES.map((n) => "## " + n.t + " (" + n.min + ")" + (n.show ? "\nSHOW: " + n.show : "") + "\n" + n.say.map((s) => "• " + s).join("\n")).join("\n\n");
  return (
    <div className="min-h-screen bg-ink-900 text-white -m-6 p-6" dir="ltr">
      <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
        <div><Link href="/" className="hover:text-white">← CRM</Link> · Teleprompter · ← → or space to move · open on a second screen, not on the shared one</div>
        <div className="flex gap-2">{NOTES.map((n, k) => <button key={k} onClick={() => setI(k)} className={"w-7 h-7 rounded-full text-xs " + (k === i ? "bg-brand-500 text-white" : "bg-ink-700 text-slate-300")}>{k + 1}</button>)}<button onClick={() => setBig((v) => !v)} className="px-2 rounded bg-ink-700">A{big ? "−" : "+"}</button><button onClick={() => setGrill((v) => !v)} className={"px-3 rounded " + (grill ? "bg-brand-500 text-white" : "bg-ink-700")}>🔥 Grill me</button></div>
      </div>
      <div className="text-brand-500 font-bold uppercase tracking-wide text-sm">{c.t} <span className="text-slate-500 normal-case">· min {c.min}</span></div>
      {c.show && <div className="text-amber-300 text-sm mt-1">SHOW: {c.show}</div>}
      <div className={"mt-6 space-y-6 max-w-5xl " + (big ? "text-3xl leading-relaxed" : "text-xl leading-relaxed")}>{c.say.map((s, k) => <p key={k}>{s}</p>)}</div>
      <div className="mt-10 flex gap-3"><button onClick={() => setI(Math.max(0, i - 1))} className="px-4 py-2 rounded-lg bg-ink-700">← Back</button><button onClick={() => setI(Math.min(NOTES.length - 1, i + 1))} className="px-4 py-2 rounded-lg bg-brand-500">Next →</button></div>
      {grill && <GrillPanel onClose={() => setGrill(false)} />}
      <div className="mt-10 opacity-70"><ExportBar title="Silitex meeting — speaker notes" text={text} /></div>
    </div>
  );
}
