// middleware.ts (src/middleware.ts) · updated 09.10.2026 17:05 (Asia/Jerusalem) — gate everything except PUBLIC_PREFIXES; noindex header on all responses. Disabled when ACCESS_PIN is unset (local dev).
import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, isPublicPath, gateToken } from "@/lib/gate";
export async function middleware(req: NextRequest) {
  const res = NextResponse.next(); res.headers.set("X-Robots-Tag", "noindex, nofollow");
  const pin = process.env.ACCESS_PIN; const p = req.nextUrl.pathname;
  if (!pin || isPublicPath(p) || p.startsWith("/_next") || p.startsWith("/api/cron")) return res;
  const ok = req.cookies.get(GATE_COOKIE)?.value === (await gateToken(pin));
  if (ok) return res;
  if (p.startsWith("/api/")) return NextResponse.json({ error: "locked" }, { status: 401 });
  const url = req.nextUrl.clone(); url.pathname = "/login"; url.searchParams.set("next", p + req.nextUrl.search);
  return NextResponse.redirect(url);
}
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
