// route.ts (src/app/api/hub/outlook/connect/route.ts) · updated 10.10.2026 06:00 (Asia/Jerusalem) — redirect to Microsoft login (delegated Mail.Read)
import { NextResponse } from "next/server";
import { authUrl, configured } from "@/lib/outlook";
export const runtime = "nodejs";
export async function GET(req: Request) {
  if (!configured()) return NextResponse.json({ error: "MS_CLIENT_ID / MS_CLIENT_SECRET missing in Vercel" }, { status: 500 });
  const origin = new URL(req.url).origin; const state = Math.random().toString(36).slice(2);
  const res = NextResponse.redirect(authUrl(origin, state)); res.cookies.set("ms_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" }); return res;
}
