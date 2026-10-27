// sales-meeting.ts (src/prompts/sales-meeting.ts) · created 27.10.2026 04:50 (Asia/Jerusalem) — v1.0.0
// 🤝 Notes / photos of handwritten notes from a sales meeting or call → structured JSON (Hebrew). Never invents: unreadable words → "?" + listed.
import type { SmSummary } from "@/lib/sales-meeting-types";
export const SM_PROMPT = `אתה עוזר מכירות של ספירים (מפיץ סיליקון Silitex בישראל). קיבלת סיכום פגישה / שיחת מכירה — טקסט ו/או צילומי דפים בכתב יד (עברית, אנגלית, שמות מוצרים ו-INCI).
כללים:
- קרא את כתב היד בזהירות. מילה שאינך בטוח בה — כתוב "?" במקומה והוסף אותה לרשימה unreadable (למשל "שורה 3: 'מ?רוקו' — Moroccanoil?"). אל תמציא שמות, כמויות או תאריכים.
- התאם שמות לקוחות לרשימת הלקוחות שבהקשר (id בסוגריים). אם אין התאמה ודאית — השאר lead_id ריק.
- ticks לכל לקוח רק אם כתוב במפורש: pini = לקוח של פיני, tds = צריך דפי מידע, sample = צריך דוגמה ("yes"/"no"/"").
- משימות: פעולה ברורה אחת לכל משימה, עם תאריך YYYY-MM-DD (אם לא נכתב — שבוע מתאריך הפגישה).
- כתוב בעברית; שמות מוצרים, חברות ו-INCI כפי שנכתבו.
החזר JSON בלבד, ללא טקסט נוסף:
{"title":"כותרת קצרה","summary":"2-4 משפטים","points":["נקודה"],"customers":[{"name":"","lead_id":"","decision":"","next_step":"","pini":"","tds":"","sample":""}],"tasks":[{"title":"","lead_id":"","lead_name":"","due":"YYYY-MM-DD"}],"open_questions":[""],"unreadable":[""]}`;
export function smContext(heldAt: string, withWho: string, kind: string, leads: { id: string; name: string }[]): string {
  return "תאריך הפגישה: " + heldAt + " · עם: " + withWho + " · סוג: " + kind + "\nלקוחות ב-CRM (id · שם):\n" + leads.map((l) => l.id + " · " + l.name).join("\n");
}
export function parseSm(text: string): SmSummary | null {
  const m = text.match(/\{[\s\S]*\}/); if (!m) return null;
  try {
    const j = JSON.parse(m[0]); const arr = (x: unknown) => (Array.isArray(x) ? x : []);
    return { title: String(j.title || ""), summary: String(j.summary || ""), points: arr(j.points).map(String).filter(Boolean), customers: arr(j.customers).map((c: Record<string, unknown>) => ({ name: String(c.name || ""), lead_id: String(c.lead_id || ""), decision: String(c.decision || ""), next_step: String(c.next_step || ""), pini: (c.pini === "yes" || c.pini === "no" ? c.pini : "") as "", tds: (c.tds === "yes" || c.tds === "no" ? c.tds : "") as "", sample: (c.sample === "yes" || c.sample === "no" ? c.sample : "") as "" })).filter((c) => c.name),
      tasks: arr(j.tasks).map((t: Record<string, unknown>) => ({ title: String(t.title || ""), lead_id: String(t.lead_id || ""), lead_name: String(t.lead_name || ""), due: /^\d{4}-\d{2}-\d{2}$/.test(String(t.due)) ? String(t.due) : "" })).filter((t) => t.title),
      open_questions: arr(j.open_questions).map(String).filter(Boolean), unreadable: arr(j.unreadable).map(String).filter(Boolean) };
  } catch { return null; }
}
