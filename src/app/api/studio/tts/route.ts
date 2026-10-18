// route.ts (src/app/api/studio/tts/route.ts) · updated 18.10.2026 19:20 (Asia/Jerusalem) — POST STUDIO voice-over: POST {text, lang, voice} → MP3 (OpenAI text-to-speech, key already in Vercel). Owner only (behind the PIN gate). Cost header X-Cost-USD for the meter.
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const maxDuration = 60;
const STYLE: Record<string, string> = { he: "Speak natural Israeli Hebrew, calm, confident, professional — an experienced industrial expert talking to plant engineers.", ru: "Speak natural Russian, calm and professional, like an experienced industrial expert.", en: "Speak clear neutral English, calm and professional, like an experienced industrial expert.", it: "Parla un italiano naturale, calmo e professionale, come un esperto industriale." };
export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY; if (!key) return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const text = String(b.text || "").trim().slice(0, 4000); if (text.length < 3) return NextResponse.json({ error: "no text" }, { status: 400 });
  const lang = ["he", "ru", "en", "it"].includes(b.lang) ? b.lang : "he"; const voice = ["ash", "onyx", "echo", "sage", "coral", "nova"].includes(b.voice) ? b.voice : "ash";
  const call = (model: string) => fetch("https://api.openai.com/v1/audio/speech", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" }, body: JSON.stringify(model === "tts-1-hd" ? { model, voice: voice === "ash" || voice === "sage" || voice === "coral" ? "onyx" : voice, input: text, response_format: "mp3" } : { model, voice, input: text, instructions: STYLE[lang], response_format: "mp3" }) });
  let r = await call("gpt-4o-mini-tts"); let model = "gpt-4o-mini-tts";
  if (!r.ok) { r = await call("tts-1-hd"); model = "tts-1-hd"; }
  if (!r.ok) { const e = await r.text(); return NextResponse.json({ error: "tts: " + e.slice(0, 200) }, { status: 502 }); }
  const buf = Buffer.from(await r.arrayBuffer());
  const cost = model === "tts-1-hd" ? (text.length / 1e6) * 30 : (text.length / 1e6) * 12 + 0.015 * Math.max(0.25, text.length / 900); // rough estimate
  return new Response(buf, { headers: { "Content-Type": "audio/mpeg", "X-Cost-USD": cost.toFixed(4), "X-Model": model, "Cache-Control": "no-store" } });
}
