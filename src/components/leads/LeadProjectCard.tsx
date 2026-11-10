"use client";
// LeadProjectCard.tsx (src/components/leads/LeadProjectCard.tsx) · created 10.11.2026 13:40 (Asia/Jerusalem) — v1.9.8 📁 the customer's project number on the customer page
// Open project → number + stage + link to the A–Z card. None → "📁 open project" (auto-open happens by itself when the customer asks for data / sample / price).
import Link from "next/link";
import { Card, Badge, btnGhost } from "@/components/ui";
import { refLabel, stageText } from "@/lib/projects";
import { ENDED } from "@/config/projects";
import { useLang } from "@/i18n";
import type { Lead, Project } from "@/lib/types";

type Props = { lead: Lead; list: Project[] | null; onOpen: () => void };
export default function LeadProjectCard({ lead, list, onOpen }: Props) {
  const { t: tr } = useLang(); const all = list || []; const open = all.find((p) => !ENDED.includes(p.stage)); const old = all.filter((p) => p !== open);
  return (
    <Card className="flex flex-wrap items-center gap-3 border-sky-200">
      <b>📁 {tr("פרויקט")}</b>
      {list === null && <span className="text-sm text-slate-500">⏳</span>}
      {open && <><Link href={"/projects/" + open.id} dir="ltr" className="font-mono text-sm font-bold bg-ink-900 text-white rounded-lg px-3 py-1.5">{refLabel(open)}</Link><Badge tone="amber">{tr(stageText(open.stage))}</Badge><span className="text-sm text-slate-600 flex-1 min-w-[160px]" dir="auto">{open.description}</span></>}
      {list !== null && !open && <><span className="text-sm text-slate-500 flex-1">{tr("אין פרויקט פתוח — נפתח לבד כשהלקוח מבקש נתונים / דוגמה / מחיר.")}</span><button type="button" className={btnGhost + " min-h-[44px]"} onClick={onOpen}>📁 {tr("פתח פרויקט")}</button></>}
      {old.length > 0 && <span className="text-xs text-slate-500 w-full">{tr("פרויקטים קודמים")}: {old.map((p) => <Link key={p.id} href={"/projects/" + p.id} className="underline me-2" dir="ltr">#{p.id}</Link>)}</span>}
      {lead.contact_phone ? null : open && <span className="text-xs text-amber-700 w-full">{tr("אין נייד בכרטיס — WhatsApp עם מספר הפרויקט לא יעבוד עד שיוזן.")}</span>}
    </Card>
  );
}
