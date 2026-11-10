// project-answer.ts (src/lib/project-answer.ts) · created 10.11.2026 13:30 (Asia/Jerusalem) — v1.10.0 🇮🇹 Silitex answer → project — server only
// Every new mail FROM silitex.it on a thread tagged with an open project is read once by Claude → JSON (grade, price, MOQ, lead time, pack,
// TDS / SDS, sample). Real data → saved on the project, stage → "TDS + הצעת מחיר", history line, 🔔 task "quote to the customer".
// No data (e.g. "we are at exhibitions") → only marked as read, a history line, nothing moves. Runs with the auto-open sweep.
import { ask } from "./ai";
import { fmtDate, todayIso } from "./format";
import { stageIdx } from "@/config/projects";
import type { Project, SilitexAnswer } from "./types";
import type { serviceClient } from "./server-data";
type SB = NonNullable<ReturnType<typeof serviceClient>>;

const PROMPT = `You read ONE e-mail from Silitex S.r.l. (Italian silicone producer) about a customer request. Reply with ONE line of JSON only, no prose:
{"has_answer":bool,"grade":"","price":"","currency":"","unit":"","moq":"","lead_time":"","pack":"","tds":bool,"sds":bool,"sample":"","notes":""}
has_answer = true ONLY if the mail gives at least one concrete item: a price, MOQ, lead time, recommended grade / product code, pack size, sample availability, or attached / offered TDS / SDS.
Polite / holding mails ("we are at exhibitions", "we will reply later", "thank you for the lead") → has_answer false, notes = one short English line of what they said.
Copy values exactly as written (numbers, currency, units). Empty string when not given. Never invent.`;

const parse = (t: string): (SilitexAnswer & { has_answer?: boolean }) | null => { try { const m = /\{[\s\S]*\}/.exec(t); return m ? JSON.parse(m[0]) : null; } catch { return null; } };
const QUOTE = /\n\s*(From:|-----\s*Original|On .{3,80} wrote:|מאת:)/i;

export async function readSilitexAnswers(sb: SB): Promise<string[]> {
  const open = ((await sb.from("projects").select("id,lead_id,lead_name,stage,version,history,answer_at,answer_msg,opened_at").in("stage", ["rfq", "silitex", "offer"])).data || []) as Project[];
  const done: string[] = [];
  for (const p of open) {
    const ths = ((await sb.from("threads").select("id,dept").contains("refs", { project: p.id })).data || []).filter((t) => t.dept !== "il");
    if (!ths.length) continue;
    const since = p.answer_at || p.opened_at;
    const m = (await sb.from("hub_messages").select("id,at,from,body").in("thread_id", ths.map((t) => t.id)).eq("direction", "in").ilike("from", "%silitex.it%").gt("at", since).order("at", { ascending: false }).limit(1)).data?.[0];
    if (!m || m.id === p.answer_msg) continue;
    const body = String(m.body || "").split(QUOTE)[0].slice(0, 6000);
    let a: ReturnType<typeof parse> = null; try { a = parse((await ask(PROMPT, "Project #" + p.id + " · customer " + p.lead_name + "\nFrom: " + m.from + "\n\n" + body, 500, "en")).text); } catch { continue; }
    if (!a) continue;
    const who = String(m.from).replace(/<[^>]+>/g, "").split(" - ")[0].trim(); const now = new Date().toISOString(); const history = [...(p.history || [])];
    if (!a.has_answer) {
      history.push({ v: p.version, at: m.at, text: "🇮🇹 " + who + ": " + (a.notes || "עדכון בלי נתונים") });
      await sb.from("projects").update({ answer_msg: m.id, answer_at: m.at, history, updated_at: now }).eq("id", p.id); continue;
    }
    const { has_answer: _h, ...ans } = a; void _h;
    const answer: SilitexAnswer = { ...ans, from: who, at: m.at };
    const line = [ans.grade, ans.price && ans.price + " " + (ans.currency || "") + (ans.unit ? "/" + ans.unit : ""), ans.moq && "MOQ " + ans.moq, ans.lead_time && "LT " + ans.lead_time, ans.tds && "TDS", ans.sds && "SDS"].filter(Boolean).join(" · ");
    history.push({ v: p.version, at: m.at, text: "🇮🇹 תשובת Silitex (" + who + "): " + line });
    const stage = stageIdx("offer") > stageIdx(p.stage) ? "offer" : p.stage;
    if (stage !== p.stage) history.push({ v: p.version, at: now, text: "שלב: TDS + הצעת מחיר" });
    await sb.from("projects").update({ silitex_answer: answer, answer_msg: m.id, answer_at: m.at, stage, history, updated_at: now }).eq("id", p.id);
    const stamp = Date.now().toString(36);
    await sb.from("tasks").insert({ id: "task-prj-" + p.id + "-ans-" + stamp, lead_id: p.lead_id, lead_name: p.lead_name, title: "✉ הצעה ללקוח #" + p.id + " — תשובת Silitex הגיעה (" + fmtDate(m.at) + ")", due: todayIso(), cadence: "once", done: false, kind: "followup" });
    await sb.from("activities").insert({ id: "act-prj-" + p.id + "-ans-" + stamp, lead_id: p.lead_id, at: now, kind: "project", text: "🇮🇹 #" + p.id + " — תשובת Silitex: " + line });
    done.push(p.id);
  }
  return done;
}
