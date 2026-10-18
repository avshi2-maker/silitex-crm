// middleware.ts (src/middleware.ts) · updated 18.10.2026 07:55 (Asia/Jerusalem) — phones opening / go to /field · 13.10.2026 06:40 — gate everything except PUBLIC_PREFIXES; partner cookie opens PARTNER_PREFIXES only (x-partner header forwarded to API routes); noindex header on all responses. Disabled when ACCESS_PIN is unset (local dev).
import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, PARTNER_COOKIE, PARTNER_NAME_COOKIE, isPublicPath, isPartnerPath, gateToken, partnerToken, partnerPins } from "@/lib/gate";
export async function middleware(req: NextRequest) {
  const res = NextResponse.next(); res.headers.set("X-Robots-Tag", "noindex, nofollow");
  const pin = process.env.ACCESS_PIN; const p = req.nextUrl.pathname;
  if (!pin || isPublicPath(p) || p.startsWith("/_next") || p.startsWith("/api/cron")) return res;
  const ok = req.cookies.get(GATE_COOKIE)?.value === (await gateToken(pin));
  if (ok) {
    // phones land in field mode, not the desktop CRM (open the full CRM with /?full=1)
    if (p === "/" && !req.nextUrl.searchParams.has("full") && /Mobi|Android|iPhone|iPod/i.test(req.headers.get("user-agent") || "")) { const u = req.nextUrl.clone(); u.pathname = "/field"; u.search = ""; return NextResponse.redirect(u); }
    return res;
  }
  // partner (Silitex staff) — knowledge pages only
  const pname = (req.cookies.get(PARTNER_NAME_COOKIE)?.value || "").toLowerCase(); const ptok = req.cookies.get(PARTNER_COOKIE)?.value; const pins = partnerPins();
  if (pname && ptok && pins[pname] && ptok === (await partnerToken(pname, pins[pname]))) {
    if (isPartnerPath(p) || p === "/") {
      if (p === "/") { const u = req.nextUrl.clone(); u.pathname = "/partner"; return NextResponse.redirect(u); }
      const h = new Headers(req.headers); h.set("x-partner", pname);
      const r2 = NextResponse.next({ request: { headers: h } }); r2.headers.set("X-Robots-Tag", "noindex, nofollow"); return r2;
    }
    if (p.startsWith("/api/")) return NextResponse.json({ error: "partner: not allowed" }, { status: 403 });
    const u = req.nextUrl.clone(); u.pathname = "/partner"; return NextResponse.redirect(u);
  }
  if (p.startsWith("/api/")) return NextResponse.json({ error: "locked" }, { status: 401 });
  const url = req.nextUrl.clone(); url.pathname = "/login"; url.searchParams.set("next", p + req.nextUrl.search);
  return NextResponse.redirect(url);
}
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
