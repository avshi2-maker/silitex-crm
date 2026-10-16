// route.ts (src/app/api/meetings/search/route.ts) · updated 16.10.2026 18:00 (Asia/Jerusalem) — owner only: GET ?q= → best-matching passages across all meeting transcripts + summaries (BM25, lib/rag)
import { NextResponse } from "next/server";
import { searchMeetings, NO_DB } from "@/lib/meetings";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") || ""; if (q.trim().length < 2) return NextResponse.json({ hits: [] });
  const hits = await searchMeetings(q, 8); return hits ? NextResponse.json({ hits }) : NextResponse.json({ error: NO_DB }, { status: 503 });
}
