// route.ts (src/app/api/meta-status/route.ts) · created 17.11.2026 10:20 (Asia/Jerusalem) — v1.12.0
// 🟦 Meta status for the Sapirim Hub health card (the Hub has no Meta token): GET with header x-hub-wa-key = HUB_WA_KEY →
// WhatsApp API number (054-886-8195): quality rating · messaging limit tier · status · display-name status, plus business verification status.
// Read-only. The token never leaves this server.
import { NextResponse } from "next/server";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const BIZ = process.env.META_BUSINESS_ID || "1649234137202233";
export async function GET(req: Request) {
  const key = process.env.HUB_WA_KEY;
  if (!key || req.headers.get("x-hub-wa-key") !== key) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const tok = process.env.WA_TOKEN, pid = process.env.WA_PHONE_ID;
  if (!tok || !pid) return NextResponse.json({ error: "WA_TOKEN / WA_PHONE_ID missing" });
  const g = (path: string) => fetch("https://graph.facebook.com/v21.0/" + path, { headers: { Authorization: "Bearer " + tok }, cache: "no-store", signal: AbortSignal.timeout(8000) })
    .then((r) => r.json()).catch((e) => ({ error: { message: e instanceof Error ? e.message : "fetch failed" } }));
  const [phone, business] = await Promise.all([
    g(pid + "?fields=display_phone_number,verified_name,quality_rating,messaging_limit_tier,status,name_status"),
    g(BIZ + "?fields=name,verification_status"),
  ]);
  return NextResponse.json({ phone, business, at: new Date().toISOString() });
}
