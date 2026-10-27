// route.ts (src/app/api/cron/notebook/[tab]/route.ts) · created 27.10.2026 07:40 (Asia/Jerusalem) — v1.1.0 📓 NotebookLM live export
// Each CRM tab as CSV → a Google Sheet pulls it with =IMPORTDATA("<this url>?key=…") (Google refreshes it ~hourly)
// → NotebookLM syncs Google Sheets from Drive automatically. No Google Cloud setup, no AI cost.
// Under /api/cron so the PIN gate lets Google in; protected by NOTEBOOK_EXPORT_KEY instead (long secret in the URL).
import { serviceClient } from "@/lib/server-data";
import offsets from "@/data/offsets.json";
import products from "@/data/products.json";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Row = Record<string, unknown>;
const MAX = 45000; // Google Sheets cell limit is 50,000 chars
const cell = (v: unknown) => { let s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); s = s.replace(/\r?\n+/g, " ⏎ "); if (s.length > MAX) s = s.slice(0, MAX) + " …"; return '"' + s.replace(/"/g, '""') + '"'; }; // newlines → ⏎ : one record = one line (IMPORTDATA splits on newlines)
const csv = (rows: Row[]) => { if (!rows.length) return "empty\n"; const cols = Array.from(rows.reduce((a, r) => { Object.keys(r).forEach((k) => a.add(k)); return a; }, new Set<string>())); return [cols.map(cell).join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n") + "\n"; };
const d = (x?: unknown) => (x ? String(x).slice(0, 10).split("-").reverse().join("/") : ""); // dd/mm/yyyy
const people = (intake: unknown) => { try { const v = JSON.parse(((intake || {}) as Record<string, string>).PEOPLE || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
const TABS = ["customers", "people", "activities", "tasks", "meetings", "correspondence", "shipments", "silitex_contacts", "equivalents", "catalogue"];

async function build(tab: string): Promise<Row[]> {
  if (tab === "equivalents") {
    const o = offsets as unknown as { rows: Row[]; inci_checks?: Record<string, Row> };
    const fam = o.rows.map((r) => ({ category: r.category_id, family: r.family, inci: r.inci, silitex: r.silitex_product, dow: r.dow_corning, ...(r.offsets as Row), removed_fake_codes: ((r.removed as Row[]) || []).map((x) => x.code + " (" + x.status + ")").join(" / ") }));
    const checks = Object.entries(o.inci_checks || {}).map(([k, c]) => ({ category: "INCI CHECK " + c.cat, family: k, inci: c.inci || "", silitex: c.status === "ok" ? "VERIFIED on producer page" : String(c.status), dow: c.src || "", note: c.note || "", cyclic_D4_D5_D6: c.cyclic ? "yes" : "" }));
    return [...fam, ...checks];
  }
  if (tab === "catalogue") return products as unknown as Row[];
  const sb = serviceClient(); if (!sb) return [{ error: "no database" }];
  const all = async (t: string, sel = "*", order = "id") => { const out: Row[] = []; for (let f = 0; ; f += 1000) { const { data } = await sb.from(t).select(sel).order(order).range(f, f + 999); if (!data?.length) break; out.push(...(data as unknown as Row[])); if (data.length < 1000) break; } return out; };
  const leads = await all("leads");
  const leadName = new Map(leads.map((l) => [l.id, l.name]));
  switch (tab) {
    case "customers": return leads.map((l) => { const { intake, lat, lon, ...rest } = l; void lat; void lon; const it = { ...((intake || {}) as Row) }; delete it.PEOPLE; return { ...rest, updated_at: d(l.updated_at), created_at: d(l.created_at), next_action_at: d(l.next_action_at), people_count: people(intake).length, intake: it }; });
    case "people": return leads.flatMap((l) => people(l.intake).map((p: Row) => ({ company: l.name, industry: l.industry, ...p })));
    case "activities": return (await all("activities", "*", "at")).reverse().map((a) => ({ date: d(a.at), customer: leadName.get(a.lead_id) || a.lead_id, kind: a.kind, text: a.text }));
    case "tasks": { const cut = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10); return (await all("tasks", "*", "due")).filter((t) => !t.done || String(t.due || "") >= cut).map((t) => ({ due: d(t.due), customer: t.lead_name || leadName.get(t.lead_id) || "", title: t.title, kind: t.kind, cadence: t.cadence, done: t.done ? "done" : "open" })); }
    case "meetings": { const s = (await all("sales_meetings", "*", "held_at")).map((m) => ({ date: d(m.held_at), type: "sales " + m.kind, with: m.with_who, title: m.title, notes: m.notes, summary: m.summary })); const m = (await all("meetings", "*", "held_at")).map((x) => ({ date: d(x.held_at), type: "team", with: x.participants, title: x.title, notes: "", summary: x.summary })); const a = (await all("meeting_actions")).map((x) => ({ date: d(x.due), type: "action " + x.status, with: x.owner + " / " + x.party, title: x.task, notes: "", summary: "" })); return [...s, ...m, ...a]; }
    case "correspondence": { const th = new Map((await all("threads")).map((t) => [t.id, t])); return (await all("hub_messages", "*", "at")).reverse().map((h) => { const t = (th.get(h.thread_id) || {}) as Row; return { date: d(h.at), source: h.source, direction: h.direction, from: h.from, to: h.to, subject: t.subject || "", topic: t.topic || "", body: h.body }; }); }
    case "shipments": return (await all("shipments")).map((s) => ({ ...s, created_at: d(s.created_at), eta: d(s.eta) }));
    case "silitex_contacts": return all("silitex_contacts");
  }
  return [{ error: "unknown tab", tabs: TABS.join(", ") }];
}

export async function GET(req: Request, ctx: { params: Promise<{ tab: string }> }) {
  const key = process.env.NOTEBOOK_EXPORT_KEY; const u = new URL(req.url);
  if (!key || u.searchParams.get("key") !== key) return new Response("forbidden", { status: 403 });
  const { tab } = await ctx.params;
  const rows = await build(tab);
  return new Response(csv(rows), { headers: { "content-type": "text/csv; charset=utf-8", "cache-control": "no-store" } });
}
