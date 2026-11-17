// route.ts (src/app/api/hub-calendar/route.ts) · created 17.11.2026 17:20 (Asia/Jerusalem) — v1.16.0 📅 Outlook calendar for the Sapirim Hub
// GET ?days=1 with header x-hub-wa-key = HUB_WA_KEY → today's Outlook events (Israel time), read-only, through the CRM's existing Microsoft
// connection (refresh token — no new sign-in, no Microsoft login attempts). {granted:false} when the calendar permission is missing.
import { NextResponse } from "next/server";
import { dayEvents } from "@/lib/outlook-calendar";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const k = process.env.HUB_WA_KEY;
  if (!k || req.headers.get("x-hub-wa-key") !== k) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const days = Number(new URL(req.url).searchParams.get("days") || 1) || 1;
  try { const ev = await dayEvents(days); return NextResponse.json(ev === null ? { granted: false, events: [] } : { granted: true, events: ev }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "calendar error" }, { status: 502 }); }
}
