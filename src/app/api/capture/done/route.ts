// route.ts (src/app/api/capture/done/route.ts) · updated 18.10.2026 06:45 (Asia/Jerusalem) — owner only: POST {items:[{public_id, resource_type}], lead_id} → tag as processed (+ lead tag) so they leave the inbox; files stay in Cloudinary
import { NextResponse } from "next/server";
import { tagDone } from "@/lib/cloudinary";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const items = (Array.isArray(b.items) ? b.items : []).filter((i: { public_id?: string; resource_type?: string }) => i.public_id && ["image", "video", "raw"].includes(String(i.resource_type)));
  if (!items.length) return NextResponse.json({ error: "items required" }, { status: 400 });
  const lead = String(b.lead_id || "").replace(/[^a-zA-Z0-9_-]/g, "");
  return NextResponse.json({ ok: await tagDone(items, lead ? "lead-" + lead : undefined) });
}
