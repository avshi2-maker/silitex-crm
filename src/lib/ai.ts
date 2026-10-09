// ai.ts (src/lib/ai.ts) · updated 09.10.2026 09:40 (Asia/Jerusalem)  — server only
// One Claude entry point. Without ANTHROPIC_API_KEY it returns a deterministic demo answer with simulated usage so the meter + export bar still work.
import Anthropic from "@anthropic-ai/sdk";
import { MODEL, costUsd } from "./pricing";
import type { Usage } from "./types";

import { SYSTEM } from "@/prompts/system";

export async function ask(prompt: string, context?: string, maxTokens = 1200): Promise<{ text: string; usage: Usage }> {
  const key = process.env.ANTHROPIC_API_KEY;
  const user = context ? "הקשר:\n" + context + "\n\n---\nמשימה:\n" + prompt : prompt;
  if (!key) {
    const inTok = Math.ceil(user.length / 3.2), outTok = 320;
    return { text: demo(prompt), usage: { input_tokens: inTok, output_tokens: outTok, cost_usd: costUsd(MODEL, inTok, outTok), model: MODEL, mock: true } };
  }
  const client = new Anthropic({ apiKey: key });
  const res = await client.messages.create({ model: MODEL, max_tokens: maxTokens, system: SYSTEM, messages: [{ role: "user", content: user }] });
  const text = res.content.map((c) => ("text" in c ? c.text : "")).join("\n");
  const u = res.usage;
  return { text, usage: { input_tokens: u.input_tokens, output_tokens: u.output_tokens, cost_usd: costUsd(MODEL, u.input_tokens, u.output_tokens), model: MODEL } };
}

function demo(prompt: string): string {
  return "[מצב דמו — אין ANTHROPIC_API_KEY ב-.env.local]\n\n" +
    "להלן מבנה התשובה שייווצר על ידי Claude עבור הבקשה:\n«" + prompt.slice(0, 160) + (prompt.length > 160 ? "…" : "") + "»\n\n" +
    "1. פתיח מותאם לתעשייה של הלקוח\n2. 2–3 מוצרי Silitex מומלצים + המקבילה של Dow/Wacker שהם מחליפים\n3. יתרון מסחרי: מלאי מקומי, מחיר, אישורי FDA/Kosher\n4. קריאה לפעולה: דגימה חינם / פגישה טכנית\n\nאבשי ספיר · 050-5231042";
}
