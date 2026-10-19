// playbook.ts (src/lib/playbook.ts) · updated 19.10.2026 11:45 (Asia/Jerusalem) — ACCOUNT PLAYBOOKS helpers: a playbook step is a normal task whose kind = "plan:<template>:<step>:<owner>" (no database change needed). Builds a step task, reads it back, and the first plans for Careline / Sano / Luxembourg + the Pini meeting.
import { PLAYBOOKS, type Owner } from "@/config/playbooks";
import type { Task } from "@/lib/types";
export type PlanRef = { tpl: string; seq: number; owner: Owner };
export function parsePlan(kind?: string): PlanRef | null {
  const m = /^plan:([a-z]+):(\d+):([a-z]+)$/.exec(kind || ""); return m ? { tpl: m[1], seq: Number(m[2]), owner: m[3] as Owner } : null;
}
export function stepTask(lead: { id: string; name: string }, tpl: string, seq: number, due: string): Task | null {
  const s = PLAYBOOKS[tpl]?.steps[seq - 1]; if (!s) return null;
  return { id: "plan-" + lead.id + "-" + tpl + "-" + seq + "-" + due.replace(/-/g, ""), lead_id: lead.id, lead_name: lead.name, title: s.title, due, cadence: "once", done: false, kind: "plan:" + tpl + ":" + seq + ":" + s.owner };
}
export const planTasksOf = (tasks: Task[], leadId: string) => tasks.filter((t) => t.lead_id === leadId && parsePlan(t.kind));
export const activePlanTask = (tasks: Task[], leadId: string) => planTasksOf(tasks, leadId).find((t) => !t.done);
/** first real plans (19/10/2026) — deterministic ids, so phone + desktop never duplicate */
export function seedPlans(leads: { id: string; name: string }[]): Task[] {
  const L = (id: string) => leads.find((l) => l.id === id);
  const out: Task[] = [];
  const add = (id: string, tpl: string, due: string) => { const l = L(id); const t = l && stepTask(l, tpl, 1, due); if (t) out.push({ ...t, id: "plan-" + id + "-" + tpl + "-1-seed" }); };
  add("LEAD-023", "agro", "2026-10-20");
  add("LEAD-024", "cosmetics", "2026-10-27");
  add("LEAD-008", "household", "2026-10-28");
  out.push({ id: "task-pini-22102026", lead_id: "", lead_name: "פיני — פגישת עבודה", title: "פגישה עם פיני: הצגת Silitex, ערכי שוק, ספקים נוכחיים, חידוש שיתוף פעולה — להקליט ולהעלות לתיבת השטח", due: "2026-10-22", cadence: "once", done: false, kind: "manual" });
  return out;
}
