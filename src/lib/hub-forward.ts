// hub-forward.ts (src/lib/hub-forward.ts) · created 08.11.2026 11:50 (Asia/Jerusalem) — v1.7.0
// 📲 WhatsApp → Sapirim Hub: every customer WhatsApp message (already normalised, media already on Cloudinary) is sent to the Hub,
// which sorts it to the right CRM (Silitex / Marble Art sinks / Artfloor / AI Architect / NutriClinic / epoxy).
// Returns null when the Hub is not configured or not reachable → the caller files it the old way (never lose a message).
import type { WaIn } from "./wa-inbound";
export const HUB_URL = () => (process.env.HUB_URL || "https://hub.marble-art.co.il").replace(/\/$/, "");
export const OWNER_WA = () => process.env.OWNER_WA || "972505231042"; // Avshi's own number — messages from it to the bot only open the 24 h window
export async function forwardToHub(m: WaIn): Promise<string | null> {
  const key = process.env.HUB_WA_KEY; if (!key) return null;
  try {
    const r = await fetch(HUB_URL() + "/api/wa/in", { method: "POST", headers: { "content-type": "application/json", "x-hub-wa-key": key }, body: JSON.stringify(m), signal: AbortSignal.timeout(15000), cache: "no-store" });
    const j = await r.json().catch(() => ({})) as { ok?: boolean; result?: string };
    return r.ok && j.ok ? String(j.result || "ok") : null;
  } catch { return null; }
}
