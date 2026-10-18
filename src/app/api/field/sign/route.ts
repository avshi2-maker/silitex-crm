// route.ts (src/app/api/field/sign/route.ts) · updated 18.10.2026 07:00 (Asia/Jerusalem) — exact config error · owner only: POST {meeting_id, label, lead_id, kind} → signed params for a DIRECT phone → Cloudinary upload (tiny request; the file never passes through our server)
import { NextResponse } from "next/server";
import { cfg, cfgError, sign, FIELD_TAG, FIELD_FOLDER } from "@/lib/cloudinary";
export const runtime = "nodejs";
const clean = (s: unknown, n = 80) => String(s || "").replace(/[|=\n\r]/g, " ").trim().slice(0, n);
export async function POST(req: Request) {
  const c = cfg(); if (!c) return NextResponse.json({ error: cfgError() }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const mid = clean(b.meeting_id, 40).replace(/[^a-zA-Z0-9_-]/g, ""); if (!mid) return NextResponse.json({ error: "meeting_id required" }, { status: 400 });
  const kind = ["card", "photo", "audio", "video", "note"].includes(b.kind) ? b.kind : "photo";
  const ts = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = {
    folder: FIELD_FOLDER + "/" + new Date().toISOString().slice(0, 10),
    tags: [FIELD_TAG, "fm-" + mid, "k-" + kind].join(","),
    context: ["meeting=" + mid, "label=" + clean(b.label), "lead=" + clean(b.lead_id, 40), "kind=" + kind, "at=" + new Date().toISOString().replace(/[:.]/g, "-")].join("|"),
    timestamp: ts,
  };
  return NextResponse.json({ cloud: c.cloud, api_key: c.key, signature: sign(params, c.secret), ...params });
}
