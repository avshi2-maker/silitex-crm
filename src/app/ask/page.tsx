"use client";
// page.tsx (src/app/ask/page.tsx) · updated 13.10.2026 08:15 — + NoDataCard (no guessing: 0 sources or NO_DATA → human support by email + WhatsApp) — examples per language (EN/IT/HE) (Asia/Jerusalem) — "Ask Silitex": search all assets (index + KB) → Claude answer with citations, token meter, export bar
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { searchAll, INDEX, TYPE_HE } from "@/lib/search";
import { Card, H1, Badge, inputCls, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import NoDataCard from "@/components/NoDataCard";
import { useLang } from "@/i18n";
import { askContext, askPrompt } from "@/prompts/ask";
import { fmtDate } from "@/lib/format";
import type { KbChunk } from "@/lib/types";
const RECIPE = /formulat|formula|recipe|starter|develop|shampoo|cream|lotion|serum|gel|balm|primer|foundation|sunscreen|נוסח|מתכון|פורמול|שמפו|קרם/i;
const EXAMPLES_EN = ["What is the added value of using Silitex antifoam in the food industry?", "Which Silitex products are Kosher certified and what do they replace?", "Best product for high-pH CIP cleaning in a detergent plant?", "What should I offer Infinya (Hadera Paper) and why?", "D4/D5-free softener for GOTS textiles — which SKU?"];
const EXAMPLES_IT = ["Qual è il valore aggiunto degli antischiuma Silitex nell'industria alimentare?", "Quali prodotti Silitex sono certificati Kosher e cosa sostituiscono?", "Prodotto migliore per il lavaggio CIP ad alto pH in un impianto di detergenza?", "Quale prodotto Silitex sostituisce Dow Corning 5225C?", "Alternativa D5-free per un siero per capelli", "Antischiuma compatibile con membrane MBR per un depuratore biologico"];
const EXAMPLES_HE = ["מה הערך המוסף של נוגד קצף Silitex בתעשיית המזון?", "אילו מוצרי Silitex כשרים ומה הם מחליפים?", "המוצר הטוב ביותר ל-CIP בסיסי במפעל דטרגנטים?", "מה להציע ל-Infinya (נייר חדרה) ולמה?", "מרכך ללא D4/D5 לטקסטיל GOTS — איזה SKU?"];
export default function AskPage() {
  const { t: tr, lang } = useLang();
  const { state, ready, addSpend } = useStore();
  const [q, setQ] = useState(""); const [hits, setHits] = useState<KbChunk[]>([]); const [noData, setNoData] = useState(""); const [asked, setAsked] = useState("");
  const run = (query: string) => { setQ(query); setAsked(query); setNoData(""); setHits(searchAll(query, state.kbChunks)); };
  useEffect(() => { if (!ready) return; try { const p = new URLSearchParams(window.location.search).get("q"); if (p) run(p); } catch {} }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return null;
  return (
    <div className="space-y-4">
      <H1 sub={tr("חיפוש סמנטי על כל הנכסים: ") + INDEX.count + tr(" רשומות (מוצרים, מקבילות, קו מזון, עדיפויות, לקוחות) + ") + state.kbChunks.length + tr(" מקטעי מסמכים · אינדקס ") + fmtDate(INDEX.built)}>{tr("שאל את Silitex")}</H1>
      <Card className="space-y-2">
        <div className="flex gap-2"><input className={inputCls + " text-base"} placeholder={tr("שאלה חופשית באנגלית או בעברית…")} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run(q)} /><button className={btnGhost} onClick={() => run(q)}>🔎</button></div>
        <div className="flex flex-wrap gap-1">{(lang === "it" ? EXAMPLES_IT : lang === "he" ? EXAMPLES_HE : EXAMPLES_EN).map((e) => <button key={e} className="text-xs px-2 py-1 rounded-full border bg-white hover:bg-slate-50" onClick={() => run(e)}>{e}</button>)}</div>
      </Card>
      <div className="text-xs text-slate-500 -mt-2">{tr("תיבה זו עונה מעובדות עם מקורות [n] בלבד — היא לא ממציאה מתכונים או אחוזים.")}</div>
      {RECIPE.test(q) && (<div className="border border-amber-300 bg-amber-50 rounded-xl p-3 text-sm flex flex-wrap items-center justify-between gap-2"><span>🧴 {tr("מחפש נוסחת התחלה? כאן תקבל רק עובדות ממסמכים. לטיוטת מתכון מלאה עם מוצרי Silitex השתמש בכלי הטיוטה.")}</span><Link href={"/formulations?brief=" + encodeURIComponent(q) + "&lang=" + lang} className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-sm whitespace-nowrap">{tr("פתח כלי טיוטה →")}</Link></div>)}
      {hits.length > 0 && (<Card><div className="flex flex-wrap items-center gap-2 mb-2"><h3 className="font-bold">{tr("מקורות")} ({hits.length})</h3>{Object.entries(hits.reduce<Record<string, number>>((m, h) => ({ ...m, [h.doc_type]: (m[h.doc_type] || 0) + 1 }), {})).map(([k, n]) => <Badge key={k} tone={k === "product" ? "blue" : k === "lead" ? "green" : k === "food_grade" ? "purple" : k === "kb" ? "amber" : "slate"}>{tr(TYPE_HE[k] || k)} {n}</Badge>)}</div><ul className="text-sm space-y-1">{hits.map((h, i) => (<li key={h.id} className="flex gap-2 items-start"><span className="text-slate-400 w-6">[{i + 1}]</span><Badge tone={h.doc_type === "product" ? "blue" : h.doc_type === "lead" ? "green" : h.doc_type === "food_grade" ? "purple" : "slate"}>{tr(TYPE_HE[h.doc_type] || h.doc_type)}</Badge><span className="font-medium">{h.title}</span><span className="text-slate-400 truncate">{h.text.slice(0, 90)}…</span></li>))}</ul></Card>)}
      {asked.trim().length >= 3 && hits.length === 0 && <NoDataCard question={asked || q} />}
      {noData && hits.length > 0 && <NoDataCard question={asked || q} reason={noData} />}
      <Card><AiPanel title={q || tr("שאל את Silitex")} buttonLabel={tr("ענה עם AI")} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} buildPrompt={() => { const h = hits.length ? hits : searchAll(q, state.kbChunks); if (!hits.length) setHits(h); return { context: askContext(h), prompt: askPrompt(q) }; }} onResult={(txt) => setNoData(/^\s*NO_DATA/i.test(txt) ? txt.replace(/^\s*NO_DATA\s*/i, "") : "")} /></Card>
    </div>
  );
}
