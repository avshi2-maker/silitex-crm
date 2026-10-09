"use client";
// page.tsx (src/app/ask/page.tsx) · updated 09.10.2026 12:30 (Asia/Jerusalem) — "Ask Silitex": search all assets (index + KB) → Claude answer with citations, token meter, export bar
import { useState } from "react";
import { useStore } from "@/lib/store";
import { searchAll, INDEX, TYPE_HE } from "@/lib/search";
import { Card, H1, Badge, inputCls, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import { useLang } from "@/i18n";
import { askContext, askPrompt } from "@/prompts/ask";
import { fmtDate } from "@/lib/format";
import type { KbChunk } from "@/lib/types";
const EXAMPLES = ["What is the added value of using Silitex antifoam in the food industry?", "Which Silitex products are Kosher certified and what do they replace?", "Best product for high-pH CIP cleaning in a detergent plant?", "What should I offer Infinya (Hadera Paper) and why?", "D4/D5-free softener for GOTS textiles — which SKU?"];
export default function AskPage() {
  const { t: tr } = useLang();
  const { state, ready, addSpend } = useStore();
  const [q, setQ] = useState(""); const [hits, setHits] = useState<KbChunk[]>([]);
  if (!ready) return null;
  const run = (query: string) => { setQ(query); setHits(searchAll(query, state.kbChunks)); };
  return (
    <div className="space-y-4">
      <H1 sub={tr("חיפוש סמנטי על כל הנכסים: ") + INDEX.count + tr(" רשומות (מוצרים, מקבילות, קו מזון, עדיפויות, לקוחות) + ") + state.kbChunks.length + tr(" מקטעי מסמכים · אינדקס ") + fmtDate(INDEX.built)}>{tr("שאל את Silitex")}</H1>
      <Card className="space-y-2">
        <div className="flex gap-2"><input className={inputCls + " text-base"} placeholder={tr("שאלה חופשית באנגלית או בעברית…")} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run(q)} /><button className={btnGhost} onClick={() => run(q)}>🔎</button></div>
        <div className="flex flex-wrap gap-1">{EXAMPLES.map((e) => <button key={e} className="text-xs px-2 py-1 rounded-full border bg-white hover:bg-slate-50" onClick={() => run(e)}>{e}</button>)}</div>
      </Card>
      {hits.length > 0 && (<Card><h3 className="font-bold mb-2">{tr("מקורות")} ({hits.length})</h3><ul className="text-sm space-y-1">{hits.map((h, i) => (<li key={h.id} className="flex gap-2 items-start"><span className="text-slate-400 w-6">[{i + 1}]</span><Badge tone={h.doc_type === "product" ? "blue" : h.doc_type === "lead" ? "green" : h.doc_type === "food_grade" ? "purple" : "slate"}>{tr(TYPE_HE[h.doc_type] || h.doc_type)}</Badge><span className="font-medium">{h.title}</span><span className="text-slate-400 truncate">{h.text.slice(0, 90)}…</span></li>))}</ul></Card>)}
      <Card><AiPanel title={q || tr("שאל את Silitex")} buttonLabel={tr("ענה עם Claude")} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} buildPrompt={() => { const h = hits.length ? hits : searchAll(q, state.kbChunks); if (!hits.length) setHits(h); return { context: askContext(h), prompt: askPrompt(q) }; }} /></Card>
    </div>
  );
}
