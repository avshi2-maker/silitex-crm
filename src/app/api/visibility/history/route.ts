// route.ts (src/app/api/visibility/history/route.ts) · updated 18.10.2026 19:00 (Asia/Jerusalem) — AI VISIBILITY BOT: GET → saved checks (newest first) + whether the Supabase table is set up
import { NextResponse } from "next/server";
import { history } from "@/lib/visibility/run";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json(await history()); }
