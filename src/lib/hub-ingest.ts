// hub-ingest.ts (src/lib/hub-ingest.ts) · updated 10.10.2026 06:00 (Asia/Jerusalem) — server only
// Shared ingest: normalised messages → Supabase threads + hub_messages (dedup by external_id, thread by conversationId → subject). Used by /api/hub/ingest and the Outlook sync.
import { serviceClient } from "./server-data";
import { deptOf } from "@/config/hub";
export type InMsg = { id: string; from: string; to: string; subject: string; at: string; body: string; conversationId?: string };
export async function ingest(messages: InMsg[]): Promise<{ added: number; threads: number }> {
  const sb = serviceClient(); if (!sb) throw new Error("no supabase"); let added = 0, threads = 0;
  for (const m of messages || []) {
    if (!m.id || !m.subject) continue;
    const norm = m.subject.replace(/^(re|fw|fwd|r|i|tr|aw)\s*:\s*/gi, "").trim();
    let th = m.conversationId ? (await sb.from("threads").select("id").eq("conversation_id", m.conversationId).maybeSingle()).data : null;
    if (!th) th = (await sb.from("threads").select("id").ilike("subject", norm).maybeSingle()).data;
    const direction = /silitex\.it/i.test(m.from) ? "in" : "out";
    if (!th) { const id = "thr-" + m.id.replace(/[^a-z0-9]/gi, "").slice(-14); const r = await sb.from("threads").upsert({ id, dept: deptOf(m.subject + " " + m.body.slice(0, 600)), subject: norm, topic: "other", refs: {}, owner: direction === "in" ? "sapirim" : "silitex", status: direction === "in" ? "waiting_us" : "waiting_silitex", created_at: m.at, last_at: m.at, conversation_id: m.conversationId || null }).select("id").single(); th = r.data; threads++; }
    if (!th) continue;
    const r = await sb.from("hub_messages").upsert({ id: "msg-" + m.id.replace(/[^a-z0-9]/gi, "").slice(-18), thread_id: th.id, at: m.at, from: m.from, to: m.to, direction, body: m.body.slice(0, 20000), source: "graph", external_id: m.id }, { onConflict: "external_id", ignoreDuplicates: true });
    if (!r.error) { added++; const cur = (await sb.from("threads").select("last_at").eq("id", th.id).single()).data; if (!cur?.last_at || cur.last_at <= m.at) await sb.from("threads").update({ last_at: m.at, status: direction === "in" ? "waiting_us" : "waiting_silitex" }).eq("id", th.id); }
  }
  return { added, threads };
}
