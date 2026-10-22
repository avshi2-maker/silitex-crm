// ai.ts (src/lib/ai.ts) · updated 22.10.2026 07:35 (Asia/Jerusalem) — ask(): optional timeout (scan stays inside the server limit) · 18.10.2026 17:45 — + lang "any" (multi-language tasks, e.g. Post Studio) · 06:30 — + askImage (card scan), askImageUrl (Cloudinary photos) · 16.10.2026 18:45 — + Russian answers · 09.10.2026 10:30 (Asia/Jerusalem)  — server only
// One Claude entry point. Without ANTHROPIC_API_KEY it returns a deterministic demo answer with simulated usage so the meter + export bar still work.
import Anthropic from "@anthropic-ai/sdk";
import { MODEL, costUsd } from "./pricing";
import type { Usage } from "./types";

import { SYSTEM } from "@/prompts/system";

export async function ask(prompt: string, context?: string, maxTokens = 1200, lang: "he" | "en" | "it" | "ru" | "any" = "he", timeoutMs?: number): Promise<{ text: string; usage: Usage }> {
  const system = lang === "any" ? SYSTEM + "\n\nIMPORTANT: ignore the default language above — write every text exactly in the language the task specifies for it (the task may ask for several languages: Hebrew, Russian, English, Italian). Product names, codes and INCI stay as written." : lang === "en" ? SYSTEM + "\n\nIMPORTANT: respond in English (the reader is an international partner)." : lang === "it" ? SYSTEM + "\n\nIMPORTANTE: rispondi in italiano (il lettore è il personale Silitex in Italia)." : lang === "ru" ? SYSTEM + "\n\nВАЖНО: отвечай на русском языке (читатель — русскоязычный технолог/техник в Израиле). Названия продуктов, коды и INCI не переводи." : SYSTEM;
  const key = process.env.ANTHROPIC_API_KEY;
  const user = context ? "הקשר:\n" + context + "\n\n---\nמשימה:\n" + prompt : prompt;
  if (!key) {
    const inTok = Math.ceil(user.length / 3.2), outTok = 320;
    return { text: demo(prompt, lang === "any" ? "en" : lang), usage: { input_tokens: inTok, output_tokens: outTok, cost_usd: costUsd(MODEL, inTok, outTok), model: MODEL, mock: true } };
  }
  const client = new Anthropic({ apiKey: key });
  const res = await client.messages.create({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }, timeoutMs ? { timeout: timeoutMs, maxRetries: 0 } : undefined);
  const text = res.content.map((c) => ("text" in c ? c.text : "")).join("\n");
  const u = res.usage;
  return { text, usage: { input_tokens: u.input_tokens, output_tokens: u.output_tokens, cost_usd: costUsd(MODEL, u.input_tokens, u.output_tokens), model: MODEL } };
}

/** vision call (business-card scan): one image + instruction → text */
export async function askImage(prompt: string, dataBase64: string, mediaType: "image/jpeg" | "image/png" | "image/webp", maxTokens = 800): Promise<{ text: string; usage: Usage }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { text: "{}", usage: { input_tokens: 0, output_tokens: 0, cost_usd: 0, model: MODEL, mock: true } };
  const client = new Anthropic({ apiKey: key });
  const res = await client.messages.create({ model: MODEL, max_tokens: maxTokens, messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: mediaType, data: dataBase64 } }, { type: "text", text: prompt }] }] });
  const text = res.content.map((c) => ("text" in c ? c.text : "")).join("\n"); const u = res.usage;
  return { text, usage: { input_tokens: u.input_tokens, output_tokens: u.output_tokens, cost_usd: costUsd(MODEL, u.input_tokens, u.output_tokens), model: MODEL } };
}

/** vision call on a public image URL (Cloudinary) */
export async function askImageUrl(prompt: string, url: string, maxTokens = 800): Promise<{ text: string; usage: Usage }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { text: "{}", usage: { input_tokens: 0, output_tokens: 0, cost_usd: 0, model: MODEL, mock: true } };
  const client = new Anthropic({ apiKey: key });
  const res = await client.messages.create({ model: MODEL, max_tokens: maxTokens, messages: [{ role: "user", content: [{ type: "image", source: { type: "url", url } }, { type: "text", text: prompt }] }] });
  const text = res.content.map((c) => ("text" in c ? c.text : "")).join("\n"); const u = res.usage;
  return { text, usage: { input_tokens: u.input_tokens, output_tokens: u.output_tokens, cost_usd: costUsd(MODEL, u.input_tokens, u.output_tokens), model: MODEL } };
}

function demo(prompt: string, lang: "he" | "en" | "it" | "ru"): string {
  if (lang === "ru") return "[Демо-режим — нет ANTHROPIC_API_KEY]\n\nClaude ответил бы на запрос:\n«" + prompt.slice(0, 160) + "»";
  if (lang === "it") return "[Modalità demo — manca ANTHROPIC_API_KEY]\n\nClaude risponderebbe alla richiesta:\n«" + prompt.slice(0, 160) + "»";
  if (lang === "en") return "[Demo mode — no ANTHROPIC_API_KEY in .env.local]\n\nClaude would answer the request:\n«" + prompt.slice(0, 160) + (prompt.length > 160 ? "…" : "") + "»\n\n1. Opening tailored to the customer's industry\n2. 2–3 recommended Silitex products + the Dow/Wacker product they replace\n3. Commercial edge: local stock, price, FDA/Kosher approvals\n4. CTA: free sample / technical meeting\n\nAvshi Sapir · 050-5231042";
  return "[מצב דמו — אין ANTHROPIC_API_KEY ב-.env.local]\n\n" +
    "להלן מבנה התשובה שייווצר על ידי Claude עבור הבקשה:\n«" + prompt.slice(0, 160) + (prompt.length > 160 ? "…" : "") + "»\n\n" +
    "1. פתיח מותאם לתעשייה של הלקוח\n2. 2–3 מוצרי Silitex מומלצים + המקבילה של Dow/Wacker שהם מחליפים\n3. יתרון מסחרי: מלאי מקומי, מחיר, אישורי FDA/Kosher\n4. קריאה לפעולה: דגימה חינם / פגישה טכנית\n\nאבשי ספיר · 050-5231042";
}
