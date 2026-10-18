"use client";
// AskTab.tsx (src/components/field/AskTab.tsx) · updated 18.10.2026 07:45 (Asia/Jerusalem) — industry filter now changes the proposed Silitex line, competitor-code examples and example questions · field mode "walking encyclopedia": industry filter (food excluded for now) + competitor-code quick match + search over all Silitex assets + AI answer with sources (token meter + export bar via AiPanel)
import { useState } from "react";
import { useStore } from "@/lib/store";
import { searchAll } from "@/lib/search";
import { INDUSTRIES } from "@/config/industries";
import AiPanel from "@/components/AiPanel";
import QuickMatch from "@/components/QuickMatch";
import { inputCls } from "@/components/ui";
import { askContext, askPrompt } from "@/prompts/ask";
import type { KbChunk } from "@/lib/types";
import { industryLine } from "@/lib/industry-lines";
import { Badge } from "@/components/ui";
import { useLang } from "@/i18n";
export const FIELD_INDUSTRIES = INDUSTRIES.filter((i) => i.key !== "food");
export default function AskTab({ industry, setIndustry }: { industry: string; setIndustry: (k: string) => void }) {
  const { t: tr } = useLang();
  const { state, addSpend } = useStore();
  const [q, setQ] = useState(""); const [hits, setHits] = useState<KbChunk[]>([]); const [all, setAll] = useState(false);
  const ind = FIELD_INDUSTRIES.find((i) => i.key === industry);
  const line = industry ? industryLine(industry) : null;
  const ask = (x: string) => { setQ(x); setHits(find(x)); };
  const find = (query: string) => {
    const all = searchAll(query + (ind ? " " + ind.match.source.split("|").slice(0, 3).join(" ") : ""), state.kbChunks, 30)
      .filter((h) => h.doc_type !== "food_grade"); // food sector on hold
    const inInd = ind ? all.filter((h) => ind.match.test(h.title + " " + h.text)) : all;
    return (inInd.length >= 3 ? inInd : all).slice(0, 8);
  };
  const chip = (on: boolean) => "shrink-0 px-3 py-2 rounded-full border text-sm " + (on ? "bg-brand-500 text-white border-brand-500" : "bg-white");
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"><button className={chip(!industry)} onClick={() => setIndustry("")}>{tr("כל התעשיות")}</button>{FIELD_INDUSTRIES.map((i) => <button key={i.key} className={chip(industry === i.key)} onClick={() => setIndustry(i.key)}>{tr(i.he)}</button>)}</div>
      {line && (line.rows.length > 0 || line.questions.length > 0) && (
        <div className="bg-white border-2 border-brand-200 rounded-2xl p-3 space-y-2">
          <div className="font-bold">🧪 {tr("קו Silitex מוצע")} · {tr(ind?.he || "")} <span className="text-xs font-normal text-slate-400">({line.rows.length})</span></div>
          {line.questions.length > 0 && <div className="flex flex-wrap gap-1">{line.questions.map((x) => <button key={x} onClick={() => ask(x)} className="text-xs px-2 py-1 rounded-full border bg-brand-50">💬 {tr(x)}</button>)}</div>}
          <ul className="divide-y text-sm" dir="ltr">{line.rows.slice(0, all ? 99 : 6).map((r) => (
            <li key={r.id} className="py-1.5"><a href={"/catalogues/" + r.pdf} target="_blank" rel="noreferrer" className="flex flex-wrap items-center gap-1"><b className="text-brand-700">{r.product}</b>{r.code && <span className="text-xs text-slate-400">{r.code}</span>}{r.active_pct && <Badge>{r.active_pct}%</Badge>}{r.compliance && <Badge tone="green">{r.compliance}</Badge>}<span className="text-xs text-slate-500 w-full line-clamp-1">{r.section}{r.application ? " · " + r.application : ""}</span></a></li>))}</ul>
          {line.rows.length > 6 && <button className="w-full text-sm text-brand-600 py-1" onClick={() => setAll(!all)}>{all ? tr("הצג פחות") : tr("הצג הכל") + " (" + line.rows.length + ")"}</button>}
          {line.rows.length === 0 && <div className="text-xs text-slate-500">{tr("אין שורות קטלוג ייעודיות — השתמש בהתאמה המהירה ובשאלה חופשית.")}</div>}
        </div>
      )}
      <QuickMatch examples={line?.codes} />
      <div className="bg-white border rounded-2xl p-3 space-y-2">
        <div className="flex gap-2"><input className={inputCls + " text-base"} placeholder={tr("שאלה חופשית — למשל: נוגד קצף לקו מילוי, ריכוך ללא D5")} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") setHits(find(q)); }} /><button className="px-4 rounded-lg bg-ink-900 text-white" onClick={() => setHits(find(q))}>🔎</button></div>
        {hits.length > 0 && <ul className="space-y-1 text-sm" dir="auto">{hits.slice(0, 5).map((h, i) => <li key={h.id} className="border rounded-lg p-2"><b>[{i + 1}] {h.title}</b><div className="text-xs text-slate-500 line-clamp-2">{h.text}</div></li>)}</ul>}
        <AiPanel title={q || tr("שאל את Silitex")} buttonLabel={tr("ענה עם AI")} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)}
          buildPrompt={() => { const h = hits.length ? hits : find(q); return { context: askContext(h), prompt: askPrompt(q) + (ind ? "\nCustomer industry: " + ind.he + ". Keep the answer short — it is read on a phone in front of the customer." : "\nKeep the answer short — it is read on a phone in front of the customer.") }; }} />
      </div>
    </div>
  );
}
