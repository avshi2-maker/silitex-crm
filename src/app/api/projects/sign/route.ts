// route.ts (src/app/api/projects/sign/route.ts) · created 10.11.2026 13:40 (Asia/Jerusalem) — v1.10.0 📷 PO / invoice photo or PDF
// POST {id, kind} → signed params for a DIRECT phone → Cloudinary upload (tiny request, the file never passes through our server). Behind the PIN gate.
import { NextResponse } from "next/server";
import { cfg, cfgError, sign } from "@/lib/cloudinary";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const c = cfg(); if (!c) return NextResponse.json({ error: cfgError() }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const id = String(b.id || "").replace(/[^A-Z0-9-]/gi, "").slice(0, 20); if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const kind = ["quote_ref", "po_sample", "po_product", "invoice"].includes(b.kind) ? b.kind : "doc";
  const params: Record<string, string | number> = { folder: "silitex/projects/" + id, tags: ["silitex-project", "p-" + id, "k-" + kind].join(","), timestamp: Math.floor(Date.now() / 1000) };
  return NextResponse.json({ cloud: c.cloud, api_key: c.key, signature: sign(params, c.secret), ...params });
}
