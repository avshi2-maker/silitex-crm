// route.ts (src/app/api/partner/feedback/route.ts) · updated 16.10.2026 09:35 (Asia/Jerusalem) — + owner notes {owner:true} (no x-partner) stored as "📝 avshi-note", not counted as partner usage · POST {page, topic, message} from a partner (x-partner header set by middleware) → store + email; PATCH {id, replied} by owner (gate cookie, no partner header)
import { NextResponse } from "next/server";
import { storeFeedback, emailFeedback, markReplied } from "@/lib/partner-feedback";
import { logPartner } from "@/lib/partner-usage";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const hdr = req.headers.get("x-partner");
  const { page, topic, message, lang, owner } = await req.json().catch(() => ({}));
  const isOwnerNote = !hdr && owner === true;
  const partner = hdr || (isOwnerNote ? "📝 avshi-note" : "owner-test");
  if (!message || String(message).trim().length < 3) return NextResponse.json({ error: "message required" }, { status: 400 });
  const f = { partner, page: String(page || "/"), topic: topic ? String(topic).slice(0, 120) : undefined, message: String(message).slice(0, 4000), lang };
  const id = await storeFeedback(f); const mail = await emailFeedback(f);
  if (!isOwnerNote) logPartner({ partner, path: f.page, kind: "view", question: "[feedback] " + f.message });
  return NextResponse.json({ ok: true, id, mailed: mail.sent, error: mail.error });
}
export async function PATCH(req: Request) {
  if (req.headers.get("x-partner")) return NextResponse.json({ error: "not allowed" }, { status: 403 });
  const { id, replied } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  return NextResponse.json({ ok: await markReplied(Number(id), !!replied) });
}
