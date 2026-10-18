// whisper.ts (src/lib/whisper.ts) · updated 18.10.2026 06:40 (Asia/Jerusalem) — server only. Speech-to-text via OpenAI Whisper (OPENAI_API_KEY). Cost ≈ $0.006 per minute.
export const WHISPER_USD_PER_MIN = 0.006;
export async function transcribe(url: string, filename = "audio.mp3"): Promise<string> {
  const key = process.env.OPENAI_API_KEY; if (!key) throw new Error("OPENAI_API_KEY missing in Vercel");
  const bin = await fetch(url); if (!bin.ok) throw new Error("audio fetch " + bin.status);
  const blob = await bin.blob(); if (blob.size > 24_500_000) throw new Error("recording too long for one transcription (max ~60 min)");
  const fd = new FormData(); fd.append("file", blob, filename); fd.append("model", "whisper-1"); fd.append("response_format", "text");
  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: "Bearer " + key }, body: fd });
  if (!r.ok) throw new Error("Whisper " + r.status + ": " + (await r.text()).slice(0, 200));
  return (await r.text()).trim();
}
