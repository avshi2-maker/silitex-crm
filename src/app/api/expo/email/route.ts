// route.ts (src/app/api/expo/email/route.ts) · updated 18.10.2026 12:00 (Asia/Jerusalem) — EXPO: e-mail the session report (HTML + CSV attachment) to the Silitex user's own address via Resend. Nothing is stored on the server; partner + owner only (middleware gate). Sender = EXPO_FROM || FORMS_FROM (needs a domain verified in Resend to reach outside addresses).
import { NextResponse } from "next/server";
import { renderReport } from "@/lib/expo/report";
import { meetingsCsv } from "@/lib/expo/util";
import { logPartner } from "@/lib/partner-usage";
import type { ExpoMeeting, ExpoProfile } from "@/lib/expo/store";
export const runtime = "nodejs";
const isEmail = (s: string) => /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i.test(s);
export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY; if (!key) return NextResponse.json({ error: "email service not configured", code: "no_key" }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const to = String(b.to || "").trim(); if (!isEmail(to)) return NextResponse.json({ error: "invalid e-mail address", code: "bad_to" }, { status: 400 });
  const ms = (Array.isArray(b.meetings) ? b.meetings : []).slice(0, 400) as ExpoMeeting[];
  if (!ms.length) return NextResponse.json({ error: "no meetings in this period", code: "empty" }, { status: 400 });
  const p = (b.profile || {}) as ExpoProfile; const lang = String(b.lang || "en"); const period = String(b.period || "").slice(0, 60);
  const { subject, html, text } = renderReport(ms.map((m) => ({ ...m, products: Array.isArray(m.products) ? m.products : [] })), p, lang, period);
  const csv = meetingsCsv(ms.map((m) => ({ ...m, products: Array.isArray(m.products) ? m.products : [] })));
  const from = process.env.EXPO_FROM || process.env.FORMS_FROM || "Silitex Expo <onboarding@resend.dev>";
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html, text, attachments: [{ filename: "Silitex_Expo_" + new Date().toISOString().slice(0, 10).split("-").reverse().join("-") + ".csv", content: Buffer.from(csv, "utf8").toString("base64") }] }) });
  const partner = req.headers.get("x-partner");
  if (partner) logPartner({ partner, path: "/api/expo/email", kind: "view", question: "expo report e-mail · " + ms.length + " meetings", lang });
  if (r.ok) return NextResponse.json({ sent: true });
  const err = await r.text();
  const domain = /testing emails|verify a domain|not verified|own email/i.test(err);
  return NextResponse.json({ error: domain ? "sender domain not verified in Resend yet" : err.slice(0, 300), code: domain ? "domain" : "resend" }, { status: 502 });
}
