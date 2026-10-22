// route.ts (src/app/api/scan/jobs/route.ts) · created 22.10.2026 08:30 (Asia/Jerusalem) — SERVER SCAN QUEUE API (owner): GET ?since=ISO → queue status (queued / running / done + failed in 24 h / cost / average real cost per scan) + finished results since `since` (the page applies them to the customers) and restarts a stalled chain · POST {items:[{lead_id,name,website,industry}]} → enqueue + start two worker chains · POST {action:"cancel"} → cancel what is still queued.
import { NextResponse } from "next/server";
import { enqueue, kick, status, cancelQueued } from "@/lib/scan-jobs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const u = new URL(req.url); const s = await status(u.searchParams.get("since") || undefined);
    if (s.queued > 0 && s.running.length === 0) await kick(u.origin); // chain stalled (e.g. a deploy) → restart
    return NextResponse.json(s);
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 500 }); }
}
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})); const origin = new URL(req.url).origin;
  try {
    if (b.action === "cancel") return NextResponse.json({ ok: true, cancelled: await cancelQueued() });
    const items = (Array.isArray(b.items) ? b.items : []).slice(0, 400).map((i: Record<string, unknown>) => ({ lead_id: String(i.lead_id || ""), name: String(i.name || ""), website: String(i.website || ""), industry: String(i.industry || "") }));
    const n = await enqueue(items); if (n) { await kick(origin); if (n > 1) await kick(origin); } // two chains in parallel
    return NextResponse.json({ ok: true, queued: n });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 500 }); }
}
