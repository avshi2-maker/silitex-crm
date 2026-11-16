// route.ts (src/app/api/agent/route.ts) · created 16.11.2026 19:15 (Asia/Jerusalem) — v1.14.0 🤖 back-office agent cards (behind the PIN gate)
// GET ?status=pending|done|all → cards (newest first) · POST → ▶ run now (no WhatsApp ping) · PATCH {id, status?, action?: index, done?: bool, task?: index}
//   status done / dismissed closes the card; action + done marks one action done; task = index → a real 🔔 task in My day from that action
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { runAgent, type AgentAction } from "@/lib/agent";
import { todayIso } from "@/lib/format";
export const runtime = "nodejs"; export const dynamic = "force-dynamic"; export const maxDuration = 300;
export async function GET(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ items: [] });
  const st = new URL(req.url).searchParams.get("status") || "pending";
  let q = sb.from("agent_items").select("*").order("created_at", { ascending: false }).limit(200); if (st !== "all") q = q.eq("status", st);
  const r = await q; return NextResponse.json({ items: r.data || [], error: r.error?.message });
}
export async function POST() {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  try { return NextResponse.json({ ok: true, ...(await runAgent(sb)) }); } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "agent failed" }, { status: 500 }); }
}
export async function PATCH(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  const b = (await req.json().catch(() => ({}))) as { id?: string; status?: string; action?: number; done?: boolean; task?: number };
  const cur = (await sb.from("agent_items").select("*").eq("id", b.id || "").maybeSingle()).data; if (!cur) return NextResponse.json({ error: "not found" }, { status: 404 });
  const actions = [...((cur.actions || []) as AgentAction[])]; const patch: Record<string, unknown> = {};
  if (typeof b.task === "number" && actions[b.task]) {
    const a = actions[b.task]; await sb.from("tasks").upsert({ id: "task-agt-" + cur.id + "-" + b.task, lead_id: cur.lead_id || "silitex", lead_name: cur.lead_name || "Silitex", title: "🤖 " + a.title, due: a.due && /^\d{4}-\d{2}-\d{2}$/.test(a.due) ? a.due : todayIso(), cadence: "once", done: false, kind: "agent" });
    actions[b.task] = { ...a, done: true }; patch.actions = actions;
  }
  if (typeof b.action === "number" && actions[b.action]) { actions[b.action] = { ...actions[b.action], done: b.done !== false }; patch.actions = actions; }
  if (b.status && ["pending", "done", "dismissed"].includes(b.status)) { patch.status = b.status; patch.done_at = b.status === "pending" ? null : new Date().toISOString(); }
  else if (patch.actions && actions.length && actions.every((a) => a.done)) { patch.status = "done"; patch.done_at = new Date().toISOString(); }
  const r = await sb.from("agent_items").update(patch).eq("id", cur.id).select("*").single();
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });
  if (patch.status && cur.lead_id) await sb.from("activities").insert({ id: "act-agt-" + cur.id + "-" + Date.now().toString(36), lead_id: cur.lead_id, at: new Date().toISOString(), kind: "agent", text: "🤖 " + (patch.status === "done" ? "✓ " : "✕ ") + (cur.summary || cur.subject) });
  return NextResponse.json({ item: r.data });
}
