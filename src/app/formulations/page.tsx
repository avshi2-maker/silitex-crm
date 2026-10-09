"use client";
// page.tsx (src/app/formulations/page.tsx) · updated 09.10.2026 18:40 (Asia/Jerusalem) — starter formulations (personal care) with Silitex substitutions + case studies + NotebookLM prompt
import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { FORMULATIONS, FORM_META, formulationText } from "@/lib/formulations";
import { formulationContext, FORMULATION_PROMPT } from "@/prompts/formulation";
import FormulaCard from "@/components/formulations/FormulaCard";
import PatternGuide from "@/components/formulations/PatternGuide";
import { draftContext, draftPrompt } from "@/prompts/draft";
import { inputCls } from "@/components/ui";
import { Card, H1, Badge, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import ExportBar from "@/components/ExportBar";
import { useLang } from "@/i18n";
export default function FormulationsPage() {
  const { t: tr } = useLang(); const { state, ready, addSpend } = useStore();
  const [sel, setSel] = useState(FORMULATIONS[0]); const [copied, setCopied] = useState(false); const [brief, setBrief] = useState("Light dry-touch body lotion, O/W, D4/D5-free, Silitex only");
  useEffect(() => { try { const b = new URLSearchParams(window.location.search).get("brief"); if (b) { setBrief(b); document.getElementById("draft")?.scrollIntoView({ behavior: "smooth" }); } } catch {} }, []);
  if (!ready) return null;
  return (
    <div className="space-y-4">
      <H1 sub={tr("נוסחאות התחלה לקוסמטיקה עם מקבילות Silitex לכל רכיב סיליקון · ") + FORM_META.updated}>{tr("נוסחאות ומקרי בוחן")}</H1>
      <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2" dir="ltr">{FORM_META.disclaimer}</div>
      <div className="grid lg:grid-cols-[260px_1fr] gap-4 items-start">
        <Card className="space-y-1">
          <div className="font-bold text-sm mb-1">{tr("נוסחאות")} ({FORMULATIONS.length})</div>
          {FORMULATIONS.map((f) => (<button key={f.id} onClick={() => setSel(f)} className={"w-full text-start rounded-lg p-2 text-sm border " + (sel.id === f.id ? "border-brand-500 bg-brand-50" : "bg-white hover:bg-slate-50")}><div className="font-medium">{f.name}</div><div className="text-xs text-slate-500">{f.code} · {f.type}</div></button>))}
          <div className="pt-3 font-bold text-sm">{tr("מקרי בוחן")} ({FORM_META.cases.length})</div>
          <div className="text-xs text-slate-400">{tr("יתווספו ממסמכי Silitex לאחר החוזה (תוצאות מעבדה אצל לקוחות ישראלים).")}</div>
        </Card>
        <Card>
          <h2 className="text-xl font-bold mb-2">{sel.name} <span className="text-sm text-slate-400 font-normal">{sel.code}</span></h2>
          <FormulaCard f={sel} />
          <ExportBar title={"Silitex starter formulation — " + sel.name} text={formulationText(sel)} />
        </Card>
      </div>
      <Card><AiPanel title={tr("גרסת Silitex + גרסה ללא D4/D5 — ") + sel.name} buttonLabel={tr("התאם ל-Silitex עם Claude")} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} buildPrompt={() => ({ context: formulationContext(sel), prompt: FORMULATION_PROMPT })} /></Card>
      <Card><h3 className="font-bold mb-2">{tr("מדריך תבניות — תפקיד הסיליקון לפי סוג מוצר")}</h3><PatternGuide /></Card>
      <Card><div id="draft" />
        <h3 className="font-bold mb-1">{tr("טיוטת נוסחה חדשה (צעצוע AI)")}</h3>
        <div className="text-xs text-slate-500 mb-2">{tr("תיבה זו ממציאה מתכון מלא (אחוזים, שלבים, בדיקות) עם מוצרי Silitex — טיוטה לאימות במעבדה בלבד. לעובדות עם מקורות:")} <Link href="/ask" className="underline text-brand-600">{tr("שאל את Silitex")}</Link></div>
        <input className={inputCls + " mb-2"} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="e.g. hair serum, anhydrous, shine + detangling, D5-free" dir="ltr" />
        <AiPanel title={"AI draft — " + brief} buttonLabel={tr("צור טיוטה עם Claude")} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} buildPrompt={() => ({ context: draftContext(), prompt: draftPrompt(brief) })} />
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-2"><h3 className="font-bold">NotebookLM — {tr("פרומפט להפקת נוסחאות נוספות")}</h3><button className={btnGhost} onClick={() => { navigator.clipboard?.writeText(FORM_META.notebooklm_prompt); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "✓" : "📋"} {tr("העתק")}</button></div>
        <p className="text-xs text-slate-500 mb-2" dir="ltr">Upload supplier formulation guides (NuSil CareSil, Dow, Wacker, Evonik…) to a NotebookLM notebook → paste this prompt → send me the JSON → I import it here with Silitex substitutions.</p>
        <pre className="text-xs whitespace-pre-wrap bg-slate-50 border rounded-lg p-3" dir="ltr">{FORM_META.notebooklm_prompt}</pre>
        <div className="mt-2"><Badge tone="slate">NuSil → Silitex cross-reference: see /offsets (new NuSil column, v6)</Badge></div>
      </Card>
    </div>
  );
}
