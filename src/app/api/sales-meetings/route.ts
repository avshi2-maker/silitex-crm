// route.ts (src/app/api/sales-meetings/route.ts) · created 27.10.2026 04:55 (Asia/Jerusalem) — v1.0.0 — owner only (not a partner path)
// GET list of 🤝 sales meetings & calls · POST save one (after it was applied to the CRM in the browser).
import { NextResponse } from "next/server";
import { listSalesMeetings, createSalesMeeting, NO_DB } from "@/lib/sales-meetings";
export const runtime = "nodejs";
export async function GET() { const r = await listSalesMeetings(); return r ? NextResponse.json({ meetings: r }) : NextResponse.json({ error: NO_DB }, { status: 503 }); }
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!b.held_at || !b.summary) return NextResponse.json({ error: "date and summary required" }, { status: 400 });
  const r = await createSalesMeeting({ held_at: String(b.held_at), kind: String(b.kind || "physical"), with_who: String(b.with_who || "").slice(0, 200), title: String(b.title || "").slice(0, 200), notes: String(b.notes || "").slice(0, 100000), photo_count: Number(b.photo_count) || 0, summary: b.summary, applied: b.applied || {}, usage: b.usage || null });
  return "error" in r ? NextResponse.json(r, { status: 500 }) : NextResponse.json(r);
}
