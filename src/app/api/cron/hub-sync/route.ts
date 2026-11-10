// route.ts (src/app/api/cron/hub-sync/route.ts) · updated 10.11.2026 14:00 (Asia/Jerusalem) — v1.9.8 after the sync: 📁 auto-open projects for new RFQs · 10.10.2026 06:00 — every 15 min (vercel.json): Outlook → Hub. Skips quietly when Outlook is not connected.
import { NextResponse } from "next/server";
import { syncNow, status } from "@/lib/outlook";
import { sweepSafe } from "@/lib/projects-server";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== "Bearer " + secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const s = await status(); if (!s?.account) return NextResponse.json({ ok: false, skipped: "Outlook not connected", projects: await sweepSafe() });
  try { const r = await syncNow(); return NextResponse.json({ ok: true, ...r, projects: await sweepSafe() }); } catch (e: unknown) { return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "sync failed" }); }
}
