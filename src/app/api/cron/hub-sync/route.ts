// route.ts (src/app/api/cron/hub-sync/route.ts) · updated 10.10.2026 06:00 (Asia/Jerusalem) — every 15 min (vercel.json): Outlook → Hub. Skips quietly when Outlook is not connected.
import { NextResponse } from "next/server";
import { syncNow, status } from "@/lib/outlook";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== "Bearer " + secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const s = await status(); if (!s?.account) return NextResponse.json({ ok: false, skipped: "Outlook not connected" });
  try { return NextResponse.json({ ok: true, ...(await syncNow()) }); } catch (e: unknown) { return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "sync failed" }); }
}
