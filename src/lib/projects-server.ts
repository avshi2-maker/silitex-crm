// projects-server.ts (src/lib/projects-server.ts) · created 10.11.2026 12:35 (Asia/Jerusalem) — v1.9.8 📁 Projects — server only
// Auto-open: a customer message that asks for technical data / sample / price (RFQ_RE) on a customer with no open project → new #SPR number
// (DB sequence), Silitex team attached (Management box: Federica TO, the rest CC), 🔔 follow-up task, every thread of that customer tagged.
// Runs on every /projects load and after each Outlook sync (cron every 15 min). Nothing is deleted.
import { serviceClient } from "./server-data";
import { RFQ_RE, ENDED, PROJECT_FOLLOWUP_DAYS } from "@/config/projects";
import { addDays, todayIso, fmtDate } from "./format";
import type { Project, ProjectMember } from "./types";
type SB = NonNullable<ReturnType<typeof serviceClient>>;
export type NewProject = { lead_id: string; lead_name: string; opened_at?: string; description?: string; request?: string; source: string };

export async function defaultTeam(sb: SB): Promise<ProjectMember[]> {
  const cts = ((await sb.from("silitex_contacts").select("name,email,role,dept").eq("dept", "mgmt")).data || []).filter((c) => c.email && !/^info@/i.test(c.email));
  const lead = cts.find((c) => /federica/i.test(c.name)) || cts[0];
  return cts.map((c) => ({ name: c.name, email: c.email, org: "Silitex" + (c.role ? " · " + c.role : ""), role: c === lead ? "to" : "cc" }));
}
/** tags every thread of the customer (customer mails, WhatsApp, Silitex mails about the customer) with the project number */
export async function linkThreads(sb: SB, p: Pick<Project, "id" | "lead_id">) {
  const ths = (await sb.from("threads").select("id,refs").contains("refs", { lead_id: p.lead_id })).data || [];
  for (const t of ths) { const r = (t.refs || {}) as Record<string, string>; if (r.project && r.project !== p.id) continue; if (r.project !== p.id) await sb.from("threads").update({ refs: { ...r, project: p.id } }).eq("id", t.id); }
}
/** opens a project (or returns the customer's open one — one open project per customer, DB index) */
export async function openProject(sb: SB, n: NewProject): Promise<{ project: Project; created: boolean }> {
  const open = (await sb.from("projects").select("*").eq("lead_id", n.lead_id).not("stage", "in", "(" + ENDED.join(",") + ")").maybeSingle()).data as Project | null;
  if (open) return { project: open, created: false };
  const at = n.opened_at || new Date().toISOString();
  const row = { lead_id: n.lead_id, lead_name: n.lead_name, opened_at: at, description: n.description || "", request: n.request || "", stage: "rfq", source: n.source, team: await defaultTeam(sb), history: [{ v: 1, at, text: "פרויקט נפתח" + (n.source.startsWith("auto") ? " אוטומטית" : "") }] };
  const r = await sb.from("projects").insert(row).select("*").single();
  if (r.error) { const again = (await sb.from("projects").select("*").eq("lead_id", n.lead_id).not("stage", "in", "(" + ENDED.join(",") + ")").maybeSingle()).data as Project | null; if (again) return { project: again, created: false }; throw new Error(r.error.message); }
  const p = r.data as Project; const stamp = Date.now().toString(36);
  await linkThreads(sb, p);
  await sb.from("tasks").insert({ id: "task-prj-" + p.id + "-" + stamp, lead_id: p.lead_id, lead_name: p.lead_name, title: "🔔 מעקב #" + p.id + " — " + (p.description || "פנייה חדשה").slice(0, 80), due: addDays(todayIso(), PROJECT_FOLLOWUP_DAYS), cadence: "once", done: false, kind: "followup" });
  await sb.from("activities").insert({ id: "act-prj-" + p.id + "-" + stamp, lead_id: p.lead_id, at: new Date().toISOString(), kind: "project", text: "📁 פרויקט #" + p.id + " נפתח · " + fmtDate(p.opened_at) + " · v1" });
  return { project: p, created: true };
}
/** customers whose inbound message asks for data / sample / price and have no open project → open one, oldest first (numbers follow the calendar) */
export async function sweep(sb: SB): Promise<string[]> {
  const since = new Date(Date.now() - 120 * 864e5).toISOString();
  const ths = ((await sb.from("threads").select("id,refs").eq("dept", "il").gte("last_at", since).limit(1000)).data || []).filter((t) => (t.refs as { lead_id?: string } | null)?.lead_id);
  if (!ths.length) return [];
  const byThread = new Map(ths.map((t) => [t.id, t.refs as { lead_id: string; lead_name?: string }]));
  const msgs = (await sb.from("hub_messages").select("thread_id,at,body").in("thread_id", [...byThread.keys()]).eq("direction", "in").gte("at", since).order("at", { ascending: true }).limit(3000)).data || [];
  const projs = ((await sb.from("projects").select("lead_id,stage,updated_at")).data || []) as Pick<Project, "lead_id" | "stage" | "updated_at">[];
  const cands = new Map<string, { lead_id: string; lead_name: string; at: string; body: string; wa: boolean }>();
  for (const m of msgs) {
    const ref = byThread.get(m.thread_id)!; if (cands.has(ref.lead_id) || !RFQ_RE.test(String(m.body || ""))) continue;
    const mine = projs.filter((p) => p.lead_id === ref.lead_id);
    if (mine.some((p) => !ENDED.includes(p.stage))) continue;
    if (mine.some((p) => String(p.updated_at) >= m.at)) continue; // message belongs to a project already closed
    cands.set(ref.lead_id, { lead_id: ref.lead_id, lead_name: ref.lead_name || ref.lead_id, at: m.at, body: String(m.body || ""), wa: m.thread_id.startsWith("thr-wa-") });
  }
  const opened: string[] = [];
  for (const c of [...cands.values()].sort((a, b) => a.at.localeCompare(b.at))) {
    const lead = (await sb.from("leads").select("name").eq("id", c.lead_id).maybeSingle()).data;
    const { project, created } = await openProject(sb, { lead_id: c.lead_id, lead_name: lead?.name || c.lead_name, opened_at: c.at, request: c.body.replace(/\s+/g, " ").slice(0, 400), source: c.wa ? "auto:whatsapp" : "auto:mail" });
    if (created) opened.push(project.id);
  }
  return opened;
}
export async function sweepSafe(): Promise<string[]> { const sb = serviceClient(); if (!sb) return []; try { return await sweep(sb); } catch { return []; } }
