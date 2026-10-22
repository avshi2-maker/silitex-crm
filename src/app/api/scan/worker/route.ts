// route.ts (src/app/api/scan/worker/route.ts) · created 22.10.2026 08:30 (Asia/Jerusalem) — SERVER SCAN WORKER (owner cookie, also sent by the server itself): answers at once, then scans ONE queued customer after the reply and starts the next worker → a chain that runs with the browser closed.
import { NextResponse, after } from "next/server";
import { processOne, kick } from "@/lib/scan-jobs";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  after(async () => { try { const more = await processOne(); if (more) await kick(origin); } catch (e) { console.warn("scan worker", e instanceof Error ? e.message : e); } });
  return NextResponse.json({ ok: true }, { status: 202 });
}
