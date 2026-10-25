// route.ts (src/app/api/sheet/email/route.ts) · created 25.10.2026 06:45 (Asia/Jerusalem)
// ✉ e-mail the 🖨️ meeting sheet (owner only): short Hebrew body + the full table in the mail (prints from Outlook) + Excel attachment, via Resend.
// Reply-To = avshi@sapirim.com so answers come back to Outlook. Nothing is stored on the server.
import { NextResponse } from "next/server";
export const runtime = "nodejs";
const isEmail = (s: string) => /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i.test(s);
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY; if (!key) return NextResponse.json({ error: "email service not configured (RESEND_API_KEY)" }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const to = String(b.to || "").split(/[,;\s]+/).map((x: string) => x.trim()).filter(Boolean); const cc = String(b.cc || "").split(/[,;\s]+/).map((x: string) => x.trim()).filter(Boolean);
  if (!to.length || ![...to, ...cc].every(isEmail)) return NextResponse.json({ error: "כתובת מייל לא תקינה" }, { status: 400 });
  const subject = String(b.subject || "דף פגישה").slice(0, 200); const body = String(b.body || "").slice(0, 4000);
  const head: string[] = Array.isArray(b.head) ? b.head.map(String).slice(0, 20) : []; const rows: unknown[][] = Array.isArray(b.rows) ? b.rows.slice(0, 600) : [];
  const table = b.inBody && head.length ? '<table dir="rtl" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px;margin-top:14px"><thead><tr>' + head.map((h) => '<th style="border:1px solid #999;background:#f1f3f6;padding:4px 6px;text-align:right">' + esc(h) + "</th>").join("") + "</tr></thead><tbody>" + rows.map((r) => "<tr>" + (r as unknown[]).map((c) => '<td style="border:1px solid #ccc;padding:4px 6px;vertical-align:top;text-align:right">' + esc(c) + "</td>").join("") + "</tr>").join("") + "</tbody></table>" : "";
  const html = '<div dir="rtl" style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">' + esc(body).replace(/\n/g, "<br>") + table + "</div>";
  const attachments = b.xlsx ? [{ filename: String(b.filename || "meeting_sheet.xlsx").replace(/[^\w.\-]/g, "_"), content: String(b.xlsx) }] : [];
  const from = process.env.FORMS_FROM || "Silitex Israel <onboarding@resend.dev>";
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" }, body: JSON.stringify({ from, to, cc: cc.length ? cc : undefined, reply_to: "avshi@sapirim.com", subject, html, text: body, attachments }) });
  if (r.ok) return NextResponse.json({ sent: true });
  const err = await r.text(); const domain = /testing emails|verify a domain|not verified|own email/i.test(err);
  return NextResponse.json({ error: domain ? "שירות המייל (Resend) עדיין לא מאומת לשליחה לכתובת הזו" : err.slice(0, 300) }, { status: 502 });
}
