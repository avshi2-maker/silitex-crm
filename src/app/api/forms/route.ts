// route.ts (src/app/api/forms/route.ts) · updated 09.10.2026 13:20 (Asia/Jerusalem) — POST customer form → email (Resend) + Supabase; GET lists submissions (service role)
import { NextResponse } from "next/server";
import { sendEmail, storeSubmission, type Submission } from "@/lib/forms";
import { serviceClient } from "@/lib/server-data";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const s = (await req.json()) as Submission;
    if (!s.kind || !s.company || !s.email) return NextResponse.json({ error: "company, email, kind required" }, { status: 400 });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email)) return NextResponse.json({ error: "invalid email" }, { status: 400 });
    const [mail, stored] = await Promise.all([sendEmail(s), storeSubmission(s)]);
    return NextResponse.json({ ok: mail.sent || stored, mail, stored });
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "form error" }, { status: 500 }); }
}
export async function GET() {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ items: [], note: "no supabase" });
  const r = await sb.from("form_submissions").select("*").order("created_at", { ascending: false }).limit(200);
  return NextResponse.json({ items: r.data || [] });
}
