// fq.ts (src/lib/fq.ts) · created 21.10.2026 16:45 (Asia/Jerusalem) — server only · Silitex open-questions register stored in Supabase (existing meeting_actions table, under a system "meeting" row reg-silitex — no new SQL needed). Row mapping: task = question, owner = who answers, party, status, due, created_at, done_at; task_id = JSON {cat, prio, asked[], answer, answered_at, leads[], note}. Seeds itself from config/federica-seed.ts the first time.
import { serviceClient } from "./server-data";
import type { Fq } from "./fq-types";
import { FQ_SEED } from "@/config/federica-seed";
export const REG = "reg-silitex";
type Row = { id: string; meeting_id: string; party: string; owner: string; task: string; due: string | null; status: string; task_id: string | null; created_at: string; done_at: string | null };
const toFq = (r: Row): Fq => { let m: Record<string, unknown> = {}; try { m = JSON.parse(r.task_id || "{}"); } catch {} return { id: r.id, q: r.task, who: r.owner, party: (r.party as Fq["party"]) || "silitex", status: (r.status as Fq["status"]) || "new", due: r.due, created_at: r.created_at, cat: String(m.cat || "Products & grades"), prio: (m.prio as Fq["prio"]) || "important", asked: (m.asked as string[]) || [], answer: String(m.answer || ""), answered_at: (m.answered_at as string) || null, leads: (m.leads as string[]) || [], note: String(m.note || "") }; };
const toRow = (f: Fq) => ({ id: f.id, meeting_id: REG, party: f.party, owner: f.who, task: f.q, due: f.due || null, status: f.status, created_at: f.created_at, done_at: f.status === "answered" || f.status === "closed" ? (f.answered_at || new Date().toISOString()) : null, task_id: JSON.stringify({ cat: f.cat, prio: f.prio, asked: f.asked, answer: f.answer, answered_at: f.answered_at, leads: f.leads, note: f.note }) });
async function ensureReg() {
  const sb = serviceClient(); if (!sb) return false;
  const r = await sb.from("meetings").upsert({ id: REG, held_at: "2026-10-16", title: "Silitex open-questions register (system)", participants: "Silitex · Sapirim", tags: ["register"], source: "system", transcript: "", summary: null });
  return !r.error;
}
export async function listFq(): Promise<{ items: Fq[] } | { error: string }> {
  const sb = serviceClient(); if (!sb) return { error: "no-db" };
  let r = await sb.from("meeting_actions").select("*").eq("meeting_id", REG).order("created_at");
  if (r.error) return { error: r.error.message };
  if (!(r.data || []).length) {
    if (!(await ensureReg())) return { error: "register row" };
    const rows = FQ_SEED.map((s, i) => toRow({ id: "fq-" + String(i + 1).padStart(3, "0"), q: s.q, cat: s.cat, who: s.who, prio: s.prio, party: s.party, status: s.status || "new", asked: s.asked || [], answer: "", answered_at: null, leads: s.leads, note: s.note || "", created_at: s.since + "T09:00:00.000Z", due: s.due || null }));
    const w = await sb.from("meeting_actions").upsert(rows); if (w.error) return { error: w.error.message };
    r = await sb.from("meeting_actions").select("*").eq("meeting_id", REG).order("created_at");
  }
  return { items: ((r.data || []) as Row[]).map(toFq) };
}
export async function saveFq(items: Fq[]): Promise<{ ok: true } | { error: string }> {
  const sb = serviceClient(); if (!sb) return { error: "no-db" };
  await ensureReg();
  const w = await sb.from("meeting_actions").upsert(items.map(toRow)); return w.error ? { error: w.error.message } : { ok: true };
}
