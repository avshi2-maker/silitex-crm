// agent-guard.ts (src/lib/agent-guard.ts) · created 16.11.2026 19:50 (Asia/Jerusalem) — v1.14.1 🛡 guards for the 🤖 back-office agent — server only
// 1 SCREEN before any AI cost: no-reply / bounce / newsletter / bulk senders, oversize mails, flood (same sender > N mails a day) → card "🛡 blocked" (no AI, never retried)
// 2 BUDGET: today's agent AI spend capped (agent_state.daily_usd, default $1) · ⏸ pause switch · "run now" at most once a minute
// 3 INJECTION: the mail is fenced as untrusted data; the AI answer is CHECKED — mail actions may go only to addresses already known
//   (the sender, the customer card, the project's Silitex team, Silitex contacts), WhatsApp / call only to phone numbers already known,
//   links stripped from drafted texts, a stranger's mail can never open an order. Nothing is ever sent without Avshi's click.
import type { serviceClient } from "./server-data";
import type { AgentAction } from "./agent";
type SB = NonNullable<ReturnType<typeof serviceClient>>;

export type AgentState = { paused: boolean; daily_usd: number; per_sender_day: number; last_run: string | null };
export async function getState(sb: SB): Promise<AgentState> {
  const s = (await sb.from("agent_state").select("*").eq("id", "main").maybeSingle()).data;
  return { paused: !!s?.paused, daily_usd: Number(s?.daily_usd ?? 1), per_sender_day: Number(s?.per_sender_day ?? 3), last_run: s?.last_run || null };
}
/** start of today, Israel time, as ISO */
export const ilDayStart = () => { const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })); const off = new Date().getTime() - d.getTime(); d.setHours(0, 0, 0, 0); return new Date(d.getTime() + off).toISOString(); };
export async function spentToday(sb: SB): Promise<number> {
  const rows = (await sb.from("agent_items").select("usage").gte("created_at", ilDayStart())).data || [];
  return rows.reduce((a, r) => a + Number((r.usage as { cost_usd?: number } | null)?.cost_usd || 0), 0);
}
export const addr = (s = "") => (s.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/)?.[0] || "").toLowerCase();
const BULK_FROM = /(no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounce|notifications?@|newsletter|news@|marketing@|info@.*(linkedin|facebook|google|microsoft|amazon)|@(.*\.)?(linkedin|facebookmail|mailchimp|sendgrid|hubspot|mailgun|amazonses)\.)/i;
const BULK_BODY = /(unsubscribe|הסר(ה)? מרשימת|להסרה מרשימ|view (this|in) (email|browser)|you are receiving this)/i;
/** returns a Hebrew reason when the mail must NOT reach the AI, else null */
export function screen(m: { from: string; body: string; subject?: string }, known: boolean, sentToday: number, perSender: number): string | null {
  if (BULK_FROM.test(m.from || "")) return "שולח אוטומטי / דיוור (no-reply, newsletter)";
  if (!known && BULK_BODY.test(m.body || "")) return "דיוור שיווקי (unsubscribe) משולח לא מוכר";
  if ((m.body || "").length > 60000) return "מייל ענק (" + Math.round((m.body || "").length / 1000) + "K תווים) — לא נשלח ל-AI";
  if (sentToday >= perSender) return "הצפה: יותר מ-" + perSender + " מיילים מאותו שולח היום";
  return null;
}
const URL = /\b(https?:\/\/|www\.)[^\s)]+/gi;
const digits = (s = "") => s.replace(/\D/g, "").replace(/^972/, "0");
/** keep only actions that go to known people; strip links; WhatsApp / call only to known numbers */
export function checkActions(actions: AgentAction[], allowedMail: Set<string>, allowedPhones: Set<string>): { ok: AgentAction[]; dropped: number } {
  let dropped = 0; const ok: AgentAction[] = [];
  for (const a of actions.slice(0, 3)) {
    const clean = { ...a, body: (a.body || "").replace(URL, "[קישור הוסר]").slice(0, 4000), subject: (a.subject || "").slice(0, 200), title: (a.title || "").slice(0, 160) };
    if (a.kind === "mail_customer" || a.kind === "mail_silitex") {
      const to = (a.to || "").split(/[;,]/).map(addr).filter(Boolean); const cc = (a.cc || "").split(/[;,]/).map(addr).filter(Boolean);
      if (!to.length || !to.every((x) => allowedMail.has(x))) { dropped++; continue; }
      ok.push({ ...clean, to: to.join("; "), cc: cc.filter((x) => allowedMail.has(x)).join("; ") }); continue;
    }
    if (a.kind === "whatsapp" || a.kind === "call") { if (!a.phone || !allowedPhones.has(digits(a.phone))) { dropped++; continue; } ok.push(clean); continue; }
    if (a.kind === "task") { ok.push(clean); continue; }
    dropped++;
  }
  return { ok, dropped };
}
export const phoneSet = (...ps: (string | null | undefined)[]) => new Set(ps.filter(Boolean).map((p) => digits(String(p))).filter((d) => d.length >= 9));
