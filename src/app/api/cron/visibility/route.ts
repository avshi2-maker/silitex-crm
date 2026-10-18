// route.ts (src/app/api/cron/visibility/route.ts) · updated 18.10.2026 19:00 (Asia/Jerusalem) — monthly (vercel.json, 1st of the month): ask every target question to Claude + ChatGPT with web search and log whether Sapirim / Silitex show up. Protected by CRON_SECRET. ~24 checks, well under $1.
import { NextResponse } from "next/server";
import { runAll } from "@/lib/visibility/run";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== "Bearer " + secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await runAll();
  return NextResponse.json({ ok: true, checks: rows.length, sapirim_cited: rows.filter((r) => r.sapirim_cited).length, errors: rows.filter((r) => r.error).length, cost_usd: rows.reduce((s, r) => s + r.cost_usd, 0) });
}
