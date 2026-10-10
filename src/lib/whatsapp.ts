// whatsapp.ts (src/lib/whatsapp.ts) · updated 09.10.2026 10:05 (Asia/Jerusalem) — server only
// Outbound WhatsApp. Provider by env: Twilio (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_WHATSAPP_FROM) or generic webhook (WHATSAPP_WEBHOOK_URL, POST {to,text}).
// Recipient: BRIEF_TO_WHATSAPP (E.164, e.g. 972505231042). No provider → returns a wa.me link for manual send.
export type SendResult = { sent: boolean; provider: string; link: string; error?: string };
export async function sendWhatsApp(text: string): Promise<SendResult> {
  const to = process.env.BRIEF_TO_WHATSAPP || "972505231042";
  const link = "https://wa.me/" + to + "?text=" + encodeURIComponent(text);
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: tok, TWILIO_WHATSAPP_FROM: from, WHATSAPP_WEBHOOK_URL: hook } = process.env;
  try {
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
