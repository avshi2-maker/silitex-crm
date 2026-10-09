// sales.ts (src/config/sales.ts) · updated 09.10.2026 18:30 (Asia/Jerusalem)
// A–Z sales process: steps shown on /pitch + /team, follow-up delays per document, lead sources, offer defaults. Edit here only.
import type { DocKind } from "@/lib/types";
export const FOLLOWUP_DAYS: Record<DocKind, number> = { tds: 2, msds: 2, offer: 3, other: 3 };
export const LEAD_SOURCES = ["טופס אתר", "שיחה קרה", "הפניה", "תערוכה", "Silitex", "LinkedIn", "אחר"];
export const OFFER_DEFAULTS = { incoterm: "DDP Israel (local stock)", payment: "Net 30", validity_days: 30, currency: "EUR" };
export const INCOTERMS = ["DDP Israel (local stock)", "FCA Italy (direct invoicing)", "CIF Ashdod"];
export const SALES_PROCESS: { n: number; title: string; owner: string; text: string; tool: string }[] = [
  { n: 1, title: "Lead in", owner: "GM", text: "Web form, cold call, referral or exhibition. Mandatory: company, contact name, mobile.", tool: "/leads → + New customer · /request (public form)" },
  { n: 2, title: "Intake & qualification", owner: "GM", text: "Need, current supplier, volumes, regulatory requirements (Kosher/FDA/REACH), decision-maker.", tool: "Lead file → Intake form · Offset Sniper" },
  { n: 3, title: "Data sheets", owner: "Back-office", text: "TDS / MSDS pack for the matched SKUs sent by email or WhatsApp; follow-up task in 2 days.", tool: "Lead file → Documents → Send TDS pack" },
  { n: 4, title: "Sample", owner: "Back-office + chemist", text: "2–5 kg lab sample from local stock; lab slot booked; result logged (passed / failed).", tool: "Sample tracker" },
  { n: 5, title: "RFQ", owner: "GM", text: "Customer requests quantities and price; call / WhatsApp transcript pasted and summarised.", tool: "Transcript box → next action" },
  { n: 6, title: "Price offer", owner: "GM", text: "Offer in EUR per kg, incoterm, validity, payment terms — drafted by AI from the lead file, logged with amount.", tool: "Lead file → Documents → Price offer" },
  { n: 7, title: "Negotiation", owner: "GM + chemist", text: "Technical objections routed to Silitex lab / external chemist; commercial terms closed.", tool: "Pipeline · activity log" },
  { n: 8, title: "Order & delivery", owner: "Back-office", text: "P/O received, DDP from Tel Aviv stock or direct Silitex invoicing; delivery in 2 days.", tool: "Stage → Won · principal report" },
  { n: 9, title: "Follow-up & re-order", owner: "Bot", text: "Daily WhatsApp brief, weekly review, satisfaction survey after first delivery, re-order reminder.", tool: "/brief · /schedule · /survey" },
];
