// wa-inbound.ts (src/lib/wa-inbound.ts) · updated 10.10.2026 10:20 (Asia/Jerusalem) — server only
// WhatsApp Cloud API inbound: normalise phone, match known numbers (prospects contact_phone / Silitex contacts mobile+phone) → append to the contact's running WhatsApp thread; unknown → wa_unmatched (unless blocklisted).
import { serviceClient } from "./server-data";
import { createHmac, timingSafeEqual } from "crypto";
export const normPhone = (p?: string | null) => { let d = String(p || "").replace(/\D/g, ""); if (d.startsWith("00")) d = d.slice(2); if (d.startsWith("0")) d = "972" + d.slice(1); return d; };
export type WaIn = { id: string; phone: string; name?: string; at: string; body: string; direction: "in" | "out"; media_url?: string | null };
export function verifySignature(raw: string, sig: string | null): boolean {
  const secret = process.env.WA_APP_SECRET; if (!secret) return true; if (!sig?.startsWith("sha256=")) return false;
  const h = createHmac("sha256", secret).update(raw).digest("hex"); const a = Buffer.from(h), b = Buffer.from(sig.slice(7)); return a.length === b.length && timingSafeEqual(a, b);
}
type Match = { kind: "lead"; id: string; name: string; who: string } | { kind: "ct"; id: string; name: string; dept: string } | null;
export async function matchPhone(phone: string): Promise<Match> {
  const sb = serviceClient(); if (!sb) return null; const p = normPhone(phone);
  const leads = (await sb.from("leads").select("id,name,contact_name,contact_phone").not("contact_phone", "is", null)).data || [];
  const l = leads.find((x) => normPhone(x.contact_phone) === p); if (l) return { kind: "lead", id: l.id, name: l.name, who: l.contact_name || String(l.name).split(" (")[0] };
  const cts = (await sb.from("silitex_contacts").select("id,name,dept,mobile,phone")).data || [];
  const c = cts.find((x) => (x.mobile && normPhone(x.mobile) === p) || (x.phone && normPhone(x.phone) === p)); if (c) return { kind: "ct", id: c.id, name: c.name, dept: c.dept };
  return null;
}
export async function appendToThread(m: WaIn, match: NonNullable<Match>): Promise<string> {
  const sb = serviceClient(); if (!sb) throw new Error("no supabase");
  const who = match.kind === "lead" ? match.who : match.name;
  const q = sb.from("threads").select("id").eq("topic", "whatsapp"); const th = match.kind === "lead" ? (await q.contains("refs", { lead_id: match.id }).maybeSingle()).data : (await q.eq("contact_id", match.id).maybeSingle()).data;
  let tid = th?.id;
  if (!tid) { tid = "thr-wa-" + match.id; await sb.from("threads").upsert({ id: tid, dept: match.kind === "lead" ? "il" : match.dept, contact_id: match.kind === "ct" ? match.id : null, subject: "WhatsApp · " + who, topic: "whatsapp", refs: match.kind === "lead" ? { lead_id: match.id, lead_name: match.name } : {}, owner: m.direction === "in" ? "sapirim" : "silitex", status: m.direction === "in" ? "waiting_us" : "waiting_silitex", created_at: m.at, last_at: m.at }); }
  const body = (m.media_url ? "📎 " + m.media_url + "\n" : "") + m.body;
  const r = await sb.from("hub_messages").upsert({ id: "msg-wa-" + m.id.replace(/[^a-z0-9]/gi, "").slice(-20), thread_id: tid, at: m.at, from: m.direction === "in" ? who + " (WhatsApp)" : "Avshi Sapir", to: m.direction === "in" ? "Avshi Sapir" : who, direction: m.direction, body, source: "whatsapp", external_id: "wa:" + m.id }, { onConflict: "external_id", ignoreDuplicates: true });
  if (!r.error) await sb.from("threads").update({ last_at: m.at, status: m.direction === "in" ? "waiting_us" : "waiting_silitex" }).eq("id", tid);
  return tid;
}
export async function routeInbound(m: WaIn): Promise<"saved" | "unmatched" | "blocked"> {
  const sb = serviceClient(); if (!sb) throw new Error("no supabase"); const p = normPhone(m.phone);
  if ((await sb.from("wa_blocklist").select("phone").eq("phone", p).maybeSingle()).data) return "blocked";
  const match = await matchPhone(p); if (match) { await appendToThread(m, match); return "saved"; }
  if (m.direction === "out") return "blocked"; // our own message to an unknown number — not a lead signal
  await sb.from("wa_unmatched").upsert({ id: "wa-" + m.id.replace(/[^a-z0-9]/gi, "").slice(-20), phone: p, name: m.name || null, at: m.at, body: (m.media_url ? "📎 " + m.media_url + "\n" : "") + m.body }, { onConflict: "id", ignoreDuplicates: true });
  return "unmatched";
}
// Media: fetch Cloud API media → upload to Cloudinary (CLOUDINARY_URL=cloudinary://key:secret@cloud). Returns null when not configured.
export async function mediaToCloudinary(mediaId: string): Promise<string | null> {
  const tok = process.env.WA_TOKEN, cu = process.env.CLOUDINARY_URL; if (!tok || !cu) return null;
  try {
    const meta = await (await fetch("https://graph.facebook.com/v21.0/" + mediaId, { headers: { Authorization: "Bearer " + tok } })).json();
    const bin = await (await fetch(meta.url, { headers: { Authorization: "Bearer " + tok } })).arrayBuffer();
    const u = new URL(cu); const cloud = u.hostname, key = u.username, secret = u.password; const ts = Math.floor(Date.now() / 1000);
    const { createHash } = await import("crypto"); const folder = "silitex-wa"; const sig = createHash("sha1").update("folder=" + folder + "&timestamp=" + ts + secret).digest("hex");
    const fd = new FormData(); fd.append("file", new Blob([bin], { type: meta.mime_type || "application/octet-stream" }), "wa-" + mediaId); fd.append("api_key", key); fd.append("timestamp", String(ts)); fd.append("folder", folder); fd.append("signature", sig);
    const up = await (await fetch("https://api.cloudinary.com/v1_1/" + cloud + "/auto/upload", { method: "POST", body: fd })).json(); return up.secure_url || null;
  } catch { return null; }
}
