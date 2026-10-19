// route.ts (src/app/api/studio/tts/route.ts) · updated 19.10.2026 06:10 (Asia/Jerusalem) — + ElevenLabs (Eleven v3 — the only ElevenLabs model with Hebrew) as main engine, OpenAI as fallback · GET = which engines are set + your ElevenLabs voices · 18.10.2026 19:20 — POST STUDIO voice-over: POST {text, lang, voice, engine} → MP3. Owner only (behind the PIN gate). Cost header X-Cost-USD for the meter.
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const maxDuration = 60;
const XI = "https://api.elevenlabs.io/v1";
const EL_RATE = 0.10 / 1000; // USD per character, Eleven v3 (≈ 1 credit per character)
const STYLE: Record<string, string> = { he: "Speak natural Israeli Hebrew, calm, confident, professional — an experienced industrial expert talking to plant engineers.", ru: "Speak natural Russian, calm and professional, like an experienced industrial expert.", en: "Speak clear neutral English, calm and professional, like an experienced industrial expert.", it: "Parla un italiano naturale, calmo e professionale, come un esperto industriale." };
export async function GET() {
  const key = process.env.ELEVENLABS_API_KEY;
  const out = { eleven: !!key, openai: !!process.env.OPENAI_API_KEY, voices: [] as { id: string; name: string; info: string }[], error: "" };
  if (key) {
    try {
      const r = await fetch(XI + "/voices", { headers: { "xi-api-key": key }, cache: "no-store" });
      const j = await r.json();
      if (!r.ok) out.error = j?.detail?.message || j?.detail?.status || "ElevenLabs " + r.status;
      out.voices = (j.voices || []).map((v: { voice_id: string; name: string; labels?: Record<string, string>; category?: string }) => ({ id: v.voice_id, name: v.name, info: [v.labels?.gender, v.labels?.accent, v.labels?.language, v.category].filter(Boolean).join(" · ") }));
    } catch (e) { out.error = e instanceof Error ? e.message : "error"; }
  }
  return NextResponse.json(out);
}
async function eleven(key: string, text: string, lang: string, voice: string) {
  const call = (withLang: boolean) => fetch(XI + "/text-to-speech/" + encodeURIComponent(voice) + "?output_format=mp3_44100_128", { method: "POST", headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" }, body: JSON.stringify({ text, model_id: "eleven_v3", ...(withLang ? { language_code: lang } : {}), voice_settings: { stability: 0.5, similarity_boost: 0.75 } }) });
  let r = await call(true);
  if (r.status === 400 || r.status === 422) r = await call(false);
  return r;
}
async function openai(key: string, text: string, lang: string, voice: string) {
  const call = (model: string) => fetch("https://api.openai.com/v1/audio/speech", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" }, body: JSON.stringify(model === "tts-1-hd" ? { model, voice: ["ash", "sage", "coral"].includes(voice) ? "onyx" : voice, input: text, response_format: "mp3" } : { model, voice, input: text, instructions: STYLE[lang], response_format: "mp3" }) });
  const r = await call("gpt-4o-mini-tts");
  return r.ok ? r : call("tts-1-hd");
}
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const text = String(b.text || "").trim().slice(0, 3000); if (text.length < 3) return NextResponse.json({ error: "no text" }, { status: 400 });
  const lang = ["he", "ru", "en", "it"].includes(b.lang) ? b.lang : "he";
  const elKey = process.env.ELEVENLABS_API_KEY, oaKey = process.env.OPENAI_API_KEY;
  const engine = b.engine === "openai" || !elKey ? "openai" : "eleven";
  let r: Response; let cost: number;
  if (engine === "eleven") { r = await eleven(elKey!, text, lang, String(b.voice || "JBFqnCBsd6RMkjVDRZzb")); cost = text.length * EL_RATE; }
  else { if (!oaKey) return NextResponse.json({ error: "no voice engine configured" }, { status: 503 }); r = await openai(oaKey, text, lang, String(b.voice || "ash")); cost = (text.length / 1e6) * 15 + 0.01; }
  if (!r.ok) { const e = await r.text(); let m = e; try { const j = JSON.parse(e); m = j?.detail?.message || j?.detail?.status || j?.error?.message || e; } catch {} return NextResponse.json({ error: engine + ": " + String(m).slice(0, 220) }, { status: 502 }); }
  const buf = Buffer.from(await r.arrayBuffer());
  return new Response(buf, { headers: { "Content-Type": "audio/mpeg", "X-Cost-USD": cost.toFixed(4), "X-Engine": engine, "X-Chars": String(text.length), "Cache-Control": "no-store" } });
}
