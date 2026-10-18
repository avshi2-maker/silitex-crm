// run.ts (src/lib/visibility/run.ts) · updated 18.10.2026 18:55 (Asia/Jerusalem) — AI VISIBILITY BOT (server): run one check (engine × question) → detect Sapirim citation / mention, Silitex mention, competitor brands → save to Supabase ai_visibility (if configured). Also lists history.
import { VIS_WATCH, VIS_QUESTIONS, type VisQ } from "@/config/visibility";
import { askClaudeWeb, askChatGPTWeb, engineReady, type Engine } from "./engines";
import { serviceClient } from "@/lib/server-data";
export type VisRow = { id: string; at: string; engine: Engine; qid: string; question: string; lang: string; sapirim_cited: boolean; sapirim_mentioned: boolean; silitex_mentioned: boolean; brands: string[]; sources: { url: string; title: string }[]; answer: string; cost_usd: number; error: string | null };
export async function runCheck(engine: Engine, q: VisQ): Promise<{ row: VisRow; stored: boolean }> {
  const base = { id: "V" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: new Date().toISOString(), engine, qid: q.id, question: q.q, lang: q.lang };
  let row: VisRow;
  try {
    if (!engineReady(engine)) throw new Error(engine + ": API key missing");
    const out = engine === "claude" ? await askClaudeWeb(q.q) : await askChatGPTWeb(q.q);
    const all = out.text + " " + out.sources.map((s) => s.url + " " + s.title).join(" ");
    row = { ...base, sapirim_cited: out.sources.some((s) => VIS_WATCH.sapirimDomain.test(s.url)), sapirim_mentioned: VIS_WATCH.sapirimText.test(all), silitex_mentioned: VIS_WATCH.silitexText.test(all), brands: Object.entries(VIS_WATCH.brands).filter(([, re]) => re.test(out.text)).map(([b]) => b), sources: out.sources, answer: out.text.slice(0, 6000), cost_usd: Math.round(out.cost * 10000) / 10000, error: null };
  } catch (e) { row = { ...base, sapirim_cited: false, sapirim_mentioned: false, silitex_mentioned: false, brands: [], sources: [], answer: "", cost_usd: 0, error: e instanceof Error ? e.message.slice(0, 300) : "error" }; }
  const sb = serviceClient(); let stored = false;
  if (sb) { const { error } = await sb.from("ai_visibility").insert(row); stored = !error; if (error) console.warn("ai_visibility", error.message); }
  return { row, stored };
}
export async function history(limit = 600): Promise<{ rows: VisRow[]; configured: boolean; error?: string }> {
  const sb = serviceClient(); if (!sb) return { rows: [], configured: false };
  const { data, error } = await sb.from("ai_visibility").select("*").order("at", { ascending: false }).limit(limit);
  return error ? { rows: [], configured: false, error: error.message } : { rows: (data || []) as VisRow[], configured: true };
}
export async function runAll(engines: Engine[] = ["claude", "chatgpt"], concurrency = 4): Promise<VisRow[]> {
  const jobs = engines.flatMap((e) => VIS_QUESTIONS.map((q) => () => runCheck(e, q))); const out: VisRow[] = [];
  for (let i = 0; i < jobs.length; i += concurrency) out.push(...(await Promise.all(jobs.slice(i, i + concurrency).map((f) => f()))).map((r) => r.row));
  return out;
}
