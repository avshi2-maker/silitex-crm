// route.ts (src/app/api/silitex-brief/route.ts) · created 23.10.2026 08:45 (Asia/Jerusalem) — owner only: everything open between Sapirim and Silitex for the 📞 quick brief when Federica / Eleonora call — the open-questions register (both directions) + open action items from the Teams meetings (meetings mtg-…).
import { NextResponse } from "next/server";
import { listFq } from "@/lib/fq";
import { serviceClient } from "@/lib/server-data";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const fq = await listFq(); if ("error" in fq) return NextResponse.json({ error: fq.error }, { status: 503 });
  const sb = serviceClient(); let mtg: { owner: string; task: string; due: string | null; created_at: string }[] = [];
  if (sb) { const r = await sb.from("meeting_actions").select("owner,task,due,status,created_at,meeting_id").like("meeting_id", "mtg-%").not("status", "in", "(done,closed)").order("created_at"); mtg = (r.data || []).map((x) => ({ owner: x.owner, task: x.task, due: x.due, created_at: x.created_at })); }
  return NextResponse.json({ items: fq.items, mtg });
}
