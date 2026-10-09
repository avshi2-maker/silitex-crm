// route.ts (src/app/api/brief/route.ts) · updated 09.10.2026 10:30 (Asia/Jerusalem) — manual trigger from /brief page
import { NextResponse } from "next/server";
import { runDailyBrief } from "@/lib/brief";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try { const { send, lang } = await req.json().catch(() => ({ send: false, lang: "he" })); return NextResponse.json(await runDailyBrief(!!send, lang === "en" ? "en" : "he")); }
  catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "brief error" }, { status: 500 }); }
}
