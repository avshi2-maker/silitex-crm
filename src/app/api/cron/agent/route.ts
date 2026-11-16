// route.ts (src/app/api/cron/agent/route.ts) · created 16.11.2026 19:15 (Asia/Jerusalem) — v1.14.0 🤖 back-office agent every 30 min (vercel.json, 5 min after the Outlook sync).
// Reads only the mails the Hub sync already brought in — never logs in to Outlook itself. Creates cards + draft orders; sends nothing to customers. One WhatsApp ping to Avshi when new cards wait.
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { runAgent } from "@/lib/agent";
export const runtime = "nodejs"; export const maxDuration = 300;
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== "Bearer " + secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = serviceClient(); if (!sb) return NextResponse.json({ ok: false, error: "no supabase" });
  try { return NextResponse.json({ ok: true, ...(await runAgent(sb, { notify: true })) }); } catch (e: unknown) { return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "agent failed" }); }
}
