// route.ts (src/app/api/sheet/email/route.ts) · updated 25.10.2026 (Asia/Jerusalem) — v0.92.1 full UTF-8 HTML document (Outlook Hebrew fix) · 08:25 + PDF attachment · created 06:45
// ✉ e-mail the 🖨️ meeting sheet (owner only): short Hebrew body + the full table in the mail (prints from Outlook) + Excel attachment, via Resend.
// Reply-To = avshi@sapirim.com so answers come back to Outlook. Nothing is stored on the server.
import { NextResponse } from "next/server";
import { sheetMailHtml } from "@/lib/sheet-mail";
export const runtime = "nodejs";
const isEmail = (s: string) => /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i.test(s);

export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY; if (!key) return NextResponse.json({ error: "email service not configured (RESEND_API_KEY)" }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const to = String(b.to || "").split(/[,;\s]+/).map((x: string) => x.trim()).filter(Boolean); const cc = String(b.cc || "").split(/[,;\s]+/).map((x: string) => x.trim()).filter(Boolean);
  if (!to.length || ![...to, ...cc].every(isEmail)) return NextResponse.json({ error: "כתובת מייל לא תקינה" }, { status: 400 });
  const subject = String(b.subject || "דף פגישה").slice(0, 200); const body = String(b.body || "").slice(0, 4000);
  const head: string[] = Array.isArray(b.head) ? b.head.map(String).slice(0, 20) : []; const rows: unknown[][] = Array.isArray(b.rows) ? b.rows.slice(0, 600) : [];
  const html = sheetMailHtml(body, head, rows, !!b.inBody);
  const attachments: { filename: string; content: string }[] = [];
  if (b.xlsx) attachments.push({ filename: String(b.filename || "meeting_sheet.xlsx").replace(/[^\w.\-]/g, "_"), content: String(b.xlsx) });
  if (b.pdf) attachments.push({ filename: String(b.pdfName || "meeting_sheet.pdf").replace(/[^\w.\-]/g, "_"), content: String(b.pdf) });
  const from = process.env.FORMS_FROM || "Silitex Israel <onboarding@resend.dev>";
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" }, body: JSON.stringify({ from, to, cc: cc.length ? cc : undefined, reply_to: "avshi@sapirim.com", subject, html, text: body, attachments }) });
  if (r.ok) return NextResponse.json({ sent: true });
  const err = await r.text(); const domain = /testing emails|verify a domain|not verified|own email/i.test(err);
  return NextResponse.json({ error: domain ? "שירות המייל (Resend) עדיין לא מאומת לשליחה לכתובת הזו" : err.slice(0, 300) }, { status: 502 });
}
