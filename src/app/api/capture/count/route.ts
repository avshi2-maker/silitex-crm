// route.ts (src/app/api/capture/count/route.ts) · updated 19.10.2026 09:30 (Asia/Jerusalem) — FIELD INBOX NUDGE: owner only, GET → how many phone uploads (cards, photos, voice, video, notes) wait in Cloudinary unprocessed + how many meetings + newest time. Polled by the menu once a minute.
import { NextResponse } from "next/server";
import { searchInbox } from "@/lib/cloudinary";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const items = await searchInbox();
    if (!items) return NextResponse.json({ count: 0, meetings: 0, latest: "", configured: false });
    const meetings = new Set(items.map((a) => a.context.meeting || a.public_id)).size;
    const latest = items.reduce((m, a) => (a.created_at > m ? a.created_at : m), "");
    return NextResponse.json({ count: items.length, meetings, latest, configured: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return NextResponse.json({ count: 0, meetings: 0, latest: "", error: e instanceof Error ? e.message : "error" }); }
}
