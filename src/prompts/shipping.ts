// shipping.ts (src/prompts/shipping.ts) · updated 10.10.2026 05:30 (Asia/Jerusalem) — cover email to Silitex export/logistics with the data request
import { requestText } from "@/lib/shipping";
import type { Shipment } from "@/lib/types";
export function shippingContext(s: Shipment): string { return requestText(s); }
export function shippingPrompt(lang: "en" | "it"): string {
  return lang === "it"
    ? "Scrivi un'email professionale (oggetto + corpo, max 180 parole) all'ufficio export/logistica di Silitex S.r.l. che accompagna la RICHIESTA DATI SPEDIZIONE sopra: cosa serve, entro quando (chiedi 3 giorni lavorativi), perché (spedizioniere italiano + dogana israeliana: ADR/IMDG/IATA da SDS §14, EUR.1 per dazio 0%, ISPM-15 pallet), e un elenco puntato dei soli campi mancanti marcati [SILITEX]. Firma: Avshi Sapir, Sapirim – Silitex Israel. Non inventare dati."
    : "Write a professional email (subject + body, max 180 words) to Silitex S.r.l. export/logistics accompanying the SHIPMENT DATA REQUEST above: what is needed, by when (ask for 3 working days), why (Italian forwarder + Israeli customs: ADR/IMDG/IATA from SDS §14, EUR.1 for 0% duty, ISPM-15 pallets), and a bullet list of ONLY the empty fields marked [SILITEX]. Sign: Avshi Sapir, Sapirim – Silitex Israel. Do not invent data.";
}
