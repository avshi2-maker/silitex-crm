// route.ts (src/app/api/meetings/route.ts) · updated 16.10.2026 18:00 (Asia/Jerusalem) — owner only (not a partner path): GET list + all actions · POST create meeting {held_at,title,participants,tags,source,transcript,summary,usage,task_ids}
import { NextResponse } from "next/server";
import { listMeetings, createMeeting, NO_DB } from "@/lib/meetings";
export const runtime = "nodejs";
export async function GET() {
  const r = await listMeetings(); if (!r) return NextResponse.json({ error: NO_DB }, { status: 503 });
  return NextResponse.json(r);
}
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!b.title || !b.held_at || !b.summary) return NextResponse.json({ error: "title, date and summary required" }, { status: 400 });
  const r = await createMeeting({ held_at: String(b.held_at), title: String(b.title).slice(0, 200), participants: String(b.participants || ""), tags: Array.isArray(b.tags) ? b.tags.map(String) : [], source: String(b.source || "Teams"), transcript: String(b.transcript || ""), summary: b.summary, usage: b.usage, task_ids: b.task_ids });
  return "error" in r ? NextResponse.json(r, { status: 500 }) : NextResponse.json(r);
}
