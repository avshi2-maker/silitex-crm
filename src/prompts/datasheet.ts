// datasheet.ts (src/prompts/datasheet.ts) · updated 09.10.2026 18:30 (Asia/Jerusalem) — cover note for a TDS/MSDS pack
import type { Lead, Product } from "@/lib/types";
export function datasheetContext(lead: Lead, products: Product[]): string {
  return "לקוח: " + lead.name + " · " + (lead.contact_name || lead.contact_role) + "\nצורך: " + lead.use_case + "\n\nמוצרים בחבילה:\n" + products.map((p) => "- " + p.product_name + " | " + p.category_sector + " | " + p.application_field + " | " + p.key_features + " | מחליף: " + p.dow_corning_offset_benchmark + " | " + p.food_grade_certifications).join("\n");
}
export function datasheetPrompt(kind: "tds" | "msds"): string {
  return "כתוב מכתב נלווה קצר (מייל / WhatsApp) לשליחת חבילת " + (kind === "tds" ? "דפי נתונים טכניים (TDS)" : "גיליונות בטיחות (MSDS)") + " ללקוח. כלול: שורת נושא, משפט הקשר לצורך שלו, רשימת המוצרים המצורפים עם שורה אחת למה כל אחד רלוונטי, הצעה לדגימה / שיחה עם הכימאי, חתימה. עד 150 מילים.";
}
