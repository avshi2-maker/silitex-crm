"use client";
// ProjectSteps.tsx (src/components/projects/ProjectSteps.tsx) · created 10.11.2026 13:05 (Asia/Jerusalem) — v1.9.8 📁 A → Z stepper (click a step = move the project there)
import { Card } from "@/components/ui";
import { PROJECT_STAGES, LOST, stageIdx } from "@/config/projects";
import { useLang } from "@/i18n";
import type { Project } from "@/lib/types";

export default function ProjectSteps({ p, onStage }: { p: Project; onStage: (stage: string) => void }) {
  const { t: tr } = useLang(); const cur = p.stage === LOST.id ? -1 : stageIdx(p.stage);
  const box = (i: number) => (i < cur ? "bg-sky-50 border-sky-200 text-sky-900" : i === cur ? "bg-ink-900 border-ink-900 text-white" : "bg-white border-dashed text-slate-500");
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold flex-1">{tr("A → Z · מהפנייה ועד החשבונית")}</h3>
        <span className="text-xs text-slate-500">{p.stage === LOST.id ? LOST.icon + " " + tr(LOST.he) : tr("שלב") + " " + (cur + 1) + " / " + PROJECT_STAGES.length}</span>
        {p.stage !== LOST.id && p.stage !== "closed" && <button type="button" className="text-xs underline text-slate-500" onClick={() => onStage(LOST.id)}>{LOST.icon} {tr("סמן: לא התקדם")}</button>}
      </div>
      <ol className="grid gap-2 overflow-x-auto" style={{ gridTemplateColumns: "repeat(" + PROJECT_STAGES.length + ", minmax(108px, 1fr))" }}>
        {PROJECT_STAGES.map((s, i) => (
          <li key={s.id}>
            <button type="button" onClick={() => onStage(s.id)} className={"w-full h-full text-start border rounded-xl p-2 min-h-[72px] " + box(i)} title={tr(s.hint)}>
              <div className="text-[11px] opacity-75">{i + 1} · {s.icon}</div>
              <div className="text-sm font-semibold leading-tight">{tr(s.he)}</div>
            </button>
          </li>))}
      </ol>
    </Card>
  );
}
