"use client";
// GrillPanel.tsx (src/components/GrillPanel.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — rehearsal bot for /notes: Silitex CTO asks 5 hard questions → you answer → scored + cue to re-read
import { useState } from "react";
import AiPanel from "./AiPanel";
import { useStore } from "@/lib/store";
import { grillContext, GRILL_QUESTIONS, grillScore } from "@/prompts/grill";
export default function GrillPanel({ onClose }: { onClose: () => void }) {
  const { state, ready, addSpend } = useStore();
  const [qs, setQs] = useState(""); const [ans, setAns] = useState("");
  if (!ready) return null;
  const usage = (u: { input_tokens: number; output_tokens: number; cost_usd: number }) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd);
  return (
    <div className="mt-8 bg-white text-ink-900 rounded-2xl p-5 space-y-4 max-w-5xl" dir="ltr">
      <div className="flex items-center justify-between"><div><div className="font-bold text-lg">🔥 Grill me — rehearsal with the Silitex CTO</div><div className="text-xs text-slate-500">Step 1: get 5 hard questions · Step 2: type your answers · Step 3: get scored + which cue to re-read. Private — not shown on the shared screen.</div></div><button className="text-slate-400 hover:text-ink-900" onClick={onClose}>✕</button></div>
      <AiPanel title="Silitex CTO — 5 questions" buttonLabel="1 · Ask me" sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={usage} onResult={setQs} buildPrompt={() => ({ context: grillContext(), prompt: GRILL_QUESTIONS + " IMPORTANT: write in English." })} />
      {qs && (<>
        <textarea className="w-full border rounded-lg p-3 text-sm" rows={7} value={ans} onChange={(e) => setAns(e.target.value)} placeholder="1. … 2. … answer in your own words, as you would say it on Monday" />
        <AiPanel title="Score & coaching" buttonLabel="2 · Score my answers" sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={usage} buildPrompt={() => ({ context: grillContext(), prompt: grillScore(qs, ans) + " IMPORTANT: write in English." })} />
      </>)}
    </div>
  );
}
