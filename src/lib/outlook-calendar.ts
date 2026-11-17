// outlook-calendar.ts (src/lib/outlook-calendar.ts) · created 16.11.2026 21:15 (Asia/Jerusalem) — v1.15.0 📅 Outlook calendar through the CRM's existing Microsoft connection — server only
// freeSlots: busy times (next 7 days) → free 1-hour slots on working days (Sun–Thu 09:00–17:00, Fri 09:00–13:00, Israel time) for the 🤖 agent
// createEvent: an event in YOUR calendar; attendees get an Outlook invitation ONLY when invite = true (that is your click). No calendar permission yet → clear error.
import { accessToken, calendarGranted } from "./outlook";

const TZ = "Asia/Jerusalem";
const pad = (n: number) => String(n).padStart(2, "0");
/** Israel wall-clock parts for a Date */
const il = (d: Date) => { const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false }).formatToParts(d).map((x) => [x.type, x.value])); return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, min: +p.minute, wd: p.weekday as string }; };
/** "2026-11-18T10:00" Israel wall time → Date */
export function ilToDate(local: string): Date { const guess = new Date(local + ":00Z"); const w = il(guess); const diff = (Date.UTC(w.y, w.m - 1, w.d, w.h, w.min) - guess.getTime()); return new Date(guess.getTime() - diff); }
const local = (d: Date) => { const w = il(d); return w.y + "-" + pad(w.m) + "-" + pad(w.d) + "T" + pad(w.h) + ":" + pad(w.min); };

export async function freeSlots(days = 7, max = 8): Promise<string[]> {
  if (!(await calendarGranted())) return [];
  const tok = await accessToken(); const start = new Date(); const end = new Date(Date.now() + days * 864e5);
  const r = await fetch("https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=" + start.toISOString() + "&endDateTime=" + end.toISOString() + "&$select=start,end,showAs&$top=200", { headers: { Authorization: "Bearer " + tok, Prefer: 'outlook.timezone="UTC"' } });
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || "calendar error");
  const busy = ((j.value || []) as { start: { dateTime: string }; end: { dateTime: string }; showAs?: string }[]).filter((e) => e.showAs !== "free").map((e) => [new Date(e.start.dateTime + "Z").getTime(), new Date(e.end.dateTime + "Z").getTime()]);
  const out: string[] = [];
  for (let i = 0; i <= days && out.length < max; i++) {
    const day = new Date(Date.now() + i * 864e5); const w = il(day); if (w.wd === "Sat") continue;
    const last = w.wd === "Fri" ? 12 : 16;
    for (let h = 9; h <= last && out.length < max; h++) {
      const s = ilToDate(w.y + "-" + pad(w.m) + "-" + pad(w.d) + "T" + pad(h) + ":00"); const e = s.getTime() + 36e5;
      if (s.getTime() < Date.now() + 2 * 36e5) continue; // at least 2 hours from now
      if (busy.some(([b0, b1]) => s.getTime() < b1 && e > b0)) continue;
      out.push(local(s)); h += 1; // spread the offers
    }
  }
  return out;
}

export type MeetingDraft = { subject: string; start: string; end?: string; attendees?: string; location?: string; body?: string };
/** creates the event; invite = false → only in your calendar (attendees listed in the text), true → Outlook sends the invitations */
export async function createEvent(m: MeetingDraft, invite: boolean): Promise<{ id: string; link: string }> {
  if (!(await calendarGranted())) throw new Error("אין עדיין הרשאת יומן — חבר מחדש את Outlook פעם אחת");
  const tok = await accessToken(); const s = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(m.start) ? m.start.slice(0, 16) : ""; if (!s) throw new Error("bad start time");
  const e = m.end && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(m.end) ? m.end.slice(0, 16) : local(new Date(ilToDate(s).getTime() + 36e5));
  const people = (m.attendees || "").split(/[;,]/).map((x) => x.trim()).filter((x) => /@/.test(x));
  const body = { subject: m.subject.slice(0, 250), start: { dateTime: s + ":00", timeZone: TZ }, end: { dateTime: e + ":00", timeZone: TZ }, location: { displayName: m.location || "" },
    body: { contentType: "text", content: (m.body || "") + (people.length && !invite ? "\n\nמשתתפים (לא נשלחה הזמנה): " + people.join(", ") : "") },
    ...(invite && people.length ? { attendees: people.map((a) => ({ emailAddress: { address: a }, type: "required" })) } : {}) };
  const r = await fetch("https://graph.microsoft.com/v1.0/me/events", { method: "POST", headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || "event error"); return { id: j.id, link: j.webLink };
}

export type DayEvent = { subject: string; start: string; end: string; allDay: boolean; location: string; link: string; online: string };
/** 📅 v1.16.0 (17.11.2026) — your Outlook events from today 00:00 (Israel) for `days` days, for the Sapirim Hub "My day" + 08:00 push. Read-only. */
export async function dayEvents(days = 1): Promise<DayEvent[] | null> {
  if (!(await calendarGranted())) return null;
  const tok = await accessToken(); const w = il(new Date());
  const start = ilToDate(w.y + "-" + pad(w.m) + "-" + pad(w.d) + "T00:00"); const end = new Date(start.getTime() + Math.max(1, Math.min(14, days)) * 864e5);
  const r = await fetch("https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=" + start.toISOString() + "&endDateTime=" + end.toISOString() + "&$select=subject,start,end,isAllDay,location,webLink,showAs,isCancelled,onlineMeeting&$orderby=start/dateTime&$top=100", { headers: { Authorization: "Bearer " + tok, Prefer: 'outlook.timezone="UTC"' } });
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || "calendar error");
  type E = { subject?: string; start: { dateTime: string }; end: { dateTime: string }; isAllDay?: boolean; location?: { displayName?: string }; webLink?: string; isCancelled?: boolean; onlineMeeting?: { joinUrl?: string } | null };
  return ((j.value || []) as E[]).filter((e) => !e.isCancelled).map((e) => ({ subject: e.subject || "(ללא נושא)", start: local(new Date(e.start.dateTime + "Z")), end: local(new Date(e.end.dateTime + "Z")), allDay: !!e.isAllDay, location: e.location?.displayName || "", link: e.webLink || "", online: e.onlineMeeting?.joinUrl || "" }));
}
