// route.ts (src/app/api/agent/alerts/route.ts) · created 16.11.2026 20:20 (Asia/Jerusalem) — v1.14.2 🚨 security events not yet reviewed (behind the PIN gate)
// GET → {count, items} for the red nudge on every page · POST {test: true} → a 🧪 test event (to see the alarm work) · POST {id, note} → reviewed + closed (a note of what you checked is REQUIRED, min 5 characters)
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET() {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ count: 0, items: [] });
  const r = await sb.from("agent_items").select("id,sender,subject,summary,msg_at,thread_id,lead_name,intent,created_at").eq("security", true).is("ack_at", null).order("created_at", { ascending: false }).limit(50);
  return NextResponse.json({ count: (r.data || []).length, items: r.data || [] });
}
export async function POST(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  const b = (await req.json().catch(() => ({}))) as { id?: string; note?: string; test?: boolean };
  if (b.test) { const id = "agt-test-" + Date.now().toString(36); await sb.from("agent_items").insert({ id, msg_id: id, lead_name: "", subject: "🧪 בדיקת אזעקה", sender: "Test <test@example.com>", msg_at: new Date().toISOString(), intent: "spam", urgency: "high", summary: "🧪 אירוע בדיקה — כך נראית אזעקת אבטחה. בדוק וסגור.", actions: [], status: "blocked", security: true }); return NextResponse.json({ ok: true, id }); }
  const note = String(b.note || "").trim(); if (note.length < 5) return NextResponse.json({ error: "כתוב מה בדקת (לפחות 5 תווים)" }, { status: 400 });
  const r = await sb.from("agent_items").update({ ack_at: new Date().toISOString(), ack_note: note.slice(0, 300) }).eq("id", b.id || "").eq("security", true).select("id").single();
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 404 });
  return NextResponse.json({ ok: true });
}
