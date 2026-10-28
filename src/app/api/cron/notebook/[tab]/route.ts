// route.ts (src/app/api/cron/notebook/[tab]/route.ts) · updated 28.10.2026 06:35 (Asia/Jerusalem) — v1.2.0 + CRM 11 knowledge (silitex.it product pages from the KB), CRM 12 website forms, CRM 13 partner portal (feedback + AI questions)
// · created 27.10.2026 07:40 (Asia/Jerusalem) — v1.1.0 📓 NotebookLM live export
// · 27.10.2026 08:20 — split into ≤450 KB parts (?part=2 …, ?info=1 shows the count): Google IMPORTDATA max size
// Each CRM tab as CSV → a Google Sheet pulls it with =IMPORTDATA("<this url>?key=…") (Google refreshes it ~hourly)
// → NotebookLM syncs Google Sheets from Drive automatically. No Google Cloud setup, no AI cost.
// Under /api/cron so the PIN gate lets Google in; protected by NOTEBOOK_EXPORT_KEY instead (long secret in the URL).
import { serviceClient } from "@/lib/server-data";
import offsets from "@/data/offsets.json";
import products from "@/data/products.json";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Row = Record<string, unknown>;
const MAX = 20000; // Google Sheets cell limit is 50,000 chars
const cell = (v: unknown) => { let s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); s = s.replace(/\r?\n+/g, " ⏎ "); if (s.length > MAX) s = s.slice(0, MAX) + " …"; return '"' + s.replace(/"/g, '""') + '"'; }; // newlines → ⏎ : one record = one line (IMPORTDATA splits on newlines)
const CHUNK = 450_000; // bytes per part — Google IMPORTDATA rejects big files ("exceeded maximum size")
const head = (rows: Row[]) => Array.from(rows.reduce((a, r) => { Object.keys(r).forEach((k) => a.add(k)); return a; }, new Set<string>()));
/** CSV split into parts of ≤ CHUNK bytes, each with the header row; part n of the list */
const parts = (rows: Row[]): string[] => { if (!rows.length) return ["empty\n"]; const cols = head(rows); const h = cols.map(cell).join(",") + "\n"; const out: string[] = []; let cur = h; for (const r of rows) { const line = cols.map((c) => cell(r[c])).join(",") + "\n"; if (cur.length > h.length && Buffer.byteLength(cur + line) > CHUNK) { out.push(cur); cur = h; } cur += line; } out.push(cur); return out; };
const compact = (o: Row): Row => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && !v.length)));
const d = (x?: unknown) => (x ? "\u2060" + String(x).slice(0, 10).split("-").reverse().join("/") : ""); // dd/mm/yyyy as TEXT (invisible word-joiner stops Google Sheets turning it into a US date number)
const people = (intake: unknown) => { try { const v = JSON.parse(((intake || {}) as Record<string, string>).PEOPLE || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
// Google spreadsheet per tab part (part 1 = first id). The Apps Script reads this map (?tab=map), so new parts need no script change.
const MAP: Record<string, string[]> = {
  overview: ["1WRw6eExgXX0u4BqI4jU1hMsYq_NznHm68W18Vq02Ol8"],
  customers: ["1uzm3L3qSn7wlaWXuSLdDo6i5JJPENFyQ8sIx9NeD8Ws", "1RAcaD7Kw4xKKQYRs3JL_gWKaC7qsCkL6UX83rdDop9E", "1EMjjTO03oisMA3Y4vhw3FR_iAk6Bjz3SvnAGanV6niw", "1XYmVD8M3otppg_INoqvp6y1Y6VeU4Hn_-fJKsl7N43M", "1vu-tPMKS2r2ISsSI8aBvlj2x0KGNb3BRl1tqRXn7RXo", "19HwGaazXxdtp14ZRkDbmx1gGsGDS4v87NqitHQdxRoc", "1suhAJgEw0k2bSt6CbtxtI5yLHUTDqK-7fRdlOwbatHI", "1MRvIezzfz2BywD6TsAnLvL4sVa9D7IWReA0xeHUIjFE"],
  people: ["145kCcfNyLyRzB3dxIY2SMN7ICDGP1Fj8Ov__pwj4aSU"],
  activities: ["1KrglE50xS0tEcH8Bns7BTiYUFMo4vud2oIXkp_z4SGc"],
  tasks: ["16VYEkRUDAqYhHPAYgbGCoMGbL3o_BVAUKqqFfP9RuKw", "1uxssOYnoU-HKUlXrmsLEGxuB5eJXVhJD2TnJQ2Q6pZk", "1vZLQULOtyJqG2uIa2hbDIYTNexh_-AdUmK6LGdti_ls"],
  meetings: ["15bJ6AEXb2MYpU6W9gsSwO7sfz2-EBRXg9zMJTvlga7M"],
  correspondence: ["10yHomD1ux6XBVVRcii1ew5Laz8bXNKl5P8s4mj2JrLE"],
  shipments: ["1gWpdoysF0XsfFFjMjM7EsgiZSeYd8mRFj5k6yIbZ-WQ"],
  silitex_contacts: ["1UturzlChmWuX-kVtWdC9w1jIGCj-Ptxkt4xOamudXHM"],
  equivalents: ["1ZK-bkox84jUZ5BpK7oYMFIkP7OoM2DM87shAVxHjvOY"],
  catalogue: ["1LYaevjloias0FiVNUU_ILwfRTJnIOS3jAQPaOSn6kaE"],
  knowledge: ["1-5k32w5VWWjRVjqnyrXoqR4X-0MlXhretZKXsS3BJaM"],
  forms: ["1AKdl5CjDse7nIFfNSaEPaLEU0I-tEmHRS03slay1TVA"],
  partners: ["1lViJgwgHzvYYienyCg_KScVbHF-BReUbZ2hlrjsk0Ys"],
};
const TABS = ["overview", "customers", "people", "activities", "tasks", "meetings", "correspondence", "shipments", "silitex_contacts", "equivalents", "catalogue", "knowledge", "forms", "partners"];

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
    case "overview": { // counts NotebookLM can quote + one short line per customer (the big detail sits in the "Customers part N" sheets)
      const tasks = await all("tasks"); const cnt = (k: string) => { const a: Record<string, number> = {}; for (const l of leads) { const v = String(l[k] || "—"); a[v] = (a[v] || 0) + 1; } return Object.entries(a).sort((a, b) => b[1] - a[1]).map(([v, n]) => v + ": " + n).join(" | "); };
      const sum = [["Total customers / leads in the CRM", String(leads.length)], ["Customers by industry", cnt("industry")], ["Customers by status", cnt("status")], ["Customers by stage", cnt("stage")], ["Customers by tier", cnt("tier")], ["Open tasks", String(tasks.filter((t) => !t.done).length)], ["Done tasks", String(tasks.filter((t) => t.done).length)], ["Exported", d(new Date().toISOString()) + " (Asia/Jerusalem date)"]].map(([a, b]) => ({ id: "SUMMARY", name: a, industry: b }));
      return [...sum, ...leads.map((l) => ({ id: l.id, name: l.name, industry: l.industry, status: l.status, stage: l.stage, tier: l.tier, product_match: l.product_match, contact_name: l.contact_name, city: l.city, next_action_at: d(l.next_action_at), updated_at: d(l.updated_at) }))];
    }
    case "customers": return leads.map((l) => { const { intake, lat, lon, ...rest } = l; void lat; void lon; const it = { ...((intake || {}) as Row) }; delete it.PEOPLE; return { ...rest, updated_at: d(l.updated_at), created_at: d(l.created_at), next_action_at: d(l.next_action_at), people_count: people(intake).length, intake: compact(it) }; });
    case "people": return leads.flatMap((l) => people(l.intake).map((p: Row) => ({ company: l.name, industry: l.industry, ...p })));
    case "activities": return (await all("activities", "*", "at")).reverse().map((a) => ({ date: d(a.at), customer: leadName.get(a.lead_id) || a.lead_id, kind: a.kind, text: a.text }));
    case "tasks": { const cut = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10); return (await all("tasks", "*", "due")).filter((t) => !t.done || String(t.due || "") >= cut).map((t) => ({ due: d(t.due), customer: t.lead_name || leadName.get(t.lead_id) || "", title: t.title, kind: t.kind, cadence: t.cadence, done: t.done ? "done" : "open" })); }
    case "meetings": { const s = (await all("sales_meetings", "*", "held_at")).map((m) => ({ date: d(m.held_at), type: "sales " + m.kind, with: m.with_who, title: m.title, notes: m.notes, summary: m.summary })); const m = (await all("meetings", "*", "held_at")).map((x) => ({ date: d(x.held_at), type: "team", with: x.participants, title: x.title, notes: "", summary: x.summary })); const a = (await all("meeting_actions")).map((x) => ({ date: d(x.due), type: "action " + x.status, with: x.owner + " / " + x.party, title: x.task, notes: "", summary: "" })); return [...s, ...m, ...a]; }
    case "correspondence": { const th = new Map((await all("threads")).map((t) => [t.id, t])); return (await all("hub_messages", "*", "at")).reverse().map((h) => { const t = (th.get(h.thread_id) || {}) as Row; return { date: d(h.at), source: h.source, direction: h.direction, from: h.from, to: h.to, subject: t.subject || "", topic: t.topic || "", body: h.body }; }); }
    case "shipments": return (await all("shipments")).map((s) => ({ ...s, created_at: d(s.created_at), eta: d(s.eta) }));
    case "silitex_contacts": return all("silitex_contacts");
    case "knowledge": { // KB = silitex.it product + family pages: one row per page, its chunks joined back in order
      const docs = await all("kb_docs", "*", "title"); const ch = await all("kb_chunks"); const by = new Map<unknown, Row[]>();
      for (const c of ch) { const a = by.get(c.doc_id) || []; a.push(c); by.set(c.doc_id, a); }
      const clean = (t: unknown) => String(t || "").replace(/^silitex\.it · /, "").replace(/ \| Silitex S\.r\.l\. \| High emulsion technology$/, "");
      return docs.map((x) => ({ product_or_family: clean(x.title), kind: x.product_ref ? "product page" : "family page", source: "silitex.it", added: d(x.created_at), text: (by.get(x.id) || []).sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true })).map((c) => String(c.text || "").trim()).join(" ") }));
    }
    case "forms": return (await all("form_submissions", "*", "created_at")).reverse().map((f) => ({ date: d(f.created_at), kind: f.kind, company: f.company, name: f.name, email: f.email, phone: f.phone, product: f.product, message: f.message, details: compact((f.fields || {}) as Row), lang: f.lang, hidden: f.hidden_at ? "hidden (test / spam)" : "" }));
    case "partners": { // what partners (Pini …) wrote to us + what they asked the portal AI
      const fb = (await all("partner_feedback", "*", "at")).map((f) => ({ date: d(f.at), sort: String(f.at), type: "feedback", partner: f.partner, page: f.page, topic: f.topic, text: f.message, status: f.replied_at ? "replied " + d(f.replied_at) : "open", lang: f.lang }));
      const us = (await all("partner_usage", "*", "at")).filter((u) => u.question).map((u) => ({ date: d(u.at), sort: String(u.at), type: "AI question (" + u.kind + ")", partner: u.partner, page: u.path, topic: "", text: u.question, status: "", lang: u.lang }));
      return [...fb, ...us].sort((a, b) => b.sort.localeCompare(a.sort)).map(({ sort, ...r }) => { void sort; return r; });
    }
  }
  return [{ error: "unknown tab", tabs: TABS.join(", ") }];
}

export async function GET(req: Request, ctx: { params: Promise<{ tab: string }> }) {
  const key = process.env.NOTEBOOK_EXPORT_KEY; const u = new URL(req.url);
  if (!key || u.searchParams.get("key") !== key) return new Response("forbidden", { status: 403 });
  const { tab } = await ctx.params;
  if (tab === "map") return Response.json(MAP);
  const all = parts(await build(tab)); const n = Math.max(1, Number(u.searchParams.get("part") || 1) || 1);
  if (u.searchParams.get("info")) return new Response("parts," + all.length + "\nbytes," + all.map((x) => Buffer.byteLength(x)).join(" ") + "\n", { headers: { "content-type": "text/csv; charset=utf-8" } });
  const body = n > all.length ? "empty\n" : all[n - 1];
  return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "cache-control": "no-store", "x-parts": String(all.length) } });
}
