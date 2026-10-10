// route.ts (src/app/api/hub/wa/route.ts) · updated 10.10.2026 10:20 (Asia/Jerusalem) — WhatsApp Cloud API webhook (public): GET = Meta verification, POST = messages + coexistence echoes
import { NextResponse } from "next/server";
import { verifySignature, routeInbound, mediaToCloudinary, type WaIn } from "@/lib/wa-inbound";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const u = new URL(req.url); const mode = u.searchParams.get("hub.mode"), tok = u.searchParams.get("hub.verify_token"), ch = u.searchParams.get("hub.challenge");
  if (mode === "subscribe" && tok && tok === process.env.WA_VERIFY_TOKEN && ch) return new NextResponse(ch, { status: 200 });
  return NextResponse.json({ ok: true, configured: !!process.env.WA_VERIFY_TOKEN });
}
type Msg = { id: string; from?: string; to?: string; timestamp: string; type: string; text?: { body: string }; image?: { id: string; caption?: string }; document?: { id: string; caption?: string; filename?: string }; audio?: { id: string }; video?: { id: string; caption?: string }; location?: { latitude: number; longitude: number; name?: string } };
export async function POST(req: Request) {
  const raw = await req.text(); if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  let body: { entry?: { changes?: { field: string; value: { contacts?: { wa_id: string; profile?: { name?: string } }[]; messages?: Msg[] } }[] }[] }; try { body = JSON.parse(raw); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const out: string[] = [];
  for (const e of body.entry || []) for (const ch of e.changes || []) {
    const v = ch.value; const echo = ch.field === "smb_message_echoes"; const names = Object.fromEntries((v.contacts || []).map((c) => [c.wa_id, c.profile?.name || ""]));
    for (const m of v.messages || []) {
      const phone = echo ? m.to || "" : m.from || ""; if (!phone) continue;
      const mediaId = m.image?.id || m.document?.id || m.audio?.id || m.video?.id; const media_url = mediaId ? await mediaToCloudinary(mediaId) : null;
      const text = m.text?.body || m.image?.caption || m.document?.caption || m.video?.caption || (m.location ? "📍 " + (m.location.name || "") + " https://maps.google.com/?q=" + m.location.latitude + "," + m.location.longitude : "") || (mediaId && !media_url ? "[" + m.type + (m.document?.filename ? " " + m.document.filename : "") + "]" : "") || "[" + m.type + "]";
      const w: WaIn = { id: m.id, phone, name: names[phone], at: new Date(Number(m.timestamp) * 1000).toISOString(), body: text, direction: echo ? "out" : "in", media_url };
      try { out.push(await routeInbound(w)); } catch (err) { out.push("error:" + (err instanceof Error ? err.message : "x")); }
    }
  }
  return NextResponse.json({ ok: true, results: out });
}
