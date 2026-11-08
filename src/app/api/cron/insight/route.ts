// route.ts (src/app/api/cron/insight/route.ts) · created 08.11.2026 16:20 (Asia/Jerusalem) — v1.8.0
// 🕵️ Weekly customer insight run — Vercel cron, Sunday 05:30 Israel (vercel.json). Protected by CRON_SECRET.
// Re-analyses customers with correspondence / activity in the last 14 days whose report is older than 3 days (max 12 per run, ~$0.01–0.03 each).
// The /insight page then shows everyone ranked by "needs your attention".
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { analyse, candidates } from "@/lib/insight";
export const runtime = "nodejs"; export const maxDuration = 300;
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== "Bearer " + secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no database" }, { status: 500 });
  const ids = await candidates(sb, 14); const fresh = new Date(Date.now() - 3 * 864e5).toISOString();
  const recent = new Set(((await sb.from("lead_insights").select("lead_id").gte("created_at", fresh)).data || []).map((r) => r.lead_id as string));
  const todo = ids.filter((id) => !recent.has(id)).slice(0, 12); const out: string[] = []; let cost = 0; const t0 = Date.now();
  for (const id of todo) {
    if (Date.now() - t0 > 250000) { out.push("time limit — rest next week"); break; }
    try { const r = await analyse(sb, id, "weekly"); if ("error" in r) out.push(id + ": " + r.error); else { cost += r.usage.cost_usd; out.push(id + ": ok"); } } catch (e) { out.push(id + ": " + (e instanceof Error ? e.message : "error")); }
  }
  return NextResponse.json({ ok: true, analysed: out.length, cost_usd: Number(cost.toFixed(4)), results: out });
}
