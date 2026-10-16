// sales.ts (src/config/sales.ts) · updated 16.10.2026 05:45 (Asia/Jerusalem)
// A–Z sales process: steps shown on /pitch + /team, follow-up delays per document, lead sources, offer defaults. Edit here only.
import type { DocKind } from "@/lib/types";
export const FOLLOWUP_DAYS: Record<DocKind, number> = { tds: 2, msds: 2, offer: 3, other: 3 };
export const LEAD_SOURCES = ["טופס אתר", "שיחה קרה", "הפניה", "תערוכה", "Silitex", "LinkedIn", "אחר"];
export const OFFER_DEFAULTS = { incoterm: "DAP Israel plant (direct from Italy)", payment: "Net 30", validity_days: 30, currency: "EUR" };
export const INCOTERMS = ["DAP Israel plant (direct from Italy)", "CIF Ashdod", "CIF Haifa", "FCA Italy (direct invoicing)", "DDP Israel (selective local stock)"];
export const SALES_PROCESS: { n: number; title: string; owner: string; text: string; tool: string }[] = [
  { n: 1, title: "Lead in", owner: "GM", text: "Web form, cold call, referral or exhibition. Mandatory: company, contact name, mobile.", tool: "/leads → + New customer · /request (public form)" },
  { n: 2, title: "Intake & qualification", owner: "GM", text: "Need, current supplier, volumes, regulatory requirements (Kosher/FDA/REACH), decision-maker.", tool: "Lead file → Intake form · Offset Sniper" },
  { n: 3, title: "Data sheets", owner: "Back-office", text: "TDS / MSDS pack for the matched SKUs sent by email or WhatsApp; follow-up task in 2 days.", tool: "Lead file → Documents → Send TDS pack" },
  { n: 4, title: "Sample", owner: "Back-office + chemist", text: "2–5 kg lab sample shipped from Silitex; lab slot booked; result logged (passed / failed).", tool: "Sample tracker" },
  { n: 5, title: "RFQ", owner: "GM", text: "Customer requests quantities and price; call / WhatsApp transcript pasted and summarised.", tool: "Transcript box → next action" },
  { n: 6, title: "Price offer", owner: "GM", text: "Offer in EUR per kg, incoterm, validity, payment terms — drafted by AI from the lead file, logged with amount.", tool: "Lead file → Documents → Price offer" },
  { n: 7, title: "Negotiation", owner: "GM + chemist", text: "Technical objections routed to Silitex lab / external chemist; commercial terms closed.", tool: "Pipeline · activity log" },
  { n: 8, title: "Order & delivery", owner: "Back-office", text: "P/O received, fresh batch shipped direct from Cologna Veneta (≥ 80 % shelf life on delivery); DAP / CIF via our forwarder or direct Silitex invoicing.", tool: "/logistics → Shipment data request (EN/IT) → forwarder → customs" },
  { n: 9, title: "Follow-up & re-order", owner: "Bot", text: "Daily WhatsApp brief, weekly review, satisfaction survey after first delivery, re-order reminder.", tool: "/brief · /schedule · /survey" },
];
