"use client";
// AskBox.tsx (src/components/market/AskBox.tsx) · updated 11.10.2026 11:10 (Asia/Jerusalem) — "Ask Silitex" box that stays on the market page: question + selected account context (plan, R&D focus, product-line matrix) + KB sources → Claude; token meter + export bar via AiPanel
import { useState } from "react";
import { Card, inputCls, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import { searchAll } from "@/lib/search";
import { askContext, askPrompt } from "@/prompts/ask";
import { useLang } from "@/i18n";
import type { Lead, KbChunk, Usage } from "@/lib/types";
import matching from "@/data/account_matching.json";
type Row = { line: string; function: string; silitex: string; inci: string; benefit: string; green: string };
const M = matching as Record<string, { rows: Row[] }>;
type Props = { lead: Lead; kb: KbChunk[]; sessionTokens: number; sessionCost: number; onUsage: (u: Usage) => void };
export default function AskBox({ lead, kb, sessionTokens, sessionCost, onUsage }: Props) {
  const { t: tr } = useLang(); const [q, setQ] = useState("");
  const short = lead.name.split(" (")[0];
  const examples = [tr("מה להציע ל-") + short + tr(" בפגישה הראשונה עם המו\"פ?"), tr("איזה מוצר Silitex מחליף את מה ש-") + short + tr(" משתמשים בו היום?"), tr("מה הסיכון הרגולטורי (REACH / FDA / כשרות) בקו של ") + short + "?", tr("נסח מייל פתיחה באנגלית למנהל המו\"פ של ") + short];
  const accountContext = () => { const rows = M[lead.id]?.rows || []; return "[ACCOUNT] " + lead.name + " · " + lead.industry + " · " + lead.sub_industry + "\nStage: " + (lead.plan_stage || "") + " · Phase: " + (lead.plan_phase || "") + "\nRecommended SKU: " + (lead.recommended_sku || "") + " · Competitor offset: " + (lead.competitor_offset || "") + "\nR&D focus: " + (lead.rd_focus || "") + "\nBuyer trigger: " + (lead.buyer_trigger || "") + "\nNext action: " + (lead.plan_next_action || "") + " · Target: " + (lead.contact_role || "") + " / " + (lead.department || "") + "\nProduct lines × Silitex:\n" + rows.map((r) => "- " + r.line + " → " + r.silitex + " (" + r.function + "; " + r.benefit + (r.green ? "; green: " + r.green : "") + ")").join("\n"); };
  return (
    <Card className="space-y-2 border-brand-200">
      <div className="flex flex-wrap items-center gap-2"><div className="font-bold">🤖 {tr("שאל את Silitex על")} {short}</div><span className="text-xs text-slate-500">{tr("עונה מהקטלוג, מהמסמכים ומטבלת ההתאמה של החשבון הנבחר — בלי לעזוב את המסך")}</span></div>
      <input className={inputCls + " text-base"} placeholder={tr("שאלה חופשית באנגלית או בעברית…")} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="flex flex-wrap gap-1">{examples.map((e) => <button key={e} className="text-xs px-2 py-1 rounded-full border bg-white hover:bg-slate-50" onClick={() => setQ(e)}>{e}</button>)}{q && <button className={btnGhost + " text-xs"} onClick={() => setQ("")}>✕</button>}</div>
      {q.trim() && <AiPanel title={q} buttonLabel={tr("ענה עם Claude")} sessionTokens={sessionTokens} sessionCost={sessionCost} onUsage={onUsage} buildPrompt={() => { const hits = searchAll(q + " " + lead.name + " " + (lead.recommended_sku || ""), kb); return { context: accountContext() + "\n\n[SOURCES]\n" + askContext(hits), prompt: askPrompt(q) + " The [ACCOUNT] block describes the prospect in question — use it, and never invent products that are not in the sources or the account matrix." }; }} />}
    </Card>
  );
}
