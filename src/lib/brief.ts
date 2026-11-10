// brief.ts (src/lib/brief.ts) · updated 10.11.2026 14:20 (Asia/Jerusalem) — v1.10.0 📁 projects block (stalled ⏰ / new Silitex answer 🇮🇹) added after the AI text, from real data · 26.10.2026 07:20 — v0.97.0 day name + date set by the code in Israel time (the AI wrote "יום שלישי" on a Monday) · 16.10.2026 18:45 — + ru · 09.10.2026 10:30 (Asia/Jerusalem) — server only
// One function used by both the cron and the manual button: data → Claude → (optional) WhatsApp send.
import { ask } from "./ai";
import { getLeadsAndTasks, serviceClient } from "./server-data";
import { stallInfo } from "./projects";
import { stageOf, ENDED } from "@/config/projects";
import type { Project } from "./types";
import { sendWhatsApp, type SendResult } from "./whatsapp";
import { briefContext, BRIEF_PROMPT } from "@/prompts/brief";
import { fmtDate } from "./format";
import type { Usage } from "./types";
export async function runDailyBrief(send: boolean, lang: "he" | "en" | "it" | "ru" = "he"): Promise<{ text: string; usage: Usage; source: string; delivery?: SendResult }> {
  const { leads, tasks, source } = await getLeadsAndTasks();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date()); // YYYY-MM-DD in Israel
  const loc = { he: "he-IL", en: "en-GB", it: "it-IT", ru: "ru-RU" }[lang]; const day = new Intl.DateTimeFormat(loc, { weekday: "long", timeZone: "Asia/Jerusalem" }).format(new Date());
  const hello = { he: "☀️ בוקר טוב", en: "☀️ Good morning", it: "☀️ Buongiorno", ru: "☀️ Доброе утро" }[lang];
  const { text: body, usage } = await ask(BRIEF_PROMPT, briefContext(leads, tasks, today), 700, lang);
  const text = hello + " · " + day + " " + fmtDate(today) + "\n\n" + body.replace(/^\s*#*\s*[^\n]*(בוקר טוב|good morning|buongiorno|доброе утро)[^\n]*\n+/i, "").trim();
  const prj = await projectLines(); const full = prj ? text + "\n\n" + prj : text;
  const delivery = send ? await sendWhatsApp(full) : undefined;
  return { text: full, usage, source, delivery };
}
/** 📁 projects that need you today: ⏰ stalled over the stage limit, 🇮🇹 Silitex answered in the last 24 h (real data, no AI) */
async function projectLines(): Promise<string> {
  const sb = serviceClient(); if (!sb) return "";
  const ps = ((await sb.from("projects").select("id,lead_name,stage,history,opened_at,updated_at,hold_until,answer_at,silitex_answer")).data || []) as Project[];
  const open = ps.filter((p) => !ENDED.includes(p.stage)); const day = Date.now() - 864e5;
  const lines = open.flatMap((p) => { const st = stallInfo(p); const out: string[] = [];
    if (p.silitex_answer && p.answer_at && new Date(p.answer_at).getTime() > day) out.push("🇮🇹 #" + p.id + " " + p.lead_name + " — תשובת Silitex הגיעה → הצעה ללקוח");
    if (st.stalled) out.push("⏰ #" + p.id + " " + p.lead_name + " — " + stageOf(p.stage).he + " " + st.days + " ימים");
    return out; });
  return lines.length ? "📁 פרויקטים (" + open.length + " פתוחים)\n" + lines.join("\n") : "";
}
