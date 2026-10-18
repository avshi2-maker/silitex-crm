"use client";
// VisMatrix.tsx (src/components/visibility/VisMatrix.tsx) · updated 18.10.2026 19:05 (Asia/Jerusalem) — AI VISIBILITY BOT result grid: question × engine → ✅ Sapirim cited / 🟡 mentioned / ⬜ not found, Silitex badge, brands; tap a cell for the AI's answer and its sources.
import { useState } from "react";
import { Card } from "@/components/ui";
import { VIS_QUESTIONS } from "@/config/visibility";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/i18n";
export type VisRow = { id: string; at: string; engine: string; qid: string; question: string; lang: string; sapirim_cited: boolean; sapirim_mentioned: boolean; silitex_mentioned: boolean; brands: string[]; sources: { url: string; title: string }[]; answer: string; cost_usd: number; error: string | null };
const ENGINES = ["claude", "chatgpt"];
export default function VisMatrix({ latest }: { latest: Map<string, VisRow> }) {
  const { t: tr } = useLang(); const [open, setOpen] = useState<VisRow | null>(null);
  const cell = (r?: VisRow) => !r ? <span className="text-slate-300">—</span> : r.error ? <span className="text-red-500 text-xs">⚠️ {tr("שגיאה")}</span> : <span>{r.sapirim_cited ? "✅" : r.sapirim_mentioned ? "🟡" : "⬜"}{r.silitex_mentioned && <span className="ms-1 text-[10px] px-1 rounded bg-brand-50 text-brand-700">Silitex</span>}{r.brands?.filter((b) => b !== "Silitex").length > 0 && <span className="ms-1 text-[10px] text-slate-500">{r.brands.filter((b) => b !== "Silitex").join(", ")}</span>}</span>;
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-xs text-slate-500"><th className="text-start p-2">{tr("שאלה")}</th>{ENGINES.map((e) => <th key={e} className="text-start p-2 w-56">{e === "claude" ? "Claude" : "ChatGPT"}</th>)}</tr></thead>
        <tbody>{VIS_QUESTIONS.map((q) => <tr key={q.id} className="border-t align-top"><td className="p-2" dir="auto"><span className="text-[10px] uppercase text-slate-400 me-1">{q.lang}</span>{q.q}</td>{ENGINES.map((e) => { const r = latest.get(e + "|" + q.id); return <td key={e} className="p-2"><button className="text-start w-full hover:bg-slate-50 rounded p-1" disabled={!r} onClick={() => setOpen(r || null)}>{cell(r)}</button></td>; })}</tr>)}</tbody>
      </table>
      {open && (
        <div className="mt-3 border-t pt-3 space-y-2">
          <div className="flex justify-between gap-2"><b dir="auto">{open.engine === "claude" ? "Claude" : "ChatGPT"} · {open.question}</b><button className="text-sm" onClick={() => setOpen(null)}>✕</button></div>
          <div className="text-xs text-slate-500">{fmtDateTime(open.at)} · ${open.cost_usd}</div>
          {open.error ? <div className="text-sm text-red-600">{open.error}</div> : <div className="whitespace-pre-wrap text-sm bg-slate-50 rounded-lg p-3 max-h-80 overflow-auto" dir="auto">{open.answer}</div>}
          {open.sources?.length > 0 && <ul className="text-xs space-y-0.5" dir="ltr">{open.sources.map((s) => <li key={s.url} className={/sapirim\.com/i.test(s.url) ? "font-bold text-emerald-700" : ""}>🔗 <a href={s.url} target="_blank" rel="noreferrer" className="underline">{s.title || s.url}</a></li>)}</ul>}
        </div>
      )}
    </Card>
  );
}
