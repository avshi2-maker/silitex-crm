// route.ts (src/app/api/partner/support/route.ts) · updated 13.10.2026 08:15 (Asia/Jerusalem) — "not in our data" → human support: stores partner_feedback, emails Avshi (Resend) AND pings his WhatsApp (Meta Cloud API / Twilio / webhook per env). Partner or owner-test.
import { NextResponse } from "next/server";
import { storeFeedback, emailFeedback } from "@/lib/partner-feedback";
import { sendWhatsApp } from "@/lib/whatsapp";
import { logPartner } from "@/lib/partner-usage";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const partner = req.headers.get("x-partner") || "owner-test";
  const { question, page, lang, note } = await req.json().catch(() => ({}));
  if (!question || String(question).trim().length < 3) return NextResponse.json({ error: "question required" }, { status: 400 });
  const msg = "[NOT IN DATA] " + String(question).slice(0, 1500) + (note ? "\n\nNote: " + String(note).slice(0, 1000) : "");
  const f = { partner, page: String(page || "/ask"), topic: "support request", message: msg, lang };
  const id = await storeFeedback(f); const mail = await emailFeedback(f);
  const wa = await sendWhatsApp("🆘 Silitex partner " + partner + " needs data:\n" + String(question).slice(0, 600) + "\n→ reply within 24h · " + (process.env.NEXT_PUBLIC_SITE_URL || "https://silitex.marble-art.co.il") + "/partners");
  logPartner({ partner, path: f.page, kind: "view", question: "[support] " + String(question).slice(0, 300) });
  return NextResponse.json({ ok: true, id, mailed: mail.sent, whatsapp: wa.sent, provider: wa.provider });
}
