// hub.ts (src/prompts/hub.ts) · updated 10.10.2026 05:50 (Asia/Jerusalem) — thread summary + structured extraction + reply draft
import { threadText } from "@/lib/hub";
import { TOPICS } from "@/config/hub";
import type { Thread, HubMsg } from "@/lib/types";
export const hubContext = (th: Thread, msgs: HubMsg[]) => threadText(th, msgs);
export const HUB_SUMMARY = "Summarise this correspondence thread with Silitex for the CRM: 1) one-paragraph status, 2) what Silitex owes us / what we owe them, 3) risks (dates, missing documents). Then on the LAST line exactly: FIELDS: topic=<one of " + TOPICS.join("|") + "> | status=<open|waiting_silitex|waiting_us|closed> | due=<yyyy-mm-dd or -> | po=<or -> | sku=<or -> | lot=<or -> | invoice=<or -> | next=<one-line next action>";
export const hubReply = (lang: "en" | "it") => lang === "it" ? "Scrivi la risposta successiva a Silitex (oggetto + corpo, max 150 parole, tono professionale), chiedendo esattamente ciò che manca e confermando ciò che è stato concordato. Firma Avshi Sapir, Sapirim – Silitex Israel." : "Write our next reply to Silitex (subject + body, max 150 words, professional), asking exactly for what is missing and confirming what was agreed. Sign Avshi Sapir, Sapirim – Silitex Israel.";
export function parseFields(text: string): Partial<{ topic: string; status: string; due: string; po: string; sku: string; lot: string; invoice: string; next: string }> {
  const m = text.match(/FIELDS:\s*(.+)$/im); if (!m) return {};
  const out: Record<string, string> = {};
  m[1].split("|").forEach((kv) => { const [k, ...r] = kv.split("="); const v = r.join("=").trim(); if (k && v && v !== "-") out[k.trim()] = v; });
  return out;
}
