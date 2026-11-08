// route.ts (src/app/api/insight/route.ts) · created 08.11.2026 16:20 (Asia/Jerusalem) — v1.8.0
// 🕵️ Customer insight agent (owner only — behind the PIN; partners blocked).
// GET ?lead=ID → latest report · GET ?board=1 → latest report per customer + customers worth analysing (correspondence / activity in 30 days)
// POST {lead_id} → new report (AI) — returns the row + token usage for the meter.
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { analyse, candidates } from "@/lib/insight";
import type { InsightRow } from "@/lib/insight-types";
export const runtime = "nodejs"; export const maxDuration = 90; export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (req.headers.get("x-partner")) return NextResponse.json({ error: "owner only" }, { status: 403 });
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no database" }, { status: 500 });
  const u = new URL(req.url); const lead = u.searchParams.get("lead");
  if (lead) return NextResponse.json({ row: ((await sb.from("lead_insights").select("*").eq("lead_id", lead).order("created_at", { ascending: false }).limit(1)).data || [])[0] || null });
  const rows = ((await sb.from("lead_insights").select("*").order("created_at", { ascending: false }).limit(600)).data || []) as InsightRow[];
  const latest = new Map<string, InsightRow>(); for (const r of rows) if (!latest.has(r.lead_id)) latest.set(r.lead_id, r);
  const cand = await candidates(sb);
  const ids = Array.from(new Set([...latest.keys(), ...cand]));
  const names = ids.length ? ((await sb.from("leads").select("id,name,stage,industry").in("id", ids)).data || []) : [];
  return NextResponse.json({ rows: Array.from(latest.values()), candidates: cand, leads: names });
}

export async function POST(req: Request) {
  if (req.headers.get("x-partner")) return NextResponse.json({ error: "owner only" }, { status: 403 });
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no database" }, { status: 500 });
  const b = await req.json().catch(() => ({})) as { lead_id?: string };
  if (!b.lead_id) return NextResponse.json({ error: "lead_id required" }, { status: 400 });
  try { const r = await analyse(sb, b.lead_id); return "error" in r ? NextResponse.json({ error: r.error }, { status: 400 }) : NextResponse.json({ ok: true, row: r.row, usage: r.usage }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "ai error" }, { status: 500 }); }
}
