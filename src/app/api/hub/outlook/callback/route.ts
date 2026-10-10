// route.ts (src/app/api/hub/outlook/callback/route.ts) · updated 10.10.2026 06:00 (Asia/Jerusalem) — OAuth callback: code → refresh token → Supabase hub_tokens → back to /hub
import { NextResponse } from "next/server";
import { exchangeCode, saveToken, me } from "@/lib/outlook";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const u = new URL(req.url); const code = u.searchParams.get("code"); const err = u.searchParams.get("error_description") || u.searchParams.get("error");
  const back = (q: string) => NextResponse.redirect(u.origin + "/hub?" + q);
  if (err || !code) return back("outlook=error&msg=" + encodeURIComponent(err || "no code"));
  try { const t = await exchangeCode(code, u.origin); const account = await me(t.access_token); await saveToken(t.refresh_token || "", account); return back("outlook=connected&account=" + encodeURIComponent(account)); }
  catch (e: unknown) { return back("outlook=error&msg=" + encodeURIComponent(e instanceof Error ? e.message : "fail")); }
}
