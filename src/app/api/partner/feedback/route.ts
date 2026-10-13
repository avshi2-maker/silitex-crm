// route.ts (src/app/api/partner/feedback/route.ts) · updated 13.10.2026 07:20 (Asia/Jerusalem) — POST {page, topic, message} from a partner (x-partner header set by middleware) → store + email; PATCH {id, replied} by owner (gate cookie, no partner header)
import { NextResponse } from "next/server";
import { storeFeedback, emailFeedback, markReplied } from "@/lib/partner-feedback";
import { logPartner } from "@/lib/partner-usage";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const partner = req.headers.get("x-partner") || "owner-test";
  const { page, topic, message, lang } = await req.json().catch(() => ({}));
  if (!message || String(message).trim().length < 3) return NextResponse.json({ error: "message required" }, { status: 400 });
  const f = { partner, page: String(page || "/"), topic: topic ? String(topic).slice(0, 120) : undefined, message: String(message).slice(0, 4000), lang };
  const id = await storeFeedback(f); const mail = await emailFeedback(f);
  logPartner({ partner, path: f.page, kind: "view", question: "[feedback] " + f.message });
  return NextResponse.json({ ok: true, id, mailed: mail.sent, error: mail.error });
}
export async function PATCH(req: Request) {
  if (req.headers.get("x-partner")) return NextResponse.json({ error: "not allowed" }, { status: 403 });
  const { id, replied } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  return NextResponse.json({ ok: await markReplied(Number(id), !!replied) });
}
