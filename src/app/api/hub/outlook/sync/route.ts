// route.ts (src/app/api/hub/outlook/sync/route.ts) · updated 19.10.2026 12:30 (Asia/Jerusalem) — + {days} deep sync · 10.10.2026 06:00 — manual "Sync now" from /hub (PIN-gated by middleware)
import { NextResponse } from "next/server";
import { syncNow } from "@/lib/outlook";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(req: Request) { const b = await req.json().catch(() => ({})); const days = Math.min(90, Math.max(0, Number(b.days) || 0)); try { return NextResponse.json({ ok: true, ...(await syncNow(days)) }); } catch (e: unknown) { return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "sync failed" }, { status: 500 }); } }
