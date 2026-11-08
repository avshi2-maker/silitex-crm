// insight.ts (src/lib/insight.ts) · created 08.11.2026 16:20 (Asia/Jerusalem) — v1.8.0
// 🕵️ Customer insight agent (server): gathers EVERYTHING about one customer — card, people, technical form, website scan,
// every mail / WhatsApp with the customer AND with Silitex about the customer, activity log, open tasks — and asks the AI for a
// short Hebrew report: status · temperature · who we wait for · open requests · our promises (done / not) · risks · real potential · next step.
import { serviceClient } from "./server-data";
import { ask } from "./ai";
import { parseLoose } from "./studio/json";
import { intakeSummary } from "./intake";
import { peopleOf } from "./people";
import { scanOf } from "./scan";
import type { Lead, Usage } from "./types";

import type { Insight, InsightRow } from "./insight-types";
export type { Insight, InsightRow } from "./insight-types";
type SB = NonNullable<ReturnType<typeof serviceClient>>;
const QUOTE = /\n\s*(From:|-----\s*Original|On .{3,80} wrote:|מאת:)/i;
const d = (iso: string) => { const x = new Date(iso); return x.toLocaleString("he-IL", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); };

/** all facts about one customer as plain text (newest correspondence kept when long) */
export async function gather(sb: SB, leadId: string): Promise<{ lead: Lead | null; context: string; facts: number }> {
  const lead = (await sb.from("leads").select("*").eq("id", leadId).maybeSingle()).data as Lead | null; if (!lead) return { lead: null, context: "", facts: 0 };
  const ths = ((await sb.from("threads").select("id,dept,subject,topic").contains("refs", { lead_id: leadId })).data || []) as { id: string; dept: string; subject: string; topic: string }[];
  const msgs = ths.length ? ((await sb.from("hub_messages").select("thread_id,at,direction,from,to,body,source").in("thread_id", ths.map((t) => t.id)).order("at", { ascending: false }).limit(80)).data || []) : [];
  const acts = ((await sb.from("activities").select("at,kind,text").eq("lead_id", leadId).order("at", { ascending: false }).limit(40)).data || []) as { at: string; kind: string; text: string }[];
  const tasks = ((await sb.from("tasks").select("title,due").eq("lead_id", leadId).eq("done", false).order("due")).data || []) as { title: string; due: string }[];
  const people = peopleOf(lead).map((p) => "- " + [p.name, p.role, p.email, p.mobile].filter(Boolean).join(" · ")).join("\n");
  const sc = scanOf(lead);
  const head = ["CUSTOMER: " + lead.name, "Industry: " + [lead.industry, lead.sub_industry].filter(Boolean).join(" — "), "Stage: " + lead.stage + " · Tier: " + (lead.tier || "—") + " · Source: " + (lead.source || "—"),
    "Website: " + (lead.website || "—") + " · City: " + (lead.city || "—"), "Main contact: " + [lead.contact_name, lead.contact_role, lead.contact_email, lead.contact_phone].filter(Boolean).join(" · "),
    people ? "Other people:\n" + people : "", "Need / use: " + (lead.use_case || "—") + " · Product match: " + (lead.product_match || lead.recommended_sku || "—"), "Notes: " + (lead.notes || "—"),
    "Technical form:\n" + (intakeSummary(lead) || "—"), sc ? "Website scan matches: " + (sc.data.matches || []).map((m) => m.silitex).filter(Boolean).slice(0, 8).join(", ") : ""].filter(Boolean).join("\n");
  const side = (tid: string) => { const t = ths.find((x) => x.id === tid); return t?.dept === "il" ? "CUSTOMER" : t?.dept === "partner" ? "PARTNER" : "SILITEX"; };
  let budget = 18000; const mail: string[] = [];
  for (const m of msgs) { const t = ths.find((x) => x.id === m.thread_id); const body = String(m.body || "").split(QUOTE)[0].trim().slice(0, 1500); const line = "[" + d(m.at) + "] " + side(m.thread_id) + " · " + (m.direction === "in" ? "IN from " + m.from : "OUT (Avshi) to " + m.to) + (m.source === "whatsapp" ? " · WhatsApp" : "") + "\nSubject: " + (t?.subject || "") + "\n" + body; if (budget - line.length < 0) break; budget -= line.length; mail.push(line); }
  const context = head + "\n\nCORRESPONDENCE (newest first; CUSTOMER = with the customer, SILITEX = with the supplier about this customer):\n" + (mail.join("\n---\n") || "none") +
    "\n\nACTIVITY LOG (newest first):\n" + (acts.map((a) => "[" + d(a.at) + "] " + a.kind + ": " + a.text.slice(0, 300)).join("\n") || "none") +
    "\n\nOPEN TASKS:\n" + (tasks.map((t) => "- " + t.due + " " + t.title).join("\n") || "none") + "\n\nTODAY: " + d(new Date().toISOString());
  return { lead, context, facts: msgs.length + acts.length + tasks.length };
}

