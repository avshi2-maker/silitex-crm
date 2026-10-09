// brief.ts (src/prompts/brief.ts) · updated 09.10.2026 10:05 (Asia/Jerusalem) — daily WhatsApp brief
import { stageHe, isClosed } from "@/config/stages";
import { fmtDate, fmtUsd } from "@/lib/format";
import type { Lead, Task } from "@/lib/types";
export function briefContext(leads: Lead[], tasks: Task[], today: string): string {
  const open = leads.filter((l) => !isClosed(l.stage));
  const due = tasks.filter((t) => !t.done && t.due <= today);
  return "תאריך: " + fmtDate(today) + "\nלקוחות פתוחים: " + open.length + " · פוטנציאל: " + fmtUsd(open.reduce((a, l) => a + l.value_usd, 0)) +
    "\n\nמשימות להיום (" + due.length + "):\n" + due.map((t) => "- " + t.lead_name + " — " + t.title + (t.cadence === "weekly" ? " [שבועי]" : "")).join("\n") +
    "\n\nלקוחות (שלב · פוטנציאל · פעולה הבאה מתוכנית):\n" + open.map((l) => "- " + l.name + " · " + stageHe(l.stage) + " · " + fmtUsd(l.value_usd) + " · " + (l.plan_next_action || "—") + " · איש קשר: " + (l.contact_name || l.contact_role)).join("\n");
}
export const BRIEF_PROMPT = "כתוב תדריך בוקר ל-WhatsApp (עד 160 מילים, ללא טבלאות): כותרת עם התאריך, 'היום — 5 השיחות החשובות' כרשימה ממוספרת (לקוח · מה לעשות · למה עכשיו), שורת 'פוטנציאל פתוח', ומשפט מוטיבציה קצר. בחר את 5 הלקוחות לפי פוטנציאל × דחיפות.";
