// pitch-data.ts (src/lib/pitch-data.ts) · created 08.11.2026 06:40 (Asia/Jerusalem) — v1.5.0
// Data for the 📧 pitch card: the customer's own e-mails (Hub / Outlook), the Silitex catalogue rows that answer them,
// and the catalogue PDFs to attach. Only real data — rows are picked by INCI / product name that appear in the mail.
import offsets from "@/data/offsets.json";
import { CAT26, catRows, PDFS, type CatRow } from "@/lib/catalog";
import type { HubMsg, Thread, OffsetRow } from "@/lib/types";

export type CustomerMail = { subject: string; from: string; at: string; body: string };
const QUOTE = /\n\s*(From:|-----\s*Original|On .{3,80} wrote:|מאת:|Sent from my)/i;
const clean = (b: string) => (b || "").split(QUOTE)[0].replace(/\n{3,}/g, "\n\n").trim();
const emailIn = (s: string) => ((s || "").match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [""])[0].toLowerCase();

/** customer's inbound mails (newest last) + our latest reply, for one lead */
export function mailsFor(leadId: string, threads: Thread[], msgs: HubMsg[]) {
  const ids = new Set(threads.filter((t) => t.refs?.lead_id === leadId).map((t) => t.id));
  const subj = (id: string) => threads.find((t) => t.id === id)?.subject || "";
  const mine = msgs.filter((m) => ids.has(m.thread_id)).sort((a, b) => a.at.localeCompare(b.at));
  const inbound: CustomerMail[] = mine.filter((m) => m.direction === "in" && m.from && !/sapirim\.com/i.test(m.from)).map((m) => ({ subject: subj(m.thread_id), from: emailIn(m.from), at: m.at, body: clean(m.body) }));
  const out = mine.filter((m) => m.direction === "out").pop();
  return { inbound, lastReply: out ? clean(out.body).slice(0, 1500) : "", lastReplyAt: out?.at || "" };
}

const OFF = (offsets as unknown as { rows: OffsetRow[] }).rows;
/** catalogue + equivalents rows whose INCI / product name appears in the text (max 25) */
export function rowsInText(text: string): { cat: CatRow[]; off: OffsetRow[] } {
  const t = " " + text.toLowerCase().replace(/\s+/g, " ") + " ";
  const has = (s: string) => { const x = (s || "").toLowerCase().trim(); return x.length >= 5 && t.includes(x); };
  const cat = CAT26.filter((r) => has(r.inci) || has(r.product)).slice(0, 25);
  const off = OFF.filter((r) => has(r.inci)).slice(0, 6);
  return { cat, off };
}
export const catLine = (r: CatRow) => [r.code, r.product, "INCI: " + (r.inci || "—"), r.type, r.active_pct && "active " + r.active_pct, r.description, r.application, r.compliance, "catalogue: " + r.pdf].filter(Boolean).join(" | ");
export const offLine = (r: OffsetRow) => [r.category_id, r.family, "INCI: " + r.inci, "Silitex: " + r.silitex_product, "Kosher: " + r.kosher, "FDA: " + r.fda].join(" | ");

/** catalogue PDFs for a set of product names (+ sector fallback from the industry) */
export function pdfsFor(names: string[], industry = ""): string[] {
  const set = new Set<string>();
  names.forEach((n) => catRows(n).forEach((r) => r.pdf && set.add(r.pdf)));
  if (!set.size) {
    const sector = /cosmetic|personal|טיפוח|קוסמטי/i.test(industry) ? "Cosmetics" : /detergent|clean|ניקוי/i.test(industry) ? "Detergency" : /paint|coating|צבע/i.test(industry) ? "Paint & Coating" : /water|מים/i.test(industry) ? "Water Treatment" : "";
    if (sector && PDFS[sector]) set.add(PDFS[sector].split("/").pop() as string);
  }
  return Array.from(set);
}
export const pdfUrl = (file: string) => "/catalogues/" + file;
