// route.ts (src/app/api/meetings/actions/route.ts) · updated 16.10.2026 18:10 (Asia/Jerusalem) — owner only: PATCH {id, status: open|done} or {id, task_id} (link to CRM task)
import { NextResponse } from "next/server";
import { setActionStatus, setActionTask } from "@/lib/meetings";
export const runtime = "nodejs";
export async function PATCH(req: Request) {
  const { id, status, task_id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (task_id) return NextResponse.json({ ok: await setActionTask(String(id), String(task_id)) });
  if (!["open", "done"].includes(status)) return NextResponse.json({ error: "status open|done" }, { status: 400 });
  return NextResponse.json({ ok: await setActionStatus(String(id), status) });
}
