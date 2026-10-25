// campaign.ts (src/prompts/campaign.ts) · updated 25.10.2026 05:30 (Asia/Jerusalem) — truth rules: no local-stock claim, "מקביל ל-", certificates per product, no food targeting, Outlook-clean text, Sapirim signature · 09.10.2026 09:40 — industry × channel promo
import type { Lead, Product } from "@/lib/types";
import { CHANNELS, channelHe } from "@/config/channels";
export function campaignContext(indHe: string, angle: string, targets: Lead[], prods: Product[]): string {
  return "תעשייה: " + indHe + "\nזווית: " + angle + "\nלקוחות יעד: " + targets.map((t) => t.name).join(", ") +
    "\n\nמוצרים:\n" + prods.map((p) => "- " + p.product_name + " | " + p.application_field + " | " + p.key_features + " | " + p.food_grade_certifications + " | מקביל ל: " + p.dow_corning_offset_benchmark).join("\n");
}
/** non-negotiable truth rules (Avshi, 25.10.2026) */
const HONEST = [
  "כללי אמת — חובה:",
  "1. אין מלאי בישראל: לעולם אל תכתוב 'מלאי מקומי', 'מלאי ישראלי' או 'אספקה מיידית'. כתוב: 'אספקה ישירה מהמפעל באיטליה לפי הזמנה — חומר טרי, עם חיי מדף מלאים'.",
  "2. כתוב 'מקביל ל-' (בתפקוד), לעולם לא 'מחליף' או 'תחליף ישיר'. סיים בשורה: 'שמות המותגים שייכים לבעליהם. ההתאמה היא לפי תפקוד ומאושרת סופית בבדיקה אצלכם.'",
  "3. תעודות (FDA / E900 / כשרות) — רק כ'לפי המוצר, נשלח עם המפרט הטכני'. לא בשורת הנושא, לא כהבטחה כללית.",
  "4. אל תפנה ליצרני מזון. דרגות מזון (SILIFOOD) — רק 'ליצרנים שהלקוחות שלהם דורשים אישור מזון'.",
  "5. הצעה לפעולה: מפרט טכני + דוגמה לבדיקה במעבדה של הלקוח, או שיחת ייעוץ קצרה.",
  "6. טקסט נקי להדבקה ב-Outlook: בלי כוכביות, בלי טבלאות markdown, בלי מקום שמור כמו [כתובת מייל]. רשימות עם •.",
  "7. חתימה בדיוק: אבשי ספיר / ספירים — Silitex ישראל / 050-5231042 / avshi@sapirim.com. לעולם לא Marble Art.",
].join("\n");
export function campaignPrompt(indHe: string, channel: string): string {
  const rules = CHANNELS.find((c) => c.key === channel)?.rules || "";
  return "צור " + channelHe(channel) + " שיווקי בעברית לתעשיית " + indHe + ". ערוץ: " + channel + ". " + rules + " הדגש מוצרים ספציפיים והמקבילות שלהם.\n" + HONEST;
}