const PROMPT = `You are Avshi Sapir's sales analyst (Sapirim — Silitex silicone distributor in Israel). Read ALL the data about this customer and write a SHORT report that saves him reading the correspondence.
Rules: facts only from the data — never invent prices, quantities, dates or promises. Dates as dd/mm/yyyy. Write every text value in Hebrew (product names / codes as written).
- status: one sentence — where the deal stands right now.
- temperature: hot (active, real need, recent replies) | warm | cold (little contact) | stalled (no reply for a long time / blocked).
- waiting_on: who must act next — customer | us (Avshi) | silitex | none. last_contact: date of the newest message and who wrote it.
- open_requests: what the customer asked that is not yet fully answered (each item short).
- promises: things Avshi or Silitex said they would do/send (TDS, sample, quotation, call…) — done:true only if the data shows it was done.
- risks: concrete — days without reply, conditions set by the customer (e.g. "no substitute", "written approval before any charge"), price or competitor issues, missing documents, regulatory (D4/D5), Silitex not answering. level high | medium | low. Empty list if none.
- potential: the real opportunity from the data (product, quantity, frequency); say clearly when quantity is unknown.
- next_action: ONE concrete next step, who (me | silitex | customer) and due_days from today.
Return ONLY JSON: {"status":"","temperature":"","waiting_on":"","last_contact":{"date":"","by":""},"open_requests":[],"promises":[{"text":"","done":false}],"risks":[{"level":"","text":""}],"potential":"","next_action":{"text":"","due_days":0,"who":""}}`;

export async function analyse(sb: SB, leadId: string, source = "manual"): Promise<{ row: InsightRow; usage: Usage } | { error: string }> {
  const g = await gather(sb, leadId); if (!g.lead) return { error: "customer not found" };
  if (g.facts === 0 && !g.lead.notes && !g.lead.use_case) return { error: "אין עדיין מידע לנתח — אין התכתבות, פעילות או הערות אצל הלקוח" };
  const { text, usage } = await ask(PROMPT, g.context, 1500, "any", 60000);
  const j = parseLoose<Insight>(text); if (!j || !j.status) return { error: "AI answer could not be read — try again" };
  const report: Insight = { status: String(j.status), temperature: (["hot", "warm", "cold", "stalled"].includes(j.temperature) ? j.temperature : "warm") as Insight["temperature"], waiting_on: (["customer", "us", "silitex", "none"].includes(j.waiting_on) ? j.waiting_on : "none") as Insight["waiting_on"],
    last_contact: j.last_contact, open_requests: (j.open_requests || []).map(String).slice(0, 8), promises: (j.promises || []).slice(0, 8).map((p) => ({ text: String(p.text || ""), done: !!p.done })),
    risks: (j.risks || []).slice(0, 6).map((r) => ({ level: (["high", "medium", "low"].includes(r.level) ? r.level : "medium") as "high", text: String(r.text || "") })), potential: String(j.potential || ""),
    next_action: { text: String(j.next_action?.text || ""), due_days: Math.max(0, Math.min(60, Number(j.next_action?.due_days) || 0)), who: (["me", "silitex", "customer"].includes(j.next_action?.who) ? j.next_action.who : "me") as "me" } };
  const ins = await sb.from("lead_insights").insert({ lead_id: leadId, report, usage, source }).select("*").single();
  if (ins.error) return { error: ins.error.message };
  return { row: ins.data as InsightRow, usage };
}

/** customers worth analysing: correspondence or real activity in the last N days, not won / lost */
export async function candidates(sb: SB, days = 30): Promise<string[]> {
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const ths = ((await sb.from("threads").select("refs,last_at").gte("last_at", since)).data || []).map((t) => (t.refs as { lead_id?: string } | null)?.lead_id).filter(Boolean) as string[];
  const acts = ((await sb.from("activities").select("lead_id,kind").gte("at", since).not("kind", "in", "(stage,import,ai)")).data || []).map((a) => a.lead_id as string);
  const ids = Array.from(new Set([...ths, ...acts]));
  if (!ids.length) return [];
  const open = ((await sb.from("leads").select("id,stage").in("id", ids)).data || []).filter((l) => !["won", "lost"].includes(String(l.stage))).map((l) => l.id as string);
  return open;
}
