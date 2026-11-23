// orders.ts (src/config/orders.ts) · created 16.11.2026 17:05 (Asia/Jerusalem) — v1.13.0 📦 Orders: stages per kind + fixed texts. Edit wording / steps here only.
// SAMPLE: the customer first confirms + signs our sample order (Hebrew form, mailed back) — only then the real order goes to Silitex.
// PRODUCT: customer PO → order to Silitex → proforma → 🏦 bank transfer (task) → shipped → received → Sapirim invoice.
export type OrderKind = "sample" | "product";
export type OrderStage = { id: string; he: string; icon: string; hint: string };
export const SAMPLE_STAGES: OrderStage[] = [
  { id: "draft", he: "טיוטה", icon: "📝", hint: "ממלאים את הטופס" },
  { id: "customer_sent", he: "נשלח ללקוח לחתימה", icon: "📨", hint: "ממתין לטופס חתום" },
  { id: "signed", he: "חתום ע״י הלקוח", icon: "✍", hint: "אפשר לשלוח ל-Silitex" },
  { id: "silitex_sent", he: "נשלח ל-Silitex", icon: "🇮🇹", hint: "ממתין לאישור ומועד מוכנות" },
  { id: "confirmed", he: "אושר ע״י Silitex", icon: "✅", hint: "מתאמים איסוף בשליח" },
  { id: "shipped", he: "נאסף / בדרך", icon: "🚚", hint: "מספר מעקב" },
  { id: "received", he: "התקבל אצל הלקוח", icon: "📬", hint: "לבקש משוב על הבדיקה" },
  { id: "closed", he: "סגור", icon: "🏁", hint: "הסתיים" },
];
export const PRODUCT_STAGES: OrderStage[] = [
  { id: "draft", he: "טיוטה", icon: "📝", hint: "ממלאים את הטופס + PO של הלקוח" },
  { id: "silitex_sent", he: "נשלח ל-Silitex", icon: "🇮🇹", hint: "ממתין לאישור + Proforma" },
  { id: "confirmed", he: "אושר + Proforma", icon: "📄", hint: "למלא סכום ופרטי בנק" },
  { id: "pay", he: "להעביר תשלום", icon: "🏦", hint: "משימה: הוראת העברה לבנק" },
  { id: "paid", he: "שולם", icon: "💶", hint: "אסמכתת SWIFT נשלחה ל-Silitex" },
  { id: "shipped", he: "נאסף / בדרך", icon: "🚚", hint: "שליח · AWB · מעקב" },
  { id: "received", he: "התקבל", icon: "📬", hint: "CoA · SDS · שחרור מכס" },
  { id: "invoiced", he: "חשבונית ספירים", icon: "🧾", hint: "מספר הפרויקט באסמכתא" },
  { id: "closed", he: "סגור", icon: "🏁", hint: "הסתיים" },
];
export const stagesOf = (k: string) => (k === "product" ? PRODUCT_STAGES : SAMPLE_STAGES);
export const orderStage = (k: string, id: string) => stagesOf(k).find((s) => s.id === id) || stagesOf(k)[0];
export const stageNo = (k: string, id: string) => Math.max(0, stagesOf(k).findIndex((s) => s.id === id));
/** a sample order may go to Silitex only after the customer's signed copy is back */
export const canSendSilitex = (k: string, stage: string) => k === "product" || stageNo(k, stage) >= stageNo("sample", "signed");
export const ORDER_ENDED = ["closed"];
/** no movement for this many days → ⏰ on the list */
export const ORDER_STALL_DAYS = 3;
export const SAMPLE_TERMS = [
  "הדוגמה מסופקת ללא תשלום, לצורך בדיקה והערכה במעבדת הלקוח בלבד, ואינה מיועדת לשימוש מסחרי או למכירה.",
  "הדוגמה נשלחת ישירות מ-Silitex S.r.l. באיטליה; מועד האספקה יימסר לאחר אישור Silitex.",
  "בקשת הדוגמה אינה מחייבת את הלקוח בהזמנה מסחרית.",
  "נשמח לקבל משוב ותוצאות בדיקה, כדי להתאים את המוצר והמחיר להמשך.",
];
/** default terms printed on the form when the order has none of its own (v1.24.0: editable per order on the order page) */
export const defaultTerms = (kind: "sample" | "product"): string[] => (kind === "sample" ? SAMPLE_TERMS : []);
export const DEFAULT_SHIP_DOCS = "Commercial invoice · Packing list · Batch CoA · SDS · EUR.1";
export const SILITEX_LEGAL = { name: "SILITEX S.r.l.", address: "Viale dell'Industria 34, 37044 Cologna Veneta (VR), Italy", vat: "IT02644870236" };
