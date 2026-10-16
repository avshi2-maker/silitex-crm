"use client";
// useMeetingOps.ts (src/components/meetings/useMeetingOps.ts) · updated 16.10.2026 18:20 (Asia/Jerusalem) — shared ✓-done / 📌-CRM-task handlers for meeting action items (keeps the CRM task in sync)
import { useStore } from "@/lib/store";
import type { MeetingAction } from "@/lib/meeting-types";
import { actionTask } from "./client";
export function useMeetingOps(setActions: (f: (a: MeetingAction[]) => MeetingAction[]) => void, heldAt: (mid: string) => string) {
  const { state, addTask, toggleTask } = useStore();
  const patch = (id: string, p: Partial<MeetingAction>) => setActions((xs) => xs.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const onToggle = async (a: MeetingAction) => {
    const status = a.status === "done" ? "open" : "done";
    patch(a.id, { status });
    const t = a.task_id ? state.tasks.find((x) => x.id === a.task_id) : null;
    if (t && t.done !== (status === "done")) toggleTask(t.id);
    const r = await fetch("/api/meetings/actions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id, status }) });
    if (!r.ok) patch(a.id, { status: a.status });
  };
  const onTask = async (a: MeetingAction) => {
    const t = addTask(actionTask(a, heldAt(a.meeting_id)));
    patch(a.id, { task_id: t.id });
    await fetch("/api/meetings/actions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id, task_id: t.id }) });
  };
  return { onToggle, onTask };
}
