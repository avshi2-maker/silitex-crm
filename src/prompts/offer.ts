// offer.ts (src/prompts/offer.ts) · updated 09.10.2026 18:30 (Asia/Jerusalem) — price offer draft from lead + offer lines
import type { Lead } from "@/lib/types";
import { OWNER } from "@/config/app";
export type OfferLine = { sku: string; kg: number; eur_kg: number };
export type OfferInput = { lines: OfferLine[]; incoterm: string; payment: string; valid_until: string; notes: string };
export const offerTotal = (o: OfferInput) => o.lines.reduce((a, l) => a + l.kg * l.eur_kg, 0);
export function offerContext(lead: Lead, o: OfferInput): string {
  return "לקוח: " + lead.name + " · איש קשר: " + (lead.contact_name || lead.contact_role) + " · " + lead.industry + "\nצורך: " + lead.use_case + "\nמחליף: " + (lead.competitor_offset || "—") +
    "\n\nשורות הצעה:\n" + o.lines.map((l) => "- " + l.sku + ": " + l.kg + " kg × " + l.eur_kg + " EUR/kg = " + (l.kg * l.eur_kg).toFixed(0) + " EUR").join("\n") +
    "\nסה\"כ: " + offerTotal(o).toFixed(0) + " EUR\nתנאי אספקה: " + o.incoterm + "\nתשלום: " + o.payment + "\nתוקף עד: " + o.valid_until + "\nהערות: " + (o.notes || "—") + "\nמוכר: " + OWNER.name + " · " + OWNER.phone + " · Silitex Israel";
}
export const OFFER_PROMPT = "כתוב הצעת מחיר רשמית (מייל) ללקוח על בסיס השורות שלמעלה. מבנה: שורת נושא · פנייה אישית · הקשר קצר (הצורך והמוצר שמוחלף) · טבלת מחיר בטקסט (SKU, כמות, EUR/kg, סה\"כ) · תנאים (אספקה, תשלום, תוקף) · מה כלול (TDS/MSDS, תמיכה טכנית, מלאי מקומי) · קריאה לאישור הזמנה. עד 220 מילים. אל תמציא מפרטים טכניים.";
