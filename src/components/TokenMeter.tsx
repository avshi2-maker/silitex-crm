"use client";
// TokenMeter.tsx (src/components/TokenMeter.tsx) · updated 09.10.2026 09:10 (Asia/Jerusalem)
// Live token + cost meter for one AI call plus session total. Attach to every AI output.
import { fmtMoney } from "@/lib/format";
import type { Usage } from "@/lib/types";
type Props = { usage?: Usage | null; sessionTokens: number; sessionCost: number; busy?: boolean };
export default function TokenMeter({ usage, sessionTokens, sessionCost, busy }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50 border rounded-lg px-3 py-2 print:hidden">
      <span className={"inline-block w-2 h-2 rounded-full " + (busy ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
      {usage ? (
        <>
          <span>קלט: <b>{usage.input_tokens.toLocaleString()}</b></span>
          <span>פלט: <b>{usage.output_tokens.toLocaleString()}</b></span>
          <span>עלות קריאה: <b>{fmtMoney(usage.cost_usd)}</b></span>
          <span className="text-slate-400">{usage.model}{usage.mock ? " · דמו (ללא מפתח API)" : ""}</span>
        </>
      ) : (<span>{busy ? "מעבד…" : "מוכן"}</span>)}
      <span className="mr-auto">סה"כ סשן: <b>{sessionTokens.toLocaleString()}</b> טוקנים · <b>{fmtMoney(sessionCost, 3)}</b></span>
    </div>
  );
}
