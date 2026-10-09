// cadence.ts (src/lib/store/cadence.ts) · updated 09.10.2026 09:40 (Asia/Jerusalem)
// Pure scheduling logic: given leads + existing tasks, return tasks to add. Rules live in config/cadence.ts.
import { DAILY_BY_STAGE, WEEKLY_TITLE, WEEKLY_EVERY_DAYS } from "@/config/cadence";
import { isClosed } from "@/config/stages";
import { uid, addDays } from "@/lib/format";
import type { Lead, Task } from "@/lib/types";
export function dailyTitle(l: Lead): string {
  return (DAILY_BY_STAGE[l.stage] || "מעקב").replace("{role}", l.contact_role || "").replace("{dept}", l.department || "");
}
export function buildSchedule(leads: Lead[], tasks: Task[], today: string): Task[] {
  const add: Task[] = [];
  for (const l of leads) {
    if (isClosed(l.stage)) continue;
    const hasDaily = tasks.some((t) => t.lead_id === l.id && t.cadence === "daily" && t.due === today);
    const hasWeekly = tasks.some((t) => t.lead_id === l.id && t.cadence === "weekly" && !t.done);
    if (!hasDaily) add.push({ id: uid("task"), lead_id: l.id, lead_name: l.name, title: dailyTitle(l), due: today, cadence: "daily", done: false, kind: "followup" });
    if (!hasWeekly) add.push({ id: uid("task"), lead_id: l.id, lead_name: l.name, title: WEEKLY_TITLE, due: addDays(today, WEEKLY_EVERY_DAYS), cadence: "weekly", done: false, kind: "review" });
  }
  return add;
}
