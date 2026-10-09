"use client";
// AiPanel.tsx (src/components/AiPanel.tsx) · updated 09.10.2026 10:30 (Asia/Jerusalem)
// Reusable "ask Claude" panel: runs /api/ai, shows output + TokenMeter + ExportBar (the standing footer). Used by leads, campaign, KB.
import { useState } from "react";
import TokenMeter from "./TokenMeter";
import ExportBar from "./ExportBar";
import { btnPrimary } from "./ui";
import type { Usage } from "@/lib/types";
import { useLang } from "@/i18n";
type Props = { title: string; buttonLabel: string; buildPrompt: () => { prompt: string; context?: string }; onUsage: (u: Usage) => void; sessionTokens: number; sessionCost: number; onResult?: (text: string) => void };
export default function AiPanel({ title, buttonLabel, buildPrompt, onUsage, sessionTokens, sessionCost, onResult }: Props) {
  const { t: tr, lang } = useLang();
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [err, setErr] = useState("");
  const run = async () => {
    setBusy(true); setErr("");
    try {
      const body = buildPrompt();
      const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, lang }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "error");
      setText(j.text); setUsage(j.usage); onUsage(j.usage); onResult?.(j.text);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : tr("שגיאה")); }
    setBusy(false);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h3 className="font-bold">{title}</h3><button className={btnPrimary} onClick={run} disabled={busy}>{busy ? tr("מעבד…") : buttonLabel}</button></div>
      <TokenMeter usage={usage} sessionTokens={sessionTokens} sessionCost={sessionCost} busy={busy} />
      {err && <div className="text-sm text-red-600">{err}</div>}
      {text && (<><pre className="whitespace-pre-wrap text-sm bg-slate-50 border rounded-lg p-3 leading-6 font-[inherit]">{text}</pre><ExportBar title={title} text={text} /></>)}
    </div>
  );
}
