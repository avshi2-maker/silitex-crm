"use client";
// page.tsx (src/app/report/page.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — principal report: live CRM data → Claude → English report + export bar
import { useStore } from "@/lib/store";
import { Card, H1 } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import { useLang } from "@/i18n";
import { reportContext, REPORT_PROMPT } from "@/prompts/report";
import { fmtDate, fmtUsd } from "@/lib/format";
import { STAGES } from "@/config/stages";
import FunnelStats from "@/components/FunnelStats";
export default function ReportPage() {
  const { t: tr } = useLang();
  const { state, ready, addSpend } = useStore();
  if (!ready) return null;
  return (
    <div className="space-y-4">
      <H1 sub={tr("דוח חודשי ליצרן (Silitex) — נוצר מנתוני ה-CRM החיים, באנגלית")}>{tr("דוח ליצרן")} — {fmtDate(new Date())}</H1>
      <Card className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-center">
        {STAGES.map((s) => { const ls = state.leads.filter((l) => l.stage === s.key); return (<div key={s.key} className="border rounded-lg p-2"><div className="text-xs text-slate-500">{tr(s.he)}</div><div className="text-xl font-bold text-brand-500">{ls.length}</div><div className="text-[11px] text-slate-400">{fmtUsd(ls.reduce((a, l) => a + l.value_usd, 0))}</div></div>); })}
      </Card>
      <FunnelStats leads={state.leads} docs={state.docs} samples={state.samples} activities={state.activities} />
      <Card><AiPanel title={"Silitex Israel — Monthly Distributor Report " + fmtDate(new Date())} buttonLabel={tr("צור דוח")} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} buildPrompt={() => ({ context: reportContext(state.leads, state.samples, state.activities, state.docs), prompt: REPORT_PROMPT + " IMPORTANT: write in English regardless of UI language." })} /></Card>
    </div>
  );
}
