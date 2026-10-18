// cloudinary.ts (src/lib/cloudinary.ts) · updated 18.10.2026 07:00 (Asia/Jerusalem) — tolerant CLOUDINARY_URL parsing + exact error · server only. CLOUDINARY_URL=cloudinary://key:secret@cloud. Signed direct uploads from the phone, inbox search, tagging processed items.
import { createHash } from "crypto";
export const FIELD_TAG = "silitex-field", DONE_TAG = "silitex-processed", FIELD_FOLDER = "silitex/field";
/** tolerant: accepts the value with or without the "CLOUDINARY_URL=" prefix, quotes or spaces (as copied from the Cloudinary console) */
export function cfgStatus(): { ok: true; cloud: string; key: string; secret: string } | { ok: false; why: string } {
  const raw = (process.env.CLOUDINARY_URL || "").trim().replace(/^CLOUDINARY_URL\s*=\s*/i, "").replace(/^["']|["']$/g, "").trim();
  if (!raw) return { ok: false, why: "CLOUDINARY_URL missing in Vercel" };
  if (/[<>]/.test(raw)) return { ok: false, why: "CLOUDINARY_URL still contains <your_api_key> placeholders — paste the real key and secret" };
  const m = /^cloudinary:\/\/([^:@\s]+):([^@\s]+)@([a-z0-9_-]+)\/?$/i.exec(raw);
  if (!m) return { ok: false, why: "CLOUDINARY_URL format must be cloudinary://API_KEY:API_SECRET@CLOUD_NAME" };
  return { ok: true, key: decodeURIComponent(m[1]), secret: decodeURIComponent(m[2]), cloud: m[3] };
}
export function cfg(): { cloud: string; key: string; secret: string } | null { const s = cfgStatus(); return s.ok ? { cloud: s.cloud, key: s.key, secret: s.secret } : null; }
export const cfgError = () => { const s = cfgStatus(); return s.ok ? "" : s.why; };
/** Cloudinary signature: sorted key=value&… + secret, sha1 */
export function sign(params: Record<string, string | number>, secret: string): string {
  const s = Object.keys(params).filter((k) => params[k] !== "" && params[k] !== undefined).sort().map((k) => k + "=" + params[k]).join("&");
  return createHash("sha1").update(s + secret).digest("hex");
}
const auth = (c: { key: string; secret: string }) => "Basic " + Buffer.from(c.key + ":" + c.secret).toString("base64");
export type Asset = { public_id: string; resource_type: "image" | "video" | "raw"; format: string; secure_url: string; created_at: string; bytes: number; duration?: number; tags: string[]; context: Record<string, string> };
export async function searchInbox(): Promise<Asset[] | null> {
  const c = cfg(); if (!c) return null;
  const r = await fetch("https://api.cloudinary.com/v1_1/" + c.cloud + "/resources/search", { method: "POST", headers: { Authorization: auth(c), "Content-Type": "application/json" }, body: JSON.stringify({ expression: "tags=" + FIELD_TAG + " AND -tags=" + DONE_TAG, with_field: ["context", "tags"], max_results: 300, sort_by: [{ created_at: "asc" }] }), cache: "no-store" });
  if (!r.ok) throw new Error("Cloudinary search " + r.status + ": " + (await r.text()).slice(0, 200));
  const j = await r.json();
  return (j.resources || []).map((x: Record<string, unknown>) => ({ public_id: x.public_id, resource_type: x.resource_type, format: x.format, secure_url: x.secure_url, created_at: x.created_at, bytes: x.bytes, duration: x.duration, tags: (x.tags as string[]) || [], context: ((x.context as Record<string, unknown>) || {}) as Record<string, string> }));
}
export async function tagDone(items: { public_id: string; resource_type: string }[], extraTag?: string): Promise<boolean> {
  const c = cfg(); if (!c) return false; let ok = true;
  for (const rt of ["image", "video", "raw"]) {
    const ids = items.filter((i) => i.resource_type === rt).map((i) => i.public_id); if (!ids.length) continue;
    for (const tag of [DONE_TAG, extraTag].filter(Boolean) as string[]) {
      const ts = Math.floor(Date.now() / 1000); const p: Record<string, string | number> = { command: "add", public_ids: ids.join(","), tag, timestamp: ts };
      const fd = new FormData(); fd.append("command", "add"); fd.append("tag", tag); fd.append("timestamp", String(ts)); ids.forEach((id) => fd.append("public_ids[]", id)); fd.append("api_key", c.key); fd.append("signature", sign(p, c.secret));
      const r = await fetch("https://api.cloudinary.com/v1_1/" + c.cloud + "/" + rt + "/tags", { method: "POST", body: fd }); if (!r.ok) ok = false;
    }
  }
  return ok;
}
/** audio track of an audio/video asset as small mono mp3 (Cloudinary on-the-fly transformation) */
export const audioUrl = (a: Pick<Asset, "secure_url">) => a.secure_url.replace("/upload/", "/upload/f_mp3,ac_1,br_48k/").replace(/\.[a-z0-9]+$/i, ".mp3");
export const imageUrl = (a: Pick<Asset, "secure_url">, w = 1600) => a.secure_url.replace("/upload/", "/upload/c_limit,w_" + w + ",q_auto,f_jpg/").replace(/\.[a-z0-9]+$/i, ".jpg");
