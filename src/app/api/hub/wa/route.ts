// route.ts (src/app/api/hub/wa/route.ts) · updated 08.11.2026 18:45 (Asia/Jerusalem) — v1.9.2 voice notes transcribed straight from Meta (no Cloudinary needed) · v1.9.1 voice inbox step trail (hub_tokens id voice) · v1.9.0 🎙️ Avshi's own text / voice notes → voice inbox (tasks via the Hub, answer on WhatsApp) · 11:55 v1.7.0 every customer WhatsApp message is forwarded to the Sapirim Hub, which sorts it to the right CRM (Silitex / sinks / Artfloor / AI / Nutri); old direct filing stays as fallback when the Hub is unreachable · messages from Avshi's own number only open the 24 h window · 26.10.2026 07:20 — v0.97.0 remembers last inbound per number (24 h window) + saves delivery status for /brief · 13.10.2026 12:40 — + delivery statuses logged (failed → error code/title in Vercel logs) · WhatsApp Cloud API webhook (public): GET = Meta verification, POST = messages + coexistence echoes
import { NextResponse, after } from "next/server";
import { ownerNote } from "@/lib/voice-inbox";
import { verifySignature, routeInbound, mediaToCloudinary, normPhone, type WaIn } from "@/lib/wa-inbound";
import { note } from "@/lib/whatsapp";
import { forwardToHub, OWNER_WA } from "@/lib/hub-forward";
export const runtime = "nodejs"; export const dynamic = "force-dynamic"; export const maxDuration = 60; // room for the 🎙️ voice note (Whisper + AI) after the answer to Meta
export async function GET(req: Request) {
  const u = new URL(req.url); const mode = u.searchParams.get("hub.mode"), tok = u.searchParams.get("hub.verify_token"), ch = u.searchParams.get("hub.challenge");
  if (mode === "subscribe" && tok && tok === process.env.WA_VERIFY_TOKEN && ch) return new NextResponse(ch, { status: 200 });
  return NextResponse.json({ ok: true, configured: !!process.env.WA_VERIFY_TOKEN });
}
type Msg = { id: string; from?: string; to?: string; timestamp: string; type: string; text?: { body: string }; image?: { id: string; caption?: string }; document?: { id: string; caption?: string; filename?: string }; audio?: { id: string }; video?: { id: string; caption?: string }; location?: { latitude: number; longitude: number; name?: string } };
export async function POST(req: Request) {
  const raw = await req.text(); if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  let body: { entry?: { changes?: { field: string; value: { contacts?: { wa_id: string; profile?: { name?: string } }[]; messages?: Msg[]; statuses?: { id: string; status: string; recipient_id?: string; errors?: { code: number; title: string; message?: string; error_data?: { details?: string } }[] }[] } }[] }[] }; try { body = JSON.parse(raw); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const out: string[] = [];
  for (const e of body.entry || []) for (const ch of e.changes || []) {
    const v = ch.value; const echo = ch.field === "smb_message_echoes";
    for (const st of v.statuses || []) { const line = "WA status " + st.status + " → " + (st.recipient_id || "") + (st.errors?.length ? " · ERROR " + st.errors.map((e) => e.code + " " + e.title + (e.error_data?.details ? " — " + e.error_data.details : "")).join("; ") : ""); console.log(line); out.push(line); await note("wa_status", (st.status === "failed" ? "❌ " : st.status === "delivered" || st.status === "read" ? "✅ " : "") + line); } const names = Object.fromEntries((v.contacts || []).map((c) => [c.wa_id, c.profile?.name || ""]));
    for (const m of v.messages || []) {
      const phone = echo ? m.to || "" : m.from || ""; if (!phone) continue;
      const mediaId = m.image?.id || m.document?.id || m.audio?.id || m.video?.id; const media_url = mediaId ? await mediaToCloudinary(mediaId) : null;
      const text = m.text?.body || m.image?.caption || m.document?.caption || m.video?.caption || (m.location ? "📍 " + (m.location.name || "") + " https://maps.google.com/?q=" + m.location.latitude + "," + m.location.longitude : "") || (mediaId && !media_url ? "[" + m.type + (m.document?.filename ? " " + m.document.filename : "") + "]" : "") || "[" + m.type + "]";
      if (!echo) await note("wa_in:" + phone, "last message in"); // opens Meta's 24 h window for free-text replies
      if (!echo && normPhone(phone) === OWNER_WA()) { // Avshi → bot: never a lead. Voice note / text of 6+ chars = 🎙️ voice inbox (after the answer to Meta)
        if (m.type === "audio" || (m.type === "text" && text.trim().length >= 6)) { const n = { id: m.id, type: m.type, body: text, media_url, media_id: m.audio?.id || null, at: new Date(Number(m.timestamp) * 1000).toISOString() }; await note("voice", "1 received " + m.type + (media_url ? " + media" : "")); after(() => ownerNote(n)); out.push("owner-note"); } else { await note("voice", "skipped " + m.type + (mediaId && !media_url ? " (media upload failed)" : "") + " len " + text.length); out.push("owner"); }
        continue; }
      const w: WaIn = { id: m.id, phone, name: names[phone], at: new Date(Number(m.timestamp) * 1000).toISOString(), body: text, direction: echo ? "out" : "in", media_url };
      const hub = await forwardToHub(w); if (hub) { out.push("hub:" + hub); continue; } // Hub sorts + files it
      try { out.push(await routeInbound(w)); } catch (err) { out.push("error:" + (err instanceof Error ? err.message : "x")); } // fallback: Silitex filing as before
    }
  }
  return NextResponse.json({ ok: true, results: out });
}
