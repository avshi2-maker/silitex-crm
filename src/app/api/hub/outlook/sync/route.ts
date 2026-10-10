// route.ts (src/app/api/hub/outlook/sync/route.ts) · updated 10.10.2026 06:00 (Asia/Jerusalem) — manual "Sync now" from /hub (PIN-gated by middleware)
import { NextResponse } from "next/server";
import { syncNow } from "@/lib/outlook";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST() { try { return NextResponse.json({ ok: true, ...(await syncNow()) }); } catch (e: unknown) { return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "sync failed" }, { status: 500 }); } }
