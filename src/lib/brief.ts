// brief.ts (src/lib/brief.ts) · updated 09.10.2026 10:30 (Asia/Jerusalem) — server only
// One function used by both the cron and the manual button: data → Claude → (optional) WhatsApp send.
import { ask } from "./ai";
import { getLeadsAndTasks } from "./server-data";
import { sendWhatsApp, type SendResult } from "./whatsapp";
import { briefContext, BRIEF_PROMPT } from "@/prompts/brief";
import { todayIso } from "./format";
import type { Usage } from "./types";
export async function runDailyBrief(send: boolean, lang: "he" | "en" = "he"): Promise<{ text: string; usage: Usage; source: string; delivery?: SendResult }> {
  const { leads, tasks, source } = await getLeadsAndTasks();
  const { text, usage } = await ask(BRIEF_PROMPT, briefContext(leads, tasks, todayIso()), 700, lang);
  const delivery = send ? await sendWhatsApp(text) : undefined;
  return { text, usage, source, delivery };
}
