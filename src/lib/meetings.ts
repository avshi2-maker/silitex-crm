// meetings.ts (src/lib/meetings.ts) · updated 21.10.2026 16:45 (Asia/Jerusalem) — hides the system row reg-silitex (Federica open-questions register) from the meetings list / search · 16.10.2026 18:00 — server only
// Meetings store (Supabase service role; tables in supabase/meetings.sql). Types shared with the client via lib/meeting-types.ts.
import { serviceClient } from "./server-data";
import { chunkText, scoreChunks } from "./rag";
import type { KbChunk } from "./types";
import type { Meeting, MeetingAction, MeetingSummary } from "./meeting-types";
export const NO_DB = "Supabase service key missing (SUPABASE_SERVICE_ROLE_KEY) or tables not created — run supabase/meetings.sql";
const id = (p: string) => p + "-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
export async function listMeetings(): Promise<{ meetings: Omit<Meeting, "transcript">[]; actions: MeetingAction[] } | null> {
  const sb = serviceClient(); if (!sb) return null;
  const [m, a] = await Promise.all([sb.from("meetings").select("id,held_at,title,participants,tags,source,summary,usage,created_at").neq("id", "reg-silitex").order("held_at", { ascending: false }), sb.from("meeting_actions").select("*").neq("meeting_id", "reg-silitex").order("created_at", { ascending: true })]);
  if (m.error || a.error) return null;
  return { meetings: (m.data || []) as Omit<Meeting, "transcript">[], actions: (a.data || []) as MeetingAction[] };
}
export async function getMeeting(mid: string): Promise<{ meeting: Meeting; actions: MeetingAction[] } | null> {
  const sb = serviceClient(); if (!sb) return null;
  const [m, a] = await Promise.all([sb.from("meetings").select("*").eq("id", mid).single(), sb.from("meeting_actions").select("*").eq("meeting_id", mid).order("created_at")]);
  if (m.error || !m.data) return null;
  return { meeting: m.data as Meeting, actions: (a.data || []) as MeetingAction[] };
}
export async function createMeeting(input: { held_at: string; title: string; participants: string; tags: string[]; source: string; transcript: string; summary: MeetingSummary; usage?: unknown; task_ids?: Record<number, string>; mid?: string }): Promise<{ id: string } | { error: string }> {
  const sb = serviceClient(); if (!sb) return { error: NO_DB };
  const mid = input.mid || id("mtg");
  const r = await sb.from("meetings").upsert({ id: mid, held_at: input.held_at, title: input.title, participants: input.participants, tags: input.tags, source: input.source, transcript: input.transcript, summary: input.summary, usage: input.usage || null });
  if (r.error) return { error: r.error.message };
  const rows = (input.summary.actions || []).map((x, i) => ({ id: mid + "-a" + (i + 1), meeting_id: mid, party: x.party, owner: x.owner, task: x.task, due: x.due || null, status: "open", task_id: input.task_ids?.[i] || null }));
  if (rows.length) { const b = await sb.from("meeting_actions").upsert(rows); if (b.error) return { error: b.error.message }; }
  return { id: mid };
}
export async function setActionStatus(aid: string, status: "open" | "done"): Promise<boolean> {
  const sb = serviceClient(); if (!sb) return false;
  const r = await sb.from("meeting_actions").update({ status, done_at: status === "done" ? new Date().toISOString() : null }).eq("id", aid);
  return !r.error;
}
export async function setActionTask(aid: string, task_id: string): Promise<boolean> {
  const sb = serviceClient(); if (!sb) return false;
  const r = await sb.from("meeting_actions").update({ task_id }).eq("id", aid); return !r.error;
}
export async function deleteMeeting(mid: string): Promise<boolean> {
  const sb = serviceClient(); if (!sb) return false;
  const r = await sb.from("meetings").delete().eq("id", mid); return !r.error;
}
export type MeetingHit = { meeting_id: string; title: string; held_at: string; text: string };
export async function searchMeetings(q: string, k = 8): Promise<MeetingHit[] | null> {
  const sb = serviceClient(); if (!sb) return null;
  const r = await sb.from("meetings").select("id,title,held_at,transcript,summary").neq("id", "reg-silitex"); if (r.error) return null;
  const chunks: (KbChunk & { held_at: string })[] = [];
  for (const m of r.data || []) {
    const s = m.summary as MeetingSummary | null;
    const sumText = s ? [...(s.summary || []), ...(s.decisions || []), ...(s.open_questions || []), ...(s.actions || []).map((a) => a.party + ": " + a.task)].join("\n") : "";
    if (sumText) chunks.push({ id: m.id + "-sum", doc_id: m.id, title: m.title, doc_type: "SUMMARY", product_ref: "", text: sumText, held_at: m.held_at });
    chunkText(m.transcript || "", 1100, 200).forEach((t, i) => chunks.push({ id: m.id + "-c" + i, doc_id: m.id, title: m.title, doc_type: "TRANSCRIPT", product_ref: "", text: t, held_at: m.held_at }));
  }
  return (scoreChunks(q, chunks, k) as (KbChunk & { held_at: string })[]).map((c) => ({ meeting_id: c.doc_id, title: c.title + (c.doc_type === "SUMMARY" ? " · summary" : ""), held_at: c.held_at, text: c.text }));
}
