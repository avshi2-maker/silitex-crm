// route.ts (src/app/api/hub/ingest/route.ts) · updated 10.10.2026 06:00 (Asia/Jerusalem)
// Generic entry point: POST { messages: [...] } with header x-hub-secret = HUB_SECRET (forwarding webhooks / other mailboxes). GET returns server threads+messages for the page to merge.
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { ingest, type InMsg } from "@/lib/hub-ingest";
export const runtime = "nodejs";
export async function POST(req: Request) {
  if (!process.env.HUB_SECRET || req.headers.get("x-hub-secret") !== process.env.HUB_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try { const { messages } = (await req.json()) as { messages: InMsg[] }; return NextResponse.json({ ok: true, ...(await ingest(messages)) }); }
  catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "ingest failed" }, { status: 500 }); }
}
export async function GET() {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ threads: [], msgs: [], note: "no supabase" });
  const [t, m] = await Promise.all([sb.from("threads").select("*").order("last_at", { ascending: false }).limit(300), sb.from("hub_messages").select("*").order("at", { ascending: true }).limit(2000)]);
  return NextResponse.json({ threads: t.data || [], msgs: m.data || [] });
}
