// pitch.ts (src/prompts/pitch.ts) · updated 08.11.2026 06:40 (Asia/Jerusalem) — v1.5.0 two modes: (1) REPLY to the customer's own e-mail (answers their exact request, no prices, no substitutes they did not approve) · (2) FIRST CONTACT from the website scan, in Avshi's approved template (08.11.2026 file) · 09.10.2026 19:30 — first-contact pitch for one lead
import { intakeSummary } from "@/lib/intake";
import { scanOf, scanText } from "@/lib/scan";
import type { Lead, Product } from "@/lib/types";
import type { CustomerMail } from "@/lib/pitch-data";
import { catLine, offLine, rowsInText } from "@/lib/pitch-data";

const SIGN_HE = "בברכה,\nאבשי ספיר\nספירים — Silitex ישראל\n050-5231042 · avshi@sapirim.com";
const SIGN_EN = "Kind regards,\nAvshi Sapir\nSapirim — Silitex Israel\n+972-50-5231042 · avshi@sapirim.com";
const files = (att: string[]) => (att.length ? att.join(", ") : "none");

/* ── mode 1: first contact from the website scan (Avshi's template) ── */
export function webContext(lead: Lead, matches: Product[], contact: string, att: string[]): string {
  const sc = scanOf(lead);
  return "לקוח: " + lead.name + "\nאיש קשר: " + (contact || "—") + "\nתעשייה: " + lead.industry + " — " + (lead.sub_industry || "") + "\nצורך: " + (lead.use_case || "—") + "\nהערות: " + (lead.notes || "—") +
    "\n\nטופס בירור טכני:\n" + intakeSummary(lead) +
    (sc ? "\n\nסריקת אתר הלקוח:\n" + scanText(lead.name, sc) : "") +
    "\n\nמוצרי Silitex לפי תעשייה:\n" + matches.map((p) => "- " + p.product_name + " | " + p.application_field + " | " + p.active_content_pct + " | " + p.food_grade_certifications + " | מקביל ל: " + p.dow_corning_offset_benchmark).join("\n") +
    "\n\nקבצים מצורפים: " + files(att);
}
export function webPrompt(lead: Lead, contact: string): string {
  return "כתוב מייל פנייה ראשונה בעברית ל-" + lead.name + ", בדיוק במבנה הזה (התבנית שאבשי אישר):\n" +
    "Subject: פתרונות סיליקון איטלקיים ל<תחום המוצרים שלהם> | Silitex\n\n" +
    "שלום " + (contact || "רב") + ",\n\nאני פונה אליכם מטעם ספירים, מפיץ Silitex האיטלקית בישראל.\n\n" +
    "ראיתי את <מה שהם מייצרים — מתוך סריקת האתר> שלכם ב-" + lead.name + ". לקו <...> שלכם יכולים להתאים <...> מבית Silitex:\n" +
    "• <שם מוצר Silitex> – <תיאור קצר מהנתונים> (<אחוז פעיל אם ידוע>), <תאימות/אישור אם ידוע>, מחליף <מקבילה מתחרה מהנתונים>\n(2–3 שורות כאלה)\n\n" +
    "היתרון שלנו: אספקה מהירה, תמיכה טכנית בעברית.\nאשמח לשלוח דגימות לבדיקה ולשוחח על התאמה מדויקת לפורמולות שלכם.\n<אם יש קבצים מצורפים: שורה 'מצורפים: <שמות הקבצים>'>\n\n" + SIGN_HE +
    "\n\nכללים: רק מוצרים ומקבילות שמופיעים בנתונים — אם אין מקבילה, השמט את 'מחליף'. בלי 'מלאי מקומי', בלי מחירים, בלי אחוזי חיסכון. אל תמליץ על D4/D5 (Cyclopentasiloxane) — מגמת 2027 היא החלפתם. טקסט רגיל בלי Markdown (בלי ** ובלי #).";
}

/* ── mode 2: reply to the customer's own e-mail (their request decides the offer) ── */
export function replyContext(lead: Lead, mails: CustomerMail[], lastReply: string, att: string[]): string {
  const req = mails.slice(-2);
  const text = req.map((m) => m.subject + "\n" + m.body).join("\n");
  const { cat, off } = rowsInText(text);
  return "CUSTOMER: " + lead.name + " (" + (lead.industry || "") + ")\n\nCUSTOMER MAIL" + (req.length > 1 ? "S" : "") + ":\n" +
    req.map((m) => "Subject: " + m.subject + "\nFrom: " + m.from + "\n" + m.body.slice(0, 4000)).join("\n---\n") +
    (lastReply ? "\n\nOUR PREVIOUS REPLY (already sent — do not repeat it):\n" + lastReply : "") +
    "\n\nSILITEX DATA (2026 catalogues + equivalents table — the ONLY product facts you may use):\n" +
    (cat.length || off.length ? [...cat.map(catLine), ...off.map(offLine)].join("\n") : "NO MATCHING SILITEX ROW FOUND for the requested product.") +
    "\n\nATTACHED FILES: " + files(att);
}
export function replyPrompt(): string {
  return "Write Avshi Sapir's reply to the CUSTOMER MAIL. Write it in the SAME language as the customer's mail.\n" +
    "Rules:\n1. Answer every request in the mail, point by point, in their order.\n" +
    "2. Products: name only Silitex products found in SILITEX DATA (name, INCI, what the data says). If the exact grade they asked for (e.g. a specific viscosity) is not listed by code, say it is within the Silitex range and the exact grade code and specification will be confirmed by the manufacturer. Never invent codes, specifications, measurement temperatures, certificates or stock.\n" +
    "3. Price, currency, VAT, delivery cost, MOQ, smallest pack, sample size or charge, stock, lead time, shelf life, quotation validity, CoA: give NO numbers — say a formal quotation will follow after confirmation with Silitex (Italy); supply is direct from Italy per order.\n" +
    "4. If the customer said no substitute is approved, do not offer any substitute as a replacement; an alternative may only be mentioned separately, clearly 'for your review only'.\n" +
    "5. Confirm their conditions in one line (e.g. no order or charges without their written approval).\n" +
    "6. Documents: list the ATTACHED FILES by name; for any requested document not attached (TDS, SDS, CoA) say it will follow from the manufacturer.\n" +
    "7. Manufacturer: Silitex S.r.l. (Italy). Sapirim is the distributor in Israel.\n" +
    "8. Plain text, no Markdown. First line exactly: 'Subject: Re: <customer subject>'. Up to 250 words.\nEnd with this signature (translate only if the mail is not in English):\n" + SIGN_EN;
}
