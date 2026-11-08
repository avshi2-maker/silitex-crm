// followup.ts (src/lib/followup.ts) · created 08.11.2026 07:10 (Asia/Jerusalem) — v1.6.0
// 🔔 Follow-up bot: reads the Hub (Outlook mails) per customer. When WE wrote last and the customer did not answer,
// a follow-up task "mailfollow@<created ISO>" is due N days after our mail. When the customer answers (newer than the task) → the task closes itself.
// Also builds the AI prompt for a friendly, professional reminder in the language of our last mail.
import type { HubMsg, Thread, Lead, Task } from "./types";

export const FOLLOW_KIND = "mailfollow";
export const isFollow = (t: Task) => (t.kind || "").startsWith(FOLLOW_KIND);
export const followKind = () => FOLLOW_KIND + "@" + new Date().toISOString();
export const followCreated = (t: Task) => (t.kind.split("@")[1] || "");
export const DAYS_KEY = "sx-follow-days";
export const DEFAULT_DAYS = 5;
export function followDays(): number { try { const n = Number(localStorage.getItem(DAYS_KEY)); return n > 0 ? n : DEFAULT_DAYS; } catch { return DEFAULT_DAYS; } }

const QUOTE = /\n\s*(From:|-----\s*Original|On .{3,80} wrote:|מאת:)/i;
const clean = (b: string) => (b || "").split(QUOTE)[0].trim();
const addr = (s: string) => ((s || "").match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [""])[0].toLowerCase();
/** our message? (Outlook "sent" copies sometimes arrive as "in" with an empty sender) */
export const isOurs = (m: HubMsg) => m.direction === "out" || /sapirim\.com/i.test(m.from || "") || (!m.from && !/sapirim\.com/i.test(m.to || ""));

export type Waiting = { lead: Lead; thread: Thread; lastOut: HubMsg; days: number; to: string; customerAt: string };
/** customers where our mail is the last word — one row per lead (its newest thread) */
export function waitingCustomers(leads: Lead[], threads: Thread[], msgs: HubMsg[]): Waiting[] {
  const out: Waiting[] = [];
  for (const l of leads) {
    const ths = threads.filter((t) => t.refs?.lead_id === l.id); if (!ths.length) continue;
    const ids = new Set(ths.map((t) => t.id));
    const ms = msgs.filter((m) => ids.has(m.thread_id)).sort((a, b) => a.at.localeCompare(b.at)); if (!ms.length) continue;
    const last = ms[ms.length - 1]; if (!isOurs(last)) continue;
    const cust = ms.filter((m) => !isOurs(m)); const to = addr(cust[cust.length - 1]?.from || "") || addr(last.to) || (l.contact_email || "").split(/[,;\s]/)[0];
    out.push({ lead: l, thread: ths.find((t) => t.id === last.thread_id) || ths[0], lastOut: last, days: Math.floor((Date.now() - new Date(last.at).getTime()) / 864e5), to, customerAt: cust[cust.length - 1]?.at || "" });
  }
  return out.sort((a, b) => b.days - a.days);
}
/** customer answered after this follow-up task was created → close it */
export function customerAnswered(t: Task, threads: Thread[], msgs: HubMsg[]): HubMsg | null {
  const since = followCreated(t); if (!since) return null;
  const ids = new Set(threads.filter((x) => x.refs?.lead_id === t.lead_id).map((x) => x.id));
  return msgs.filter((m) => ids.has(m.thread_id) && !isOurs(m) && m.at > since).sort((a, b) => b.at.localeCompare(a.at))[0] || null;
}

export function reminderContext(w: Waiting, n: number): string {
  return "CUSTOMER: " + w.lead.name + "\nCONTACT: " + (w.lead.contact_name || "—") + "\nOUR LAST MAIL (" + w.lastOut.at.slice(0, 10) + ", " + w.days + " days ago, no answer yet)\nSubject: " + w.thread.subject + "\n" + clean(w.lastOut.body).slice(0, 2500) + "\n\nREMINDER NUMBER: " + n;
}
export const REMINDER_PROMPT = "Write a short, friendly and professional follow-up e-mail from Avshi Sapir to the customer about OUR LAST MAIL, which has had no answer yet. Same language as OUR LAST MAIL.\n" +
  "- First line exactly: 'Subject: Re: <subject of our last mail>'.\n- Greet the contact by first name if known.\n- One sentence reminding what we sent (product / documents / samples), from OUR LAST MAIL only.\n" +
  "- Ask one easy question that moves things forward (had a chance to review? need a sample, TDS or a short call?).\n- Warm, no pressure, no guilt, no prices, no new claims. 60–110 words. Plain text, no Markdown.\n" +
  "- If REMINDER NUMBER is 3 or more: make it a polite last check-in that leaves the door open.\n- Signature: Avshi Sapir / Sapirim — Silitex Israel / +972-50-5231042 · avshi@sapirim.com (Hebrew mail: אבשי ספיר / ספירים — Silitex ישראל / 050-5231042 · avshi@sapirim.com).";
