// sheet-mail.ts (src/lib/sheet-mail.ts) · created 25.10.2026 (Asia/Jerusalem)
// One HTML for the meeting-sheet mail — used by the server send (Resend) and by the 📧 Outlook draft (.eml).
import { mailDoc, textToHtml } from "@/lib/eml";
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function sheetMailHtml(body: string, head: string[], rows: unknown[][], inBody: boolean) {
  const table = inBody && head.length ? '<table dir="rtl" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;margin-top:14px"><thead><tr>' + head.map((h) => '<th style="border:1px solid #999;background:#f1f3f6;padding:4px 6px;text-align:right">' + esc(h) + "</th>").join("") + "</tr></thead><tbody>" + rows.map((r) => "<tr>" + r.map((c) => '<td style="border:1px solid #ccc;padding:4px 6px;vertical-align:top;text-align:right">' + esc(c).replace(/\n/g, "<br>") + "</td>").join("") + "</tr>").join("") + "</tbody></table>" : "";
  return mailDoc(textToHtml(body) + table);
}
