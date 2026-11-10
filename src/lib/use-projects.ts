"use client";
// use-projects.ts (src/lib/use-projects.ts) · created 10.11.2026 12:45 (Asia/Jerusalem) — v1.9.8 📁 Projects — client hook over /api/projects
import { useCallback, useEffect, useState } from "react";
import { ENDED } from "@/config/projects";
import { emitSave } from "./save-signal";
import type { Project, Task } from "./types";

/** no arg = all projects (runs the auto-open sweep) · { lead } = one customer · { id } = one project */
export function useProjects(by?: { lead?: string; id?: string }) {
  const lead = by?.lead ? "?lead=" + encodeURIComponent(by.lead) : by?.id ? "?id=" + encodeURIComponent(by.id) : "";
  const [list, setList] = useState<Project[] | null>(null); const [opened, setOpened] = useState<string[]>([]); const [err, setErr] = useState(""); const [tasks, setTasks] = useState<Task[]>([]);
  const reload = useCallback(() => {
    fetch("/api/projects" + lead, { cache: "no-store" }).then((r) => r.json())
      .then((j) => { setList((j.projects || []) as Project[]); setOpened(j.opened || []); setTasks((j.tasks || []) as Task[]); setErr(j.error || ""); }).catch((e) => { setList([]); setErr(String(e)); });
  }, [lead]);
  useEffect(() => { reload(); }, [reload]);
  const create = async (b: { lead_id: string; lead_name: string; description?: string; request?: string }) => {
    const r = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); const j = await r.json();
    if (!r.ok) { emitSave("err", j.error); throw new Error(j.error || "error"); } emitSave("ok"); reload(); return j.project as Project;
  };
  const patch = async (id: string, p: Partial<Project>, bump?: string) => {
    const r = await fetch("/api/projects", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, patch: p, bump }) }); const j = await r.json();
    if (!r.ok) { emitSave("err", j.error); throw new Error(j.error || "error"); } emitSave("ok");
    setList((cur) => (cur || []).map((x) => (x.id === id ? (j.project as Project) : x))); return j.project as Project;
  };
  const openOf = (leadId: string) => (list || []).find((p) => p.lead_id === leadId && !ENDED.includes(p.stage)) || null;
  return { list, opened, tasks, err, reload, create, patch, openOf };
}
