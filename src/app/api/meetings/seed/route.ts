// route.ts (src/app/api/meetings/seed/route.ts) · updated 16.10.2026 18:00 (Asia/Jerusalem) — owner only: POST → loads meeting #1 (Teams 16/10/2026: transcript + reviewed summary) if not yet stored. Data stays server-side.
import { NextResponse } from "next/server";
import { createMeeting, getMeeting } from "@/lib/meetings";
import { M20261016 } from "@/data/meetings/m20261016";
export const runtime = "nodejs";
export async function POST() {
  if (await getMeeting(M20261016.mid)) return NextResponse.json({ ok: true, id: M20261016.mid, existed: true });
  const r = await createMeeting(M20261016);
  return "error" in r ? NextResponse.json(r, { status: 500 }) : NextResponse.json({ ok: true, ...r });
}
