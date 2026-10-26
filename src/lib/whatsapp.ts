// whatsapp.ts (src/lib/whatsapp.ts) · updated 26.10.2026 07:20 (Asia/Jerusalem) — v0.97.0 24 h rule: free text only inside the window, otherwise the approved template (WA_TEMPLATE, default daily_brief) · send result kept for the brief page · 13.10.2026 08:15 — server only · + Meta WhatsApp Cloud API branch (WA_TOKEN + WA_PHONE_ID, the number already registered for inbound)
// Outbound WhatsApp. Provider by env: Twilio (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_WHATSAPP_FROM) or generic webhook (WHATSAPP_WEBHOOK_URL, POST {to,text}).
// Recipient: BRIEF_TO_WHATSAPP (E.164, e.g. 972505231042). No provider → returns a wa.me link for manual send.
export type SendResult = { sent: boolean; provider: string; link: string; error?: string };
/** template parameter: one line, no tabs / newlines / 4+ spaces (Meta error 132018), max ~1000 chars */
export const oneLine = (t: string) => t.replace(/[*#_`]+/g, "").replace(/\t/g, " ").split(/\n+/).map((x) => x.trim()).filter(Boolean).join(" · ").replace(/ {2,}/g, " ").slice(0, 950);
async function sb() { const { serviceClient } = await import("./server-data"); return serviceClient(); }
/** small status rows in hub_tokens (id = wa_status / wa_in:<phone>) */
export async function note(id: string, line: string) { try { const c = await sb(); if (c) await c.from("hub_tokens").upsert({ id, last_result: line, updated_at: new Date().toISOString() }); } catch { /* best effort */ } }
async function windowOpen(phone: string): Promise<boolean> {
  try { const c = await sb(); if (!c) return false; const row = (await c.from("hub_tokens").select("updated_at").eq("id", "wa_in:" + phone).maybeSingle()).data;
    return !!row?.updated_at && Date.now() - new Date(row.updated_at).getTime() < 23.5 * 3600e3; } catch { return false; }
}
export async function sendWhatsApp(text: string): Promise<SendResult> {
  const to = process.env.BRIEF_TO_WHATSAPP || "972505231042";
  const link = "https://wa.me/" + to + "?text=" + encodeURIComponent(text);
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: tok, TWILIO_WHATSAPP_FROM: from, WHATSAPP_WEBHOOK_URL: hook, WA_TOKEN: meta, WA_PHONE_ID: phoneId } = process.env;
  try {
    if (meta && phoneId) {
      // Meta rule: free text only inside 24 h after the person wrote to the robot number; otherwise only an approved TEMPLATE is delivered
      const open = await windowOpen(to); const tpl = process.env.WA_TEMPLATE || "daily_brief";
      const payload = open ? { messaging_product: "whatsapp", to, type: "text", text: { body: text.slice(0, 4000) } }
        : { messaging_product: "whatsapp", to, type: "template", template: { name: tpl, language: { code: process.env.WA_TEMPLATE_LANG || "he" }, components: [{ type: "body", parameters: [{ type: "text", text: oneLine(text) }] }] } };
      const r = await fetch("https://graph.facebook.com/v21.0/" + phoneId + "/messages", { method: "POST", headers: { Authorization: "Bearer " + meta, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const err = r.ok ? undefined : await r.text(); await note("wa_status", (open ? "text" : "template " + tpl) + " → " + (r.ok ? "accepted (waiting for delivery report)" : "rejected: " + String(err).slice(0, 200)));
      return { sent: r.ok, provider: open ? "meta" : "meta · template", link, error: err };
    }
    if (sid && tok && from) {
      const body = new URLSearchParams({ From: "whatsapp:" + from, To: "whatsapp:+" + to, Body: text });
      const r = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + sid + "/Messages.json", { method: "POST", headers: { Authorization: "Basic " + Buffer.from(sid + ":" + tok).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" }, body });
      return { sent: r.ok, provider: "twilio", link, error: r.ok ? undefined : await r.text() };
    }
    if (hook) {
      const r = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to, text }) });
      return { sent: r.ok, provider: "webhook", link, error: r.ok ? undefined : await r.text() };
    }
  } catch (e: unknown) { return { sent: false, provider: "error", link, error: e instanceof Error ? e.message : "send failed" }; }
  return { sent: false, provider: "none", link };
}
