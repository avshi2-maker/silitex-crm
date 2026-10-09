"use client";
// TranscriptCard.tsx (src/components/leads/TranscriptCard.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — paste WhatsApp / phone transcript → AI summary → save to log + task + stage
import { useState } from "react";
import AiPanel from "@/components/AiPanel";
import { Card, btnPrimary, btnGhost, inputCls } from "@/components/ui";
import { transcriptContext, TRANSCRIPT_PROMPT, parseNext } from "@/prompts/transcript";
import { STAGES } from "@/config/stages";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Lead, Stage } from "@/lib/types";
type Props = { lead: Lead; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void; onLog: (text: string) => void; onTask: (title: string, due: string) => void; onStage: (s: Stage) => void };
export default function TranscriptCard({ lead, spend, addSpend, onLog, onTask, onStage }: Props) {
  const { t: tr } = useLang();
  const [raw, setRaw] = useState(""); const [out, setOut] = useState(""); const [saved, setSaved] = useState(false);
  const next = out ? parseNext(out) : null;
  const stageOk = next && STAGES.some((s) => s.key === next.stage) && next.stage !== lead.stage;
  const save = () => { onLog(out); if (next) onTask(next.title, next.due); if (stageOk && next) onStage(next.stage as Stage); setSaved(true); };
  return (
    <Card>
      <h3 className="font-bold mb-1">{tr("תמלול שיחה / WhatsApp")}</h3>
      <div className="text-xs text-slate-500 mb-2">{tr("הדבק תמלול שיחת טלפון או שרשור WhatsApp. Claude מסכם, מוציא צרכים והתנגדויות, מציע שלב ופעולה הבאה — ואתה שומר ביומן בלחיצה.")}</div>
      <textarea className={inputCls + " mb-2 font-mono text-xs"} rows={6} value={raw} onChange={(e) => { setRaw(e.target.value); setSaved(false); }} placeholder={tr("[12:03] יוסי: שלחתם דגימה? …")} dir="auto" />
      <AiPanel title={tr("סיכום שיחה — ") + lead.name} buttonLabel={tr("סכם ל-CRM")} sessionTokens={spend.tokens} sessionCost={spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} onResult={(t) => { setOut(t); setSaved(false); }} buildPrompt={() => ({ context: transcriptContext(lead, raw), prompt: TRANSCRIPT_PROMPT })} />
      {out && (<div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {next && <span className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200">{tr("הבא: ")}{fmtDate(next.due)} · {next.title}{stageOk && " · " + tr("שלב → ") + next.stage}</span>}
        <button className={saved ? btnGhost : btnPrimary} disabled={saved} onClick={save}>{saved ? tr("✓ נשמר ביומן") : tr("שמור ביומן + משימה")}</button>
      </div>)}
    </Card>
  );
}
