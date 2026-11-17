// route.ts (src/app/api/hub-todo/route.ts) · created 17.11.2026 17:55 (Asia/Jerusalem) — v1.18.0 ✅ To Do ⇄ tasks + 📅 tasks → Outlook calendar
// POST with header x-hub-wa-key = HUB_WA_KEY (the Sapirim Hub cron, every 30 min) → A. Microsoft To Do ⇄ Silitex / Hub tasks · B. tasks → calendar.
// Uses the CRM's existing Microsoft connection (refresh token) — no sign-in, no Microsoft login attempts.
import { NextResponse } from "next/server";
import { syncTodo, syncCalendarTasks } from "@/lib/outlook-todo";
export const runtime = "nodejs"; export const dynamic = "force-dynamic"; export const maxDuration = 120;
export async function POST(req: Request) {
  const k = process.env.HUB_WA_KEY;
  if (!k || req.headers.get("x-hub-wa-key") !== k) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const todo = await syncTodo().catch((e) => ({ error: e instanceof Error ? e.message : "todo failed" }));
  const calendar = await syncCalendarTasks().catch((e) => ({ error: e instanceof Error ? e.message : "calendar failed" }));
  return NextResponse.json({ ok: true, todo, calendar });
}
