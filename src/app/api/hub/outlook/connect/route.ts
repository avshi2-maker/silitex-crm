// route.ts (src/app/api/hub/outlook/connect/route.ts) · updated 10.10.2026 06:40 (Asia/Jerusalem) — redirect to Microsoft login (delegated Mail.Read, PKCE)
import { NextResponse } from "next/server";
import { authUrl, configured, newVerifier } from "@/lib/outlook";
export const runtime = "nodejs";
export async function GET(req: Request) {
  if (!configured()) return NextResponse.json({ error: "MS_CLIENT_ID missing in Vercel" }, { status: 500 });
  const origin = new URL(req.url).origin; const state = Math.random().toString(36).slice(2); const verifier = newVerifier();
  const res = NextResponse.redirect(authUrl(origin, state, verifier));
  const opt = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: 600, path: "/" };
  res.cookies.set("ms_state", state, opt); res.cookies.set("ms_verifier", verifier, opt); return res;
}
