// route.ts (src/app/api/cron/daily-brief/route.ts) · updated 09.10.2026 10:05 (Asia/Jerusalem) — Vercel cron 07:00 Israel (vercel.json). Protected by CRON_SECRET.
import { NextResponse } from "next/server";
import { runDailyBrief } from "@/lib/brief";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== "Bearer " + secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try { const r = await runDailyBrief(true); return NextResponse.json({ ok: true, source: r.source, delivery: r.delivery, usage: r.usage }); }
  catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "cron error" }, { status: 500 }); }
}
