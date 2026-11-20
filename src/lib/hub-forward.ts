// hub-forward.ts (src/lib/hub-forward.ts) · updated 20.11.2026 08:55 (Asia/Jerusalem) — v1.21.0 ✉️ forwardMailsToHub (non-Silitex Outlook mail → Hub /api/wa/mail) · created 08.11.2026 11:50 — v1.7.0
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

/** ✉️ v1.21.0 incoming Outlook mails that are not Silitex business → the Hub sorts them into the other tabs. Returns a short result or null. */
export async function forwardMailsToHub(mails: { id: string; from: string; name: string | null; subject: string; body: string; at: string }[]): Promise<string | null> {
  const key = process.env.HUB_WA_KEY; if (!key || !mails.length) return null;
  try {
    const r = await fetch(HUB_URL() + "/api/wa/mail", { method: "POST", headers: { "content-type": "application/json", "x-hub-wa-key": key }, body: JSON.stringify({ mails }), signal: AbortSignal.timeout(60000), cache: "no-store" });
    const j = await r.json().catch(() => ({})) as { ok?: boolean; result?: Record<string, number> };
    return r.ok && j.ok ? Object.entries(j.result || {}).map(([k, v]) => k + " " + v).join("/") || "0" : "failed " + r.status;
  } catch { return "unreachable"; }
}
