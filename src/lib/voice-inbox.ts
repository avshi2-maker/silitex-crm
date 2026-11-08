// voice-inbox.ts (src/lib/voice-inbox.ts) · updated 08.11.2026 18:58 step trail in hub_tokens (id voice) · created 08.11.2026 18:45 (Asia/Jerusalem) — v1.9.0
// 🎙️ Avshi → the bot number (WhatsApp): a voice note is transcribed here (Whisper, OPENAI_API_KEY), a text note goes as is →
// sent to the Sapirim Hub (/api/wa/owner), which turns it into tasks in the right CRM → the Hub's answer is sent back on WhatsApp
// (the 24 h window is open because Avshi just wrote). Runs AFTER the webhook answered Meta (no retries / timeouts).
import { transcribe, WHISPER_USD_PER_MIN } from "./whisper";
import { audioUrl } from "./cloudinary";
import { sendWhatsApp, note } from "./whatsapp";
import { HUB_URL } from "./hub-forward";

export async function ownerNote(m: { id: string; type: string; body: string; media_url: string | null; at: string }): Promise<void> {
  const key = process.env.HUB_WA_KEY; if (!key) return;
  let text = m.body || ""; let transcribed = false; let whisperUsd = 0;
  try {
    await note("voice", "2 started " + m.type);
    if (m.type === "audio" && m.media_url) { text = await transcribe(audioUrl({ secure_url: m.media_url })); transcribed = true; whisperUsd = Math.max(0.001, (text.length / 900) * WHISPER_USD_PER_MIN); }
    await note("voice", "3 text " + text.length + " chars" + (transcribed ? " (transcribed)" : ""));
    if (text.trim().length < 3) return;
    const r = await fetch(HUB_URL() + "/api/wa/owner", { method: "POST", headers: { "content-type": "application/json", "x-hub-wa-key": key }, body: JSON.stringify({ id: m.id, text, transcribed, media_url: m.media_url, at: m.at, whisper_usd: whisperUsd }), signal: AbortSignal.timeout(50000), cache: "no-store" });
    const j = await r.json().catch(() => ({})) as { ok?: boolean; reply?: string; error?: string };
    await note("voice", "4 hub " + r.status + " " + (j.ok ? "ok" : String(j.error || "")).slice(0, 150));
    if (j.reply) await sendWhatsApp(j.reply);
    else if (!r.ok || !j.ok) await sendWhatsApp("⚠ ה-Hub לא עיבד את ההודעה: " + (j.error || r.status));
  } catch (e) { await note("voice", "✗ " + (e instanceof Error ? e.message : "error").slice(0, 200)); await sendWhatsApp("⚠ תיבת הקול: " + (e instanceof Error ? e.message : "שגיאה")).catch(() => {}); }
}
