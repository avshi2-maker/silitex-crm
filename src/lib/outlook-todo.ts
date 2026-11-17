// outlook-todo.ts (src/lib/outlook-todo.ts) · created 17.11.2026 17:55 (Asia/Jerusalem) — v1.18.0 ✅ Microsoft To Do ⇄ CRM tasks · 📅 tasks → Outlook calendar — server only
// A. syncTodo (needs Tasks.ReadWrite, granted on ONE reconnect): every open To Do task (all your lists except "Flagged email")
//    → a CRM task: a Silitex link / #SPR-#### / /leads/<id> in the title or note → Silitex task on that customer (shows in Silitex My day + Hub);
//    anything else → Sapirim Hub task (workspace "outlook"). Title / due changes follow. Ticked ✓ in To Do → closed here;
//    ticked ✓ here (Silitex or Hub) → marked completed in To Do. Mapping: sh_todo_map. Nothing is ever deleted.
// B. syncCalendarTasks (Calendars.ReadWrite, already granted): open business tasks due today … +14 days (Silitex tasks + Hub tasks except 🛠 dev)
//    → an all-day "✅ <task>" item in your Outlook calendar (shown as free, no reminder). Due moves → item moves. Task done → item renamed
//    "✔ בוצע — …"; task gone → "✖ בוטל — …" (never deleted). Mapping: sh_cal_map.
import { createHash } from "crypto";
import { accessToken, calendarGranted, tasksGranted } from "./outlook";
import { serviceClient } from "./server-data";

const G = "https://graph.microsoft.com/v1.0";
const TZ = "Asia/Jerusalem";
const H = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 16);
const ilDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const today = () => ilDay(new Date());
const plusDays = (iso: string, n: number) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
type Sb = NonNullable<ReturnType<typeof serviceClient>>;

