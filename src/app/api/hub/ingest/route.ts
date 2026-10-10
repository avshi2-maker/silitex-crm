// route.ts (src/app/api/hub/ingest/route.ts) · updated 10.10.2026 05:50 (Asia/Jerusalem)
// Phase B entry point: POST { messages: [{ id, from, to, subject, at, body, conversationId? }] } with header x-hub-secret = HUB_SECRET.
// Writes straight to Supabase (service role): thread matched by conversationId → subject → new; message deduped by external_id. Outlook/Graph cron or a forwarding webhook calls this.
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { deptOf } from "@/config/hub";
export const runtime = "nodejs";
type In = { id: string; from: string; to: string; subject: string; at: string; body: string; conversationId?: string };
export async function POST(req: Request) {
  if (!process.env.HUB_SECRET || req.headers.get("x-hub-secret") !== process.env.HUB_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  const { messages } = (await req.json()) as { messages: In[] }; let added = 0, threads = 0;
  for (const m of messages || []) {
    if (!m.id || !m.subject) continue;
    const norm = m.subject.replace(/^(re|fw|fwd|r|i)\s*:\s*/gi, "").trim();
    let th = m.conversationId ? (await sb.from("threads").select("id").eq("conversation_id", m.conversationId).maybeSingle()).data : null;
    if (!th) th = (await sb.from("threads").select("id").ilike("subject", norm).maybeSingle()).data;
    const direction = /silitex\.it/i.test(m.from) ? "in" : "out";
    if (!th) { const id = "thr-" + m.id.slice(-12); const r = await sb.from("threads").upsert({ id, dept: deptOf(m.subject + " " + m.body.slice(0, 600)), subject: norm, topic: "other", refs: {}, owner: direction === "in" ? "sapirim" : "silitex", status: direction === "in" ? "waiting_us" : "waiting_silitex", created_at: m.at, last_at: m.at, conversation_id: m.conversationId || null }).select("id").single(); th = r.data; threads++; }
    if (!th) continue;
    const r = await sb.from("hub_messages").upsert({ id: "msg-" + m.id.slice(-16), thread_id: th.id, at: m.at, from: m.from, to: m.to, direction, body: m.body.slice(0, 20000), source: "graph", external_id: m.id }, { onConflict: "external_id", ignoreDuplicates: true });
    if (!r.error) { added++; await sb.from("threads").update({ last_at: m.at, status: direction === "in" ? "waiting_us" : "waiting_silitex" }).eq("id", th.id); }
  }
  return NextResponse.json({ ok: true, added, threads });
}
export async function GET() {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ threads: [], msgs: [], note: "no supabase" });
  const [t, m] = await Promise.all([sb.from("threads").select("*").order("last_at", { ascending: false }).limit(300), sb.from("hub_messages").select("*").order("at", { ascending: true }).limit(2000)]);
  return NextResponse.json({ threads: t.data || [], msgs: m.data || [] });
}
