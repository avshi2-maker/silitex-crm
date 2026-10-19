// playbooks.ts (src/config/playbooks.ts) · updated 19.10.2026 11:45 (Asia/Jerusalem) — ACCOUNT PLAYBOOKS: the real step sequence per customer type. Each step = title · owner · days after the previous step is done · stage the lead moves to when the step is done. Edit wording / days here only.
import type { Stage } from "@/lib/types";
export type Owner = "me" | "silitex" | "customer" | "pini";
export type PlanStep = { title: string; owner: Owner; wait: number; stage?: Stage };
export const OWNER_HE: Record<Owner, string> = { me: "אני", silitex: "Silitex", customer: "לקוח", pini: "פיני" };
const tail: PlanStep[] = [
  { title: "פיילוט / אצווה ניסיונית במפעל", owner: "customer", wait: 14, stage: "pilot" },
  { title: "אישור מו\"פ ✓ — לקבל אישור טכני בכתב", owner: "customer", wait: 14, stage: "rd_approved" },
  { title: "פנייה לרכש — RFQ והצעת מחיר", owner: "me", wait: 7, stage: "quote" },
];
export const PLAYBOOKS: Record<string, { he: string; steps: PlanStep[] }> = {
  cosmetics: { he: "קוסמטיקה וטיפוח", steps: [
    { title: "שיחת פתיחה עם מו\"פ — מוצרים, חומרי סיליקון בשימוש, בעיות", owner: "me", wait: 0, stage: "contacted" },
    { title: "לקבל רשימת חומרי סיליקון נוכחיים + TDS", owner: "customer", wait: 7 },
    { title: "התאמת דרגות Silitex + סיכום קצר ללקוח", owner: "me", wait: 3 },
    { title: "לקבל מ-Silitex TDS / SDS + הצהרת D4 / D5 / D6", owner: "silitex", wait: 7 },
    { title: "משלוח דגימות מעבדה ללקוח", owner: "silitex", wait: 10, stage: "sample" },
    { title: "תוצאות מעבדה — תחושה, יציבות (54°C), צמיגות", owner: "customer", wait: 21 },
    ...tail] },
  household: { he: "ניקיון ודטרגנטים", steps: [
    { title: "שיחת פתיחה עם מו\"פ — מונעי קצף ומרככים בשימוש, בעיות בקו המילוי", owner: "me", wait: 0, stage: "contacted" },
    { title: "לקבל דרגות נוכחיות (מונע קצף / מרכך) + TDS", owner: "customer", wait: 7 },
    { title: "התאמת דרגות Silitex + סיכום קצר ללקוח", owner: "me", wait: 3 },
    { title: "לקבל מ-Silitex TDS / SDS + נתוני יציבות (pH / היפוכלוריט)", owner: "silitex", wait: 7 },
    { title: "משלוח דגימות מעבדה ללקוח", owner: "silitex", wait: 10, stage: "sample" },
    { title: "תוצאות מעבדה — שבירת קצף, יציבות באחסון, תחושת ריכוך", owner: "customer", wait: 21 },
    ...tail] },
  agro: { he: "הגנת הצומח", steps: [
    { title: "פנייה לבעלים / מו\"פ — אילו מוצרים מנוסחים אצלם", owner: "me", wait: 0, stage: "contacted" },
    { title: "לקבל רשימת מוצרים מנוסחים + חומרי הרטבה / מונעי קצף בשימוש", owner: "customer", wait: 7 },
    { title: "התאמת דרגות Silitex + דף בדיקות מעבדה ללקוח", owner: "me", wait: 3 },
    { title: "לקבל מ-Silitex TDS / SDS + נתוני מתח פנים", owner: "silitex", wait: 7 },
    { title: "משלוח דגימות מעבדה ללקוח", owner: "silitex", wait: 10, stage: "sample" },
    { title: "תוצאות מעבדה — מתח פנים, קצף (CIPAC), יציבות", owner: "customer", wait: 21 },
    ...tail] },
  industrial: { he: "תעשייה כללית", steps: [
    { title: "שיחת פתיחה — מוצר בשימוש, כמויות, בעיות", owner: "me", wait: 0, stage: "contacted" },
    { title: "לקבל TDS של החומר הנוכחי", owner: "customer", wait: 7 },
    { title: "התאמת דרגת Silitex + סיכום ללקוח", owner: "me", wait: 3 },
    { title: "לקבל מ-Silitex TDS / SDS", owner: "silitex", wait: 7 },
    { title: "משלוח דגימה ללקוח", owner: "silitex", wait: 10, stage: "sample" },
    { title: "תוצאות בדיקה אצל הלקוח", owner: "customer", wait: 21 },
    ...tail] },
};
export function suggestPlaybook(industry: string): string {
  if (/cosmetic|personal care/i.test(industry)) return "cosmetics";
  if (/detergent|cleaning|household/i.test(industry)) return "household";
  if (/agri|agro|crop/i.test(industry)) return "agro";
  return "industrial";
}
