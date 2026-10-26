// route.ts (src/app/api/brief/route.ts) · updated 26.10.2026 07:20 (Asia/Jerusalem) — v0.97.0 + GET delivery status · 16.10.2026 18:45 — + ru · 09.10.2026 10:30 (Asia/Jerusalem) — manual trigger from /brief page
import { NextResponse } from "next/server";
import { runDailyBrief } from "@/lib/brief";
export const runtime = "nodejs";
/** latest WhatsApp send / delivery report (from Meta's webhook) — the /brief page polls it after "send" */
export async function GET() {
  const { serviceClient } = await import("@/lib/server-data"); const c = serviceClient(); if (!c) return NextResponse.json({ status: null });
  const r = (await c.from("hub_tokens").select("last_result,updated_at").eq("id", "wa_status").maybeSingle()).data; return NextResponse.json({ status: r?.last_result || null, at: r?.updated_at || null });
}
export async function POST(req: Request) {
  try { const { send, lang } = await req.json().catch(() => ({ send: false, lang: "he" })); return NextResponse.json(await runDailyBrief(!!send, lang === "en" ? "en" : lang === "it" ? "it" : lang === "ru" ? "ru" : "he")); }
  catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "brief error" }, { status: 500 }); }
}
