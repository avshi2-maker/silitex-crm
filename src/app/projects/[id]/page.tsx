"use client";
// page.tsx (src/app/projects/[id]/page.tsx) · created 10.11.2026 13:35 (Asia/Jerusalem) — v1.9.8 📁 Project card — the whole A–Z on one page
// number + description · stepper · quote / PO / invoice · team · send with the number · ALL correspondence (synced from the Hub, nothing retyped) · history + tasks · export bar
import { use, useEffect } from "react";
import Link from "next/link";
import { H1, Card } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useProjects } from "@/lib/use-projects";
import { projectText, refLabel } from "@/lib/projects";
import ProjectHead from "@/components/projects/ProjectHead";
import ProjectSteps from "@/components/projects/ProjectSteps";
import ProjectDocs from "@/components/projects/ProjectDocs";
import ProjectTeam from "@/components/projects/ProjectTeam";
import ProjectActions from "@/components/projects/ProjectActions";
import ProjectHistory from "@/components/projects/ProjectHistory";
import CorrespondenceCard from "@/components/leads/CorrespondenceCard";
import ExportBar from "@/components/ExportBar";
import { useLang } from "@/i18n";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { t: tr } = useLang();
  const { state, mergeServerTasks, toggleTask, addActivity } = useStore();
  const { list, tasks, patch } = useProjects({ id });
  useEffect(() => { mergeServerTasks(tasks); }, [tasks]); // eslint-disable-line react-hooks/exhaustive-deps
  const p = (list || []).find((x) => x.id === id);
  if (list === null) return <div className="text-sm text-slate-500">⏳ {tr("טוען…")}</div>;
  if (!p) return <Card><div className="space-y-2"><b>{tr("פרויקט לא נמצא")}: {id}</b><div><Link href="/projects" className="underline">{tr("חזרה לפרויקטים")}</Link></div></div></Card>;
  const lead = state.leads.find((l) => l.id === p.lead_id);
  const save = (x: Parameters<typeof patch>[1], bump?: string) => patch(p.id, x, bump);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3"><Link href="/projects" className="text-sm underline text-slate-500">→ {tr("כל הפרויקטים")}</Link><div className="flex-1"><H1 sub={p.lead_name}>📁 <span dir="ltr">{refLabel(p)}</span></H1></div></div>
      <ProjectHead key={p.id + p.version} p={p} lead={lead} onSave={save} />
      <ProjectSteps p={p} onStage={(stage) => { if (stage !== p.stage) save({ stage }).catch(() => {}); }} />
      <ProjectDocs key={"d" + p.version} p={p} onSave={(x) => save(x)} />
      <div className="grid gap-4 lg:grid-cols-3 items-start">
        <div className="space-y-4"><ProjectTeam p={p} contacts={state.contacts} onSave={(team) => save({ team })} /><ProjectActions p={p} lead={lead} onLog={(t) => addActivity(p.lead_id, "project", "#" + p.id + " · " + t)} /></div>
        <div className="lg:col-span-2">{lead ? <CorrespondenceCard lead={lead} /> : <Card className="text-sm text-slate-500">{tr("הלקוח לא נטען בדפדפן הזה — פתח את כרטיס הלקוח פעם אחת.")}</Card>}</div>
      </div>
      <ProjectHistory p={p} tasks={state.tasks.filter((t) => t.lead_id === p.lead_id)} onDone={toggleTask} />
      <Card><b>{tr("ייצוא כרטיס הפרויקט")}</b><ExportBar title={"פרויקט " + refLabel(p) + " — " + p.lead_name} text={projectText(p)} filename={p.id + "_v" + p.version} /></Card>
    </div>
  );
}
