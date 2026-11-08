// mail-text.ts (src/lib/mail-text.ts) · created 08.11.2026 07:10 (Asia/Jerusalem) — v1.6.0
// AI mail text → Outlook draft parts: "Subject: …" first line split off, HTML body in the right direction (Hebrew = RTL, else LTR).
import { mailDoc, textToHtml } from "./eml";
export function splitMail(text: string, fallback: string): { subject: string; body: string; html: string } {
  const lines = text.split("\n"); const sm = lines[0].match(/^\s*(Subject|נושא)\s*:\s*(.*)$/i);
  const subject = sm ? sm[2].trim() : fallback; const body = (sm ? lines.slice(1) : lines).join("\n").trim();
  const doc = mailDoc(textToHtml(body));
  const html = /[֐-׿]/.test(body) ? doc : doc.replace(/dir="rtl"/g, 'dir="ltr"').replace('lang="he"', 'lang="en"').replace("direction:rtl;text-align:right", "direction:ltr;text-align:left");
  return { subject, body, html };
}
/** website without tracking junk (?srsltid=… from Google) */
export const cleanUrl = (u?: string) => (u || "").replace(/[?#].*$/, "").replace(/\/$/, "");
