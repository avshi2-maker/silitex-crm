// pitch.ts (src/prompts/pitch.ts) · updated 09.10.2026 19:30 (Asia/Jerusalem) — first-contact pitch for one lead
import { intakeSummary } from "@/lib/intake";
import type { Lead, Product } from "@/lib/types";
import { fmtUsd } from "@/lib/format";
export function pitchContext(lead: Lead, matches: Product[]): string {
  return "לקוח: " + lead.name + "\nתעשייה: " + lead.industry + " — " + lead.sub_industry + "\nצורך: " + lead.use_case + "\nהתאמה: " + lead.product_match +
    "\nפוטנציאל: " + lead.volume_tons + " טון / " + fmtUsd(lead.value_usd) + "\nאיש קשר: " + (lead.contact_name || lead.contact_role) + " (" + lead.department + ")\nהערות: " + (lead.notes || "—") + "\n\nטופס בירור טכני:\n" + intakeSummary(lead) +
    "\n\nמוצרי Silitex מתאימים:\n" + matches.map((p) => "- " + p.product_name + " | " + p.category_sector + " | " + p.application_field + " | " + p.active_content_pct + " | " + p.food_grade_certifications + " | מחליף: " + p.dow_corning_offset_benchmark).join("\n");
}
export function pitchPrompt(lead: Lead): string {
  return "כתוב מייל פנייה ראשונה בעברית ל-" + (lead.contact_name || lead.contact_role) + " ב-" + lead.name + ". כלול: הבנת הצורך, 2–3 מוצרי Silitex מומלצים (עם המקבילה שהם מחליפים), יתרון מפיץ מקומי, הצעת דגימה חינם וקריאה לפגישה. עד 180 מילים + שורת נושא.";
}
