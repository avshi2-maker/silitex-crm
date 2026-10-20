// route.ts (src/app/api/forms/route.ts) · updated 20.10.2026 18:40 (Asia/Jerusalem) — FREE MATCH REPORT: after the reply, automatic WhatsApp ping + website scan + report draft (lib/match-auto), max MATCH_AUTO_DAILY runs a day; GET (list of requests) now needs the owner PIN cookie — the path is public for POST only · 09.10.2026 18:30 — POST customer form → email (Resend) + Supabase; GET lists submissions (service role)
import { NextResponse, after } from "next/server";
import { sendEmail, storeSubmission, type Submission } from "@/lib/forms";
import { serviceClient } from "@/lib/server-data";
import { runAuto } from "@/lib/match-auto";
import { cookies } from "next/headers";
import { GATE_COOKIE, gateToken } from "@/lib/gate";
export const runtime = "nodejs";
export const maxDuration = 300;
async function autoAllowed(): Promise<boolean> {
  const max = Number(process.env.MATCH_AUTO_DAILY || 20); const sb = serviceClient(); if (!sb) return false;
  const since = new Date(Date.now() - 864e5).toISOString();
  const r = await sb.from("form_submissions").select("id", { count: "exact", head: true }).eq("kind", "match").gte("created_at", since);
  return (r.count ?? 0) <= max;
}
export async function POST(req: Request) {
  try {
    const s = (await req.json()) as Submission;
    if (!s.kind || !s.company || !s.email || !s.name) return NextResponse.json({ error: "company, name, email, kind required" }, { status: 400 });
    if (s.kind !== "survey" && !s.phone) return NextResponse.json({ error: "mobile required" }, { status: 400 });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email)) return NextResponse.json({ error: "invalid email" }, { status: 400 });
    if (s.fields && typeof s.fields === "object") delete (s.fields as Record<string, unknown>).auto;
    const [mail, id] = await Promise.all([sendEmail(s), storeSubmission(s)]);
    if (s.kind === "match" && id) after(async () => { if (await autoAllowed()) await runAuto(id, s); });
    return NextResponse.json({ ok: mail.sent || !!id, mail, stored: !!id });
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "form error" }, { status: 500 }); }
}
export async function GET() {
  const pin = process.env.ACCESS_PIN;
  if (pin && (await cookies()).get(GATE_COOKIE)?.value !== (await gateToken(pin))) return NextResponse.json({ error: "locked" }, { status: 401 });
  const sb = serviceClient(); if (!sb) return NextResponse.json({ items: [], note: "no supabase" });
  const r = await sb.from("form_submissions").select("*").order("created_at", { ascending: false }).limit(200);
  return NextResponse.json({ items: r.data || [] });
}
