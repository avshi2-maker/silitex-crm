// route.ts (src/app/api/hub/outlook/status/route.ts) · updated 10.10.2026 06:00 (Asia/Jerusalem) — connection status for the /hub banner
import { NextResponse } from "next/server";
import { status, configured, DOMAIN } from "@/lib/outlook";
export const runtime = "nodejs";
export async function GET() { const s = await status(); return NextResponse.json({ configured: configured(), connected: !!s?.account, account: s?.account || null, last_sync: s?.last_sync || null, last_result: s?.last_result || null, domain: DOMAIN() }); }
