"use client";
// AskTab.tsx (src/components/field/AskTab.tsx) · updated 18.10.2026 06:45 (Asia/Jerusalem) — field mode "walking encyclopedia": industry filter (food excluded for now) + competitor-code quick match + search over all Silitex assets + AI answer with sources (token meter + export bar via AiPanel)
import { useState } from "react";
import { useStore } from "@/lib/store";
import { searchAll } from "@/lib/search";
import { INDUSTRIES } from "@/config/industries";
import AiPanel from "@/components/AiPanel";
import QuickMatch from "@/components/QuickMatch";
import { inputCls } from "@/components/ui";
import { askContext, askPrompt } from "@/prompts/ask";
import type { KbChunk } from "@/lib/types";
import { useLang } from "@/i18n";
export const FIELD_INDUSTRIES = INDUSTRIES.filter((i) => i.key !== "food");
export default function AskTab({ industry, setIndustry }: { industry: string; setIndustry: (k: string) => void }) {
  const { t: tr } = useLang();
  const { state, addSpend } = useStore();
  const [q, setQ] = useState(""); const [hits, setHits] = useState<KbChunk[]>([]);
  const ind = FIELD_INDUSTRIES.find((i) => i.key === industry);
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
      <QuickMatch />
      <div className="bg-white border rounded-2xl p-3 space-y-2">
        <div className="flex gap-2"><input className={inputCls + " text-base"} placeholder={tr("שאלה חופשית — למשל: נוגד קצף לקו מילוי, ריכוך ללא D5")} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") setHits(find(q)); }} /><button className="px-4 rounded-lg bg-ink-900 text-white" onClick={() => setHits(find(q))}>🔎</button></div>
        {hits.length > 0 && <ul className="space-y-1 text-sm" dir="auto">{hits.slice(0, 5).map((h, i) => <li key={h.id} className="border rounded-lg p-2"><b>[{i + 1}] {h.title}</b><div className="text-xs text-slate-500 line-clamp-2">{h.text}</div></li>)}</ul>}
        <AiPanel title={q || tr("שאל את Silitex")} buttonLabel={tr("ענה עם AI")} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)}
          buildPrompt={() => { const h = hits.length ? hits : find(q); return { context: askContext(h), prompt: askPrompt(q) + (ind ? "\nCustomer industry: " + ind.he + ". Keep the answer short — it is read on a phone in front of the customer." : "\nKeep the answer short — it is read on a phone in front of the customer.") }; }} />
      </div>
    </div>
  );
}
