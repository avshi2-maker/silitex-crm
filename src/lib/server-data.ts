// server-data.ts (src/lib/server-data.ts) · updated 09.10.2026 10:05 (Asia/Jerusalem) — server only
// Data for cron/bots. Supabase (service role) when configured; otherwise bundled seed + computed schedule.
import { createClient } from "@supabase/supabase-js";
import { LEADS_SEED } from "./data";
import { buildSchedule } from "./store/cadence";
import { todayIso } from "./format";
import type { Lead, Task, KbDoc, KbChunk } from "./types";
export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key) : null;
}
export async function getLeadsAndTasks(): Promise<{ leads: Lead[]; tasks: Task[]; source: "supabase" | "seed" }> {
  const sb = serviceClient();
  if (sb) {
    const [l, t] = await Promise.all([sb.from("leads").select("*"), sb.from("tasks").select("*").eq("done", false)]);
    if (!l.error && l.data?.length) {
      const leads = l.data as Lead[]; const tasks = (t.data || []) as Task[];
      const add = buildSchedule(leads, tasks, todayIso());
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
