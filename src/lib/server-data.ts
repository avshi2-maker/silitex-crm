// server-data.ts (src/lib/server-data.ts) · updated 29.10.2026 05:45 (Asia/Jerusalem) — FIX: read ALL open tasks (Supabase returns max 1000 rows per request — the check missed tasks and created duplicates) + roll open daily tasks to today · 09.10.2026 10:05 — server only
// Data for cron/bots. Supabase (service role) when configured; otherwise bundled seed + computed schedule.
import { createClient } from "@supabase/supabase-js";
import { LEADS_SEED } from "./data";
import { buildSchedule, rollDaily } from "./store/cadence";
import { todayIso } from "./format";
import type { Lead, Task, KbDoc, KbChunk } from "./types";
export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key) : null;
}
export async function getLeadsAndTasks(): Promise<{ leads: Lead[]; tasks: Task[]; source: "supabase" | "seed" }> {
  const sb = serviceClient();
  if (sb) {
    const page = async (table: string, open = false) => { const out: Record<string, unknown>[] = []; for (let f = 0; ; f += 1000) { let q = sb.from(table).select("*").order("id").range(f, f + 999); if (open) q = q.eq("done", false); const { data, error } = await q; if (error) return null; out.push(...(data || [])); if (!data || data.length < 1000) break; } return out; };
    const [ld, td] = await Promise.all([page("leads"), page("tasks", true)]);
    if (ld?.length && td) {
      const leads = ld as unknown as Lead[]; const today = todayIso();
      const rolled = rollDaily(td as unknown as Task[], today); const byId = new Map(rolled.map((t) => [t.id, t]));
      const tasks = (td as unknown as Task[]).map((t) => byId.get(t.id) || t);
      const add = buildSchedule(leads, tasks, today);
      if (rolled.length) await sb.from("tasks").upsert(rolled);
      if (add.length) await sb.from("tasks").upsert(add);
      return { leads, tasks: [...tasks, ...add], source: "supabase" };
    }
  }
  return { leads: LEADS_SEED, tasks: buildSchedule(LEADS_SEED, [], todayIso()), source: "seed" };
}
export async function saveKbServer(doc: KbDoc, chunks: KbChunk[]): Promise<boolean> {
  const sb = serviceClient(); if (!sb) return false;
  const a = await sb.from("kb_docs").upsert(doc); if (a.error) return false;
  const b = await sb.from("kb_chunks").upsert(chunks); return !b.error;
}
export async function kbHasTitle(title: string): Promise<boolean> {
  const sb = serviceClient(); if (!sb) return false;
  const r = await sb.from("kb_docs").select("id").eq("title", title).limit(1);
  return !!r.data?.length;
}
