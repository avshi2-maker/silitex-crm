// scan-jobs.ts (src/lib/scan-jobs.ts) · updated 23.10.2026 06:55 (Asia/Jerusalem) — status() also returns avgSec (real average scan time) for the live ETA · created 22.10.2026 08:30 (Asia/Jerusalem) — server only. SERVER SCAN QUEUE (table scan_jobs): enqueue customers → a worker chain scans them one by one on the server (each step its own 120 s function, the next step is started by the previous one) → results wait in scan_jobs until any open CRM page applies them to the customers. Browser can be closed. Stale "running" (> 4 min) = failed "timeout". Real cost per scan stored (cost_usd + tokens).
import { serviceClient } from "./server-data";
import { gateToken, GATE_COOKIE } from "./gate";
import { runScan } from "./scan-run";
export type JobIn = { lead_id: string; name: string; website: string; industry: string };
export type Job = JobIn & { id: string; status: "queued" | "running" | "done" | "failed" | "cancelled"; result: Record<string, unknown> | null; error: string | null; cost_usd: number; input_tokens: number; output_tokens: number; created_at: string; started_at: string | null; finished_at: string | null };
const sb = () => { const c = serviceClient(); if (!c) throw new Error("no supabase"); return c; };
export async function enqueue(items: JobIn[]): Promise<number> {
  const c = sb(); const live = new Set(((await c.from("scan_jobs").select("lead_id").in("status", ["queued", "running"])).data || []).map((r) => r.lead_id));
  const rows = items.filter((i) => i.lead_id && i.website && !live.has(i.lead_id)).map((i) => ({ id: "sj-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7), lead_id: i.lead_id, name: i.name.slice(0, 160), website: i.website.slice(0, 400), industry: (i.industry || "").slice(0, 160), status: "queued" }));
  if (rows.length) { const { error } = await c.from("scan_jobs").insert(rows); if (error) throw new Error(error.message); }
  return rows.length;
}
/** mark dead workers: running for more than 4 minutes */
async function reap() { const c = sb(); const old = new Date(Date.now() - 4 * 60000).toISOString(); await c.from("scan_jobs").update({ status: "failed", error: "timeout", finished_at: new Date().toISOString() }).eq("status", "running").lt("started_at", old); }
async function claim(): Promise<Job | null> {
  const c = sb();
  for (let i = 0; i < 3; i++) {
    const next = (await c.from("scan_jobs").select("id").eq("status", "queued").order("created_at").limit(1)).data?.[0]; if (!next) return null;
    const got = (await c.from("scan_jobs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", next.id).eq("status", "queued").select("*")).data?.[0];
    if (got) return got as Job;
  }
  return null;
}
/** one step of the chain: scan one queued customer; returns true when more are waiting */
export async function processOne(): Promise<boolean> {
  await reap(); const c = sb(); const j = await claim(); if (!j) return false;
  const r = await runScan(j.name || "", j.website || "", j.industry || "", 104000);
  const u = r.usage; const base = { finished_at: new Date().toISOString(), cost_usd: u?.cost_usd || 0, input_tokens: u?.input_tokens || 0, output_tokens: u?.output_tokens || 0 };
  if (r.ok) await c.from("scan_jobs").update({ ...base, status: "done", result: { data: r.data, at: r.at, pages: r.pages, urls: r.urls, sector: r.sector } }).eq("id", j.id);
  else await c.from("scan_jobs").update({ ...base, status: "failed", error: r.error }).eq("id", j.id);
  const more = (await c.from("scan_jobs").select("id", { count: "exact", head: true }).eq("status", "queued")).count || 0;
  return more > 0;
}
/** start the worker chain (fire-and-forget: the worker answers at once and works after the reply) */
export async function kick(origin: string): Promise<void> {
  const pin = process.env.ACCESS_PIN; const headers: Record<string, string> = { "Content-Type": "application/json" }; if (pin) headers.cookie = GATE_COOKIE + "=" + (await gateToken(pin));
  try { await fetch(origin + "/api/scan/worker", { method: "POST", headers, body: "{}", cache: "no-store" }); } catch {}
}
export async function status(since?: string) {
  const c = sb(); await reap();
  const day = new Date(Date.now() - 24 * 3600000).toISOString();
  const all = ((await c.from("scan_jobs").select("id,lead_id,name,status,error,cost_usd,created_at,started_at,finished_at").gte("created_at", day).order("created_at", { ascending: false }).limit(500)).data || []) as Job[];
  const live = ((await c.from("scan_jobs").select("id,lead_id,name,status,started_at,created_at").in("status", ["queued", "running"]).order("created_at").limit(500)).data || []) as Job[];
  const results = since ? ((await c.from("scan_jobs").select("id,lead_id,status,result,error,finished_at").in("status", ["done", "failed"]).gt("finished_at", since).order("finished_at").limit(300)).data || []) as Job[] : [];
  const count = (s: string) => all.filter((j) => j.status === s).length;
  const costs = all.filter((j) => j.status === "done" && Number(j.cost_usd) > 0).map((j) => Number(j.cost_usd));
  const durs = all.filter((j) => j.status === "done" && j.started_at && j.finished_at).map((j) => (Date.parse(j.finished_at as string) - Date.parse(j.started_at as string)) / 1000).filter((x) => x > 0 && x < 600);
  const avgSec = durs.length ? Math.round(durs.reduce((a, b) => a + b, 0) / durs.length) : 45; // real average scan time (24 h) → ETA in the live signal
  return { avgSec, queued: live.filter((j) => j.status === "queued").length, running: live.filter((j) => j.status === "running").map((j) => ({ name: j.name, started_at: j.started_at })), done24: count("done"), failed24: count("failed"), cost24: all.reduce((a, j) => a + Number(j.cost_usd || 0), 0), avgCost: costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : 0, results, recent: all.slice(0, 15).map((j) => ({ name: j.name, status: j.status, error: j.error, finished_at: j.finished_at, cost_usd: Number(j.cost_usd || 0) })) };
}
export async function cancelQueued(): Promise<number> { const r = await sb().from("scan_jobs").update({ status: "cancelled", finished_at: new Date().toISOString() }).eq("status", "queued").select("id"); return r.data?.length || 0; }
