// brief.ts (src/lib/brief.ts) · updated 26.10.2026 07:20 (Asia/Jerusalem) — v0.97.0 day name + date set by the code in Israel time (the AI wrote "יום שלישי" on a Monday) · 16.10.2026 18:45 — + ru · 09.10.2026 10:30 (Asia/Jerusalem) — server only
// One function used by both the cron and the manual button: data → Claude → (optional) WhatsApp send.
import { ask } from "./ai";
import { getLeadsAndTasks } from "./server-data";
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
  const delivery = send ? await sendWhatsApp(text) : undefined;
  return { text, usage, source, delivery };
}
