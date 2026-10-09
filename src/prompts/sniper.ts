// sniper.ts (src/prompts/sniper.ts) · updated 09.10.2026 10:05 (Asia/Jerusalem) — replacement quote draft from sniper results
import type { SniperHit } from "@/lib/types";
export function sniperContext(customer: string, rows: { line: string; hits: SniperHit[] }[]): string {
  return "לקוח: " + (customer || "—") + "\n\nרשימת רכש נוכחית → מקבילות Silitex:\n" +
    rows.map((r) => "- " + r.line + " → " + (r.hits.length ? r.hits.map((h) => h.product + " (" + h.category + ")").join(" / ") : "לא נמצאה מקבילה")).join("\n");
}
export const SNIPER_PROMPT = "כתוב טיוטת הצעת החלפה בעברית: טבלה 'מוצר נוכחי → מוצר Silitex → יתרון', פסקת ערך (מלאי מקומי, אספקה מהירה, אישורים), ושורות שלא נמצאה להן מקבילה — בקש מהלקוח דף נתונים. סיים בהצעת דגימה. עד 250 מילים.";
