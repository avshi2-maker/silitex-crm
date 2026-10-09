"use client";
// PlanCard.tsx (src/components/PlanCard.tsx) · updated 09.10.2026 10:30 (Asia/Jerusalem) — sales action plan for one lead (from action-plan CSV) + "make it a task"
import { Card, Badge, btnGhost } from "./ui";
import { stageHe } from "@/config/stages";
import type { Lead } from "@/lib/types";
import { useLang } from "@/i18n";
type Props = { lead: Lead; onTask: (title: string) => void };
export default function PlanCard({ lead, onTask }: Props) {
  const { t: tr } = useLang();
  if (!lead.plan_phase) return null;
  const rows: [string, string | undefined][] = [[tr("שלב בתוכנית"), lead.plan_stage], [tr("יעד צנרת"), lead.plan_target_stage ? tr(stageHe(lead.plan_target_stage)) : undefined], [tr("SKU מומלץ"), lead.recommended_sku], [tr("מחליף את"), lead.competitor_offset], [tr("איש קשר יעד"), lead.contact_role]];
  return (
    <Card>
      <div className="flex items-center justify-between mb-2"><h3 className="font-bold">{tr("תוכנית פעולה")}</h3><Badge tone="amber">{lead.plan_phase}</Badge></div>
      <dl className="text-sm space-y-1">{rows.filter(([, v]) => v).map(([k, v]) => (<div key={k} className="grid grid-cols-[110px_1fr] gap-1"><dt className="text-slate-500">{k}</dt><dd>{v}</dd></div>))}</dl>
      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-sm"><b>{tr("הפעולה הבאה:")}</b> {lead.plan_next_action}</div>
      <button className={btnGhost + " mt-2"} onClick={() => onTask(lead.plan_next_action || tr("מעקב"))}>{tr("+ הפוך למשימה להיום")}</button>
    </Card>
  );
}
