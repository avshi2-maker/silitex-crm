// orders.ts (src/lib/orders.ts) · created 16.11.2026 17:10 (Asia/Jerusalem) — v1.13.0 📦 Orders — shared texts (client + server)
// customerMail = short Hebrew mail to the customer (view → confirm → sign → mail back) · silitexMail = English order to Silitex purchasing
// bankText = Hebrew message for the bank's internal message box · orderText = plain A–Z for the export bar.
import { fmtDate } from "./format";
import { OWNER } from "@/config/app";
import { SILITEX_LEGAL, DEFAULT_SHIP_DOCS, orderStage } from "@/config/orders";
import type { Order } from "./types";

const eur = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const lineTotal = (l: Order["lines"][number]) => (l.price ? l.price * (l.kg || 0) : 0);
export const orderTotal = (o: Pick<Order, "lines">) => o.lines.reduce((a, l) => a + lineTotal(l), 0);
export const kindHe = (k: string) => (k === "product" ? "הזמנת מוצר" : "הזמנת דוגמה");
const ref = (o: Order, v = 1) => (o.project_id ? "[#" + o.project_id + " · v" + v + "] " : "");
const lineEn = (l: Order["lines"][number], i: number) => (i + 1) + ". " + [l.code, l.product].filter(Boolean).join("  ") + "  ·  " + (l.qty || 0) + " x " + (l.pack || "pack") + " = " + (l.kg || 0) + " kg" + (l.price ? "  ·  EUR " + eur(l.price) + "/kg  ·  EUR " + eur(lineTotal(l)) : "");
const lineHe = (l: Order["lines"][number]) => "• " + [l.product, l.code && "(" + l.code + ")"].filter(Boolean).join(" ") + " — " + (l.qty || 0) + " × " + (l.pack || "אריזה") + " (" + (l.kg || 0) + " ק״ג)";

/** short Hebrew mail that goes with the printed / PDF form — the customer confirms, signs and mails it back */
export function customerMail(o: Order, version = 1): { to: string; subject: string; body: string } {
  const name = o.customer.contact || o.lead_name;
  const body = ["שלום " + name + ",", "",
    "מצורפת " + kindHe(o.kind) + " מספר " + o.id + (o.project_id ? " (פרויקט #" + o.project_id + ")" : "") + ":",
    ...o.lines.map(lineHe), "",
    "נא לעבור על הפרטים, לאשר בחתימה ולהחזיר אליי במייל.",
    "מיד עם קבלת האישור החתום נעביר את ההזמנה ל-Silitex באיטליה.", "",
    "בברכה,", OWNER.name, OWNER.brand, OWNER.phone + " · " + OWNER.email].join("\n");
  return { to: o.customer.email || "", subject: ref(o, version) + kindHe(o.kind) + " " + o.id + " — לאישור וחתימה", body };
}
/** the real order to Silitex purchasing (English) */
export function silitexMail(o: Order, signedAt?: string, version = 1): { subject: string; body: string } {
  const sample = o.kind === "sample"; const total = orderTotal(o); const sh = o.shipping;
  const body = ["Dear Isabel,", "",
    sample ? "Please find below our sample order. The customer has confirmed and signed the sample request" + (signedAt ? " on " + fmtDate(signedAt) : "") + " (copy attached)." : "Please find our purchase order below.", "",
    "Order no.: " + o.id + (o.project_id ? "  ·  Project ref: #" + o.project_id : "") + "  ·  Date: " + fmtDate(new Date()),
    ...(o.customer_po ? ["Customer PO: " + o.customer_po] : []),
    "Customer: " + o.lead_name, "",
    ...o.lines.map(lineEn),
    ...(total ? ["Total: EUR " + eur(total) + "  ·  " + o.incoterm] : [sample ? "Free sample  ·  " + o.incoterm : o.incoterm]),
    ...(o.payment_terms ? ["Payment terms: " + o.payment_terms] : []), "",
    "Shipping",
    "- Consignee: " + (sh.consignee || "Avshalom Sapir - Sapirim") + ", " + (sh.address || "[delivery address]") + ", Israel, " + OWNER.phone,
    "- Collection: our courier " + (sh.courier || "[DHL / FedEx]") + (sh.account ? ", account " + sh.account : "") + " — please send dimensions and gross weight when ready",
    ...(sh.dg ? ["- Goods: " + sh.dg] : []),
    "- Documents: " + (sh.docs || DEFAULT_SHIP_DOCS),
    "- Shelf life: at least 80% remaining on shipping date",
    "- Please mark " + o.id + (o.project_id ? " / #" + o.project_id : "") + " on every package and document",
    ...(sh.notes ? ["- " + sh.notes] : []), "",
    sample ? "Please confirm the sample order and the ready date." : "Please confirm the order with your order number, ready date and proforma invoice with bank details.", "",
    "Best regards,", "Avshi Sapir", "Sapirim – Silitex Israel"].join("\n");
  return { subject: ref(o, version) + (sample ? "Sample order " : "Purchase Order ") + o.id + " — " + o.lines.map((l) => l.product).filter(Boolean).join(", "), body };
}
/** Hebrew text for the bank's internal message box (international transfer to Silitex) */
export function bankText(o: Order): string {
  const b = o.bank;
  return ["שלום,", "נא לבצע העברה בנקאית בינלאומית מחשבוני:",
    "סכום: " + (b.amount || "[סכום]") + " " + (b.currency || "EUR"),
    "מוטב: " + SILITEX_LEGAL.name + ", " + SILITEX_LEGAL.address,
    "בנק: " + (b.bank || "[שם הבנק]") + " · IBAN: " + (b.iban || "[IBAN]") + " · SWIFT: " + (b.swift || "[SWIFT]"),
    "עמלות: OUR (על חשבוני)",
    "פרטי ההעברה למוטב: Proforma " + (b.proforma || "[מספר]") + " · " + o.id + (o.project_id ? " · " + o.project_id : ""),
    "נא לשלוח לי אישור SWIFT (MT103) לאחר הביצוע.",
    "תודה, אבשלום ספיר - ספירים · " + OWNER.phone].join("\n");
}
export function orderText(o: Order): string {
  return [kindHe(o.kind) + " " + o.id + (o.project_id ? " · #" + o.project_id : "") + " · " + o.lead_name,
    "שלב: " + orderStage(o.kind, o.stage).he + " · נפתח " + fmtDate(o.created_at),
    "", ...o.lines.map(lineHe), orderTotal(o) ? "סה״כ: EUR " + eur(orderTotal(o)) : "", "",
    ...(o.history || []).map((h) => fmtDate(h.at) + " — " + h.text)].join("\n");
}
export const fmtEur = eur;
