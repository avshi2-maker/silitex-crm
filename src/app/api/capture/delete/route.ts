// route.ts (src/app/api/capture/delete/route.ts) · updated 19.10.2026 09:45 (Asia/Jerusalem) — FIELD INBOX 🗑️: owner only, POST {items:[{public_id, resource_type}]} → permanent delete from Cloudinary. Only field uploads (folder silitex/field) can be deleted here.
import { NextResponse } from "next/server";
import { destroy, FIELD_FOLDER } from "@/lib/cloudinary";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const items = (Array.isArray(b.items) ? b.items : []).filter((i: { public_id?: string; resource_type?: string }) => typeof i.public_id === "string" && i.public_id.startsWith(FIELD_FOLDER + "/") && ["image", "video", "raw"].includes(String(i.resource_type)));
  if (!items.length) return NextResponse.json({ error: "items required" }, { status: 400 });
  const r = await destroy(items);
  return NextResponse.json(r, { status: r.ok ? 200 : 502 });
}