async function graph(tok: string, path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; j: Record<string, unknown> }> {
  const r = await fetch(path.startsWith("http") ? path : G + path, { ...init, headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json", ...(init?.headers || {}) }, cache: "no-store" });
  const j = r.status === 204 ? {} : ((await r.json().catch(() => ({}))) as Record<string, unknown>);
  return { ok: r.ok, status: r.status, j };
}

type TodoTask = { id: string; title?: string; status?: string; body?: { content?: string }; dueDateTime?: { dateTime: string; timeZone: string } | null; linkedResources?: { webUrl?: string }[] };
/** To Do due → Israel date (To Do usually stores midnight Israel as 22:00 UTC the day before) */
function dueOf(t: TodoTask): string {
  const d = t.dueDateTime; if (!d?.dateTime) return today();
  if (/^utc$/i.test(d.timeZone || "")) return ilDay(new Date(d.dateTime.replace(/\.\d+$/, "") + "Z"));
  return d.dateTime.slice(0, 10);
}
const cleanTitle = (s: string) => s.replace(/https?:\/\/\S+/g, "").replace(/\s{2,}/g, " ").trim() || s.trim();

async function matchLead(sb: Sb, text: string): Promise<{ lead_id: string; lead_name: string } | null> {
  const spr = text.match(/SPR-\d{4}/i)?.[0]?.toUpperCase();
  if (spr) { const p = (await sb.from("projects").select("lead_id,lead_name").eq("id", spr).maybeSingle()).data; if (p?.lead_id) return { lead_id: p.lead_id, lead_name: p.lead_name || spr }; }
  const lid = text.match(/silitex\.marble-art\.co\.il\/leads\/([\w-]+)/i)?.[1];
  if (lid) { const l = (await sb.from("leads").select("id,name").eq("id", lid).maybeSingle()).data; if (l?.id) return { lead_id: l.id, lead_name: l.name || lid }; }
  if (/silitex\.marble-art\.co\.il/i.test(text)) return { lead_id: "silitex", lead_name: "Silitex" };
  return null;
}

/** A. Microsoft To Do ⇄ CRM tasks */
export async function syncTodo(): Promise<Record<string, number | string>> {
  if (!(await tasksGranted())) return { todo: "no-permission (reconnect Outlook once)" };
  const sb = serviceClient(); if (!sb) return { todo: "no-supabase" };
  const tok = await accessToken(); const rep = { lists: 0, open: 0, added: 0, updated: 0, closedHere: 0, completedInTodo: 0 };
  const lists = (((await graph(tok, "/me/todo/lists?$top=50")).j.value || []) as { id: string; wellknownListName?: string }[]).filter((l) => l.wellknownListName !== "flaggedEmails");
  rep.lists = lists.length;
  const open = new Map<string, { list: string; t: TodoTask }>();
  for (const l of lists) {
    let url: string | null = `/me/todo/lists/${encodeURIComponent(l.id)}/tasks?$filter=status ne 'completed'&$top=100&$expand=linkedResources`;
    for (let page = 0; url && page < 5; page++) { const r = await graph(tok, url); if (!r.ok) break; for (const t of (r.j.value || []) as TodoTask[]) open.set(t.id, { list: l.id, t }); url = (r.j["@odata.nextLink"] as string) || null; }
  }
  rep.open = open.size;
  const maps = ((await sb.from("sh_todo_map").select("*").limit(5000)).data || []) as { todo_id: string; list_id: string; target: string; ref: string; title: string | null; due: string | null; done: boolean }[];
  const byId = new Map(maps.map((m) => [m.todo_id, m]));
  const now = new Date().toISOString();
  // new / changed open To Do tasks → CRM
  for (const [id, { list, t }] of open) {
    const raw = String(t.title || "").trim(); if (!raw) continue;
    const text = [raw, t.body?.content || "", ...(t.linkedResources || []).map((x) => x.webUrl || "")].join(" ");
    const title = cleanTitle(raw).slice(0, 300); const due = dueOf(t); const m = byId.get(id);
    if (!m) {
      const lead = await matchLead(sb, text);
      if (lead) { const ref = "todo-" + H(id); const e = await sb.from("tasks").insert({ id: ref, lead_id: lead.lead_id, lead_name: lead.lead_name, title: "📝 " + title, due, cadence: "once", done: false, kind: "todo" }); if (e.error) continue; await sb.from("sh_todo_map").insert({ todo_id: id, list_id: list, target: "sx", ref, title, due }); }
      else { const e = await sb.from("sh_tasks").insert({ workspace: "outlook", title: "📝 " + title, due, source: "outlook-todo", ext_key: "todo:" + H(id) }).select("id").single(); if (e.error || !e.data) continue; await sb.from("sh_todo_map").insert({ todo_id: id, list_id: list, target: "hub", ref: e.data.id, title, due }); }
      rep.added++; continue;
    }
    if (m.done) continue;
    if (m.title !== title || m.due !== due) {
      if (m.target === "sx") await sb.from("tasks").update({ title: "📝 " + title, due }).eq("id", m.ref); else await sb.from("sh_tasks").update({ title: "📝 " + title, due }).eq("id", m.ref);
      await sb.from("sh_todo_map").update({ title, due, list_id: list, updated_at: now }).eq("todo_id", id); rep.updated++;
    }
  }
  // ticked in the CRM → complete in To Do · ticked / removed in To Do → close in the CRM
  for (const m of maps.filter((x) => !x.done)) {
    const doneHere = m.target === "sx" ? (await sb.from("tasks").select("done").eq("id", m.ref).maybeSingle()).data?.done : (await sb.from("sh_tasks").select("done").eq("id", m.ref).maybeSingle()).data?.done;
    if (doneHere) {
      if (open.has(m.todo_id)) await graph(tok, `/me/todo/lists/${encodeURIComponent(m.list_id)}/tasks/${encodeURIComponent(m.todo_id)}`, { method: "PATCH", body: JSON.stringify({ status: "completed" }) });
      await sb.from("sh_todo_map").update({ done: true, updated_at: now }).eq("todo_id", m.todo_id); rep.completedInTodo++; continue;
    }
    if (!open.has(m.todo_id)) {
      const r = await graph(tok, `/me/todo/lists/${encodeURIComponent(m.list_id)}/tasks/${encodeURIComponent(m.todo_id)}?$select=status`);
      if (r.status === 404 || (r.ok && r.j.status === "completed")) {
        if (m.target === "sx") await sb.from("tasks").update({ done: true }).eq("id", m.ref); else await sb.from("sh_tasks").update({ done: true, done_at: now }).eq("id", m.ref);
        await sb.from("sh_todo_map").update({ done: true, updated_at: now }).eq("todo_id", m.todo_id); rep.closedHere++;
      }
    }
  }
  return rep;
}

/** B. open business tasks → all-day items in the Outlook calendar */
export async function syncCalendarTasks(): Promise<Record<string, number | string>> {
  if (!(await calendarGranted())) return { calendar: "no-permission" };
  const sb = serviceClient(); if (!sb) return { calendar: "no-supabase" };
  const tok = await accessToken(); const t0 = today(); const end = plusDays(t0, 14); const rep = { tasks: 0, created: 0, moved: 0, done: 0, gone: 0 };
  const SX = "https://silitex.marble-art.co.il", HUB = "https://hub.marble-art.co.il";
  const [sx, hub, maps] = await Promise.all([
    sb.from("tasks").select("id,lead_id,lead_name,title,due,done").eq("done", false).gte("due", t0).lte("due", end).limit(200),
    sb.from("sh_tasks").select("id,workspace,title,due,done").eq("done", false).neq("workspace", "dev").gte("due", t0).lte("due", end).limit(200),
    sb.from("sh_cal_map").select("*").limit(2000),
  ]);
  type Want = { title: string; due: string; link: string };
  const want = new Map<string, Want>();
  for (const t of sx.data || []) want.set("sx:" + t.id, { title: t.title + (t.lead_name && t.lead_id !== "silitex" ? " · " + t.lead_name : ""), due: t.due, link: t.lead_id && t.lead_id !== "silitex" && !String(t.lead_id).startsWith("ct:") ? SX + "/leads/" + t.lead_id : SX + "/today" });
  for (const t of hub.data || []) want.set("hub:" + t.id, { title: t.title, due: t.due, link: HUB + "/tasks" });
  rep.tasks = want.size;
  const ev = (w: Want) => ({ subject: "✅ " + w.title.slice(0, 240), isAllDay: true, showAs: "free", isReminderOn: false, start: { dateTime: w.due + "T00:00:00", timeZone: TZ }, end: { dateTime: plusDays(w.due, 1) + "T00:00:00", timeZone: TZ }, body: { contentType: "text", content: "משימה מ-Sapirim (Silitex / Hub) — לפתיחה: " + w.link + "\nסגירת המשימה ב-CRM מסמנת כאן ✔." } });
  const now = new Date().toISOString(); const mapped = new Map(((maps.data || []) as { task_key: string; event_id: string; title: string | null; due: string | null }[]).map((m) => [m.task_key, m]));
  let calls = 0;
  for (const [k, w] of want) {
    if (calls > 60) break; const m = mapped.get(k);
    if (!m) { const r = await graph(tok, "/me/events", { method: "POST", body: JSON.stringify(ev(w)) }); calls++; if (r.ok && r.j.id) { await sb.from("sh_cal_map").insert({ task_key: k, event_id: String(r.j.id), title: w.title, due: w.due }); rep.created++; } continue; }
    if (m.due !== w.due || m.title !== w.title) { const r = await graph(tok, "/me/events/" + encodeURIComponent(m.event_id), { method: "PATCH", body: JSON.stringify(ev(w)) }); calls++; if (r.ok) { await sb.from("sh_cal_map").update({ title: w.title, due: w.due, updated_at: now }).eq("task_key", k); rep.moved++; } }
  }
  // mapped items no longer wanted: done → "✔ בוצע", deleted → "✖ בוטל"; moved beyond 14 days / still open → keep date in step; past & open → leave as is
  for (const [k, m] of mapped) {
    if (want.has(k) || calls > 60) continue;
    const [src, id] = [k.slice(0, k.indexOf(":")), k.slice(k.indexOf(":") + 1)];
    const row = src === "sx" ? (await sb.from("tasks").select("title,due,done").eq("id", id).maybeSingle()).data : (await sb.from("sh_tasks").select("title,due,done").eq("id", id).maybeSingle()).data;
    if (row && !row.done && row.due && row.due < t0) continue; // late & still open — the item stays on its day
    if (row && !row.done) { const w = { title: m.title || row.title, due: row.due, link: "" }; const r = await graph(tok, "/me/events/" + encodeURIComponent(m.event_id), { method: "PATCH", body: JSON.stringify({ start: ev(w).start, end: ev(w).end }) }); calls++; if (r.ok) await sb.from("sh_cal_map").update({ due: row.due, updated_at: now }).eq("task_key", k); continue; }
    const subject = (row?.done ? "✔ בוצע — " : "✖ בוטל — ") + (m.title || "");
    const r = await graph(tok, "/me/events/" + encodeURIComponent(m.event_id), { method: "PATCH", body: JSON.stringify({ subject: subject.slice(0, 250) }) }); calls++;
    if (r.ok || r.status === 404) { await sb.from("sh_cal_map").delete().eq("task_key", k); if (row?.done) rep.done++; else rep.gone++; } // only the mapping row
  }
  return rep;
}
