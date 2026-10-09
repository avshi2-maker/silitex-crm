// transcript.ts (src/prompts/transcript.ts) · updated 09.10.2026 19:30 (Asia/Jerusalem) — WhatsApp / phone transcript → CRM summary + next action
import { intakeSummary } from "@/lib/intake";
import type { Lead } from "@/lib/types";
import { STAGES } from "@/config/stages";
export function transcriptContext(lead: Lead, transcript: string): string {
  return "לקוח: " + lead.name + " · שלב נוכחי: " + lead.stage + " · צורך ידוע: " + lead.use_case + "\nבירור טכני:\n" + intakeSummary(lead) + "\nשלבים אפשריים: " + STAGES.map((s) => s.key).join(", ") + "\n\nתמלול:\n" + transcript.slice(0, 6000);
}
export const TRANSCRIPT_PROMPT = "סכם את השיחה ל-CRM. מבנה קבוע:\nסיכום: 2–3 משפטים.\nצרכים: רשימה.\nהתנגדויות / שאלות פתוחות: רשימה (טכניות → להעביר למעבדת Silitex).\nהוסכם: רשימה.\nבשורה האחרונה בדיוק בפורמט הזה (באנגלית, בלי טקסט נוסף אחריה):\nNEXT: <yyyy-mm-dd> | <stage key from the list> | <one-line next action>";
export function parseNext(text: string): { due: string; stage: string; title: string } | null {
  const m = text.match(/NEXT:\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([a-z_]+)\s*\|\s*(.+)$/im);
  return m ? { due: m[1], stage: m[2].trim(), title: m[3].trim() } : null;
}
