// route.ts (src/app/api/meetings/[id]/route.ts) · updated 16.10.2026 18:00 (Asia/Jerusalem) — owner only: GET one meeting (with transcript) + its actions · DELETE meeting
import { NextResponse } from "next/server";
import { getMeeting, deleteMeeting, NO_DB } from "@/lib/meetings";
export const runtime = "nodejs";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const r = await getMeeting(id);
  return r ? NextResponse.json(r) : NextResponse.json({ error: "not found · " + NO_DB }, { status: 404 });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; return NextResponse.json({ ok: await deleteMeeting(id) });
}
