"use client";
// ProjectHistory.tsx (src/components/projects/ProjectHistory.tsx) · created 10.11.2026 13:25 (Asia/Jerusalem) — v1.9.8 📁 version history + the customer's open tasks (from the CRM)
import { Card, Badge } from "@/components/ui";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Project, Task } from "@/lib/types";

export default function ProjectHistory({ p, tasks, onDone }: { p: Project; tasks: Task[]; onDone: (id: string) => void }) {
  const { t: tr } = useLang();
  const open = tasks.filter((t) => !t.done).sort((a, b) => String(a.due).localeCompare(String(b.due)));
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="space-y-2">
        <h3 className="font-bold">{tr("היסטוריית גרסאות")}</h3>
        <ul className="divide-y text-sm">{[...(p.history || [])].reverse().map((h, i) => (
          <li key={i} className="py-2 flex gap-3 items-start"><span dir="ltr" className="font-mono text-xs font-bold bg-slate-100 rounded px-2 py-0.5">v{h.v}</span><span className="text-slate-500 whitespace-nowrap">{fmtDateTime(h.at)}</span><span className="flex-1" dir="auto">{h.text}</span></li>))}
        </ul>
      </Card>
      <Card className="space-y-2">
        <h3 className="font-bold">🔔 {tr("משימות פתוחות של הלקוח")} <Badge tone="blue">{open.length}</Badge></h3>
        {open.length === 0 && <div className="text-sm text-slate-400">{tr("אין משימות פתוחות.")}</div>}
        <ul className="divide-y text-sm">{open.map((t) => (
          <li key={t.id} className="py-2 flex gap-3 items-center">
            <input type="checkbox" className="w-5 h-5" onChange={() => onDone(t.id)} aria-label={tr("בוצע")} />
            <span className="whitespace-nowrap font-semibold">{fmtDate(t.due)}</span><span className="flex-1" dir="auto">{t.title}</span><span className="text-xs text-slate-400">{t.kind}</span>
          </li>))}
        </ul>
      </Card>
    </div>
  );
}
