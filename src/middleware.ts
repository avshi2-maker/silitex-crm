// middleware.ts (src/middleware.ts) · updated 18.10.2026 08:00 (Asia/Jerusalem) — phones: every CRM page → /field unless /?full=1 chosen · 13.10.2026 06:40 — gate everything except PUBLIC_PREFIXES; partner cookie opens PARTNER_PREFIXES only (x-partner header forwarded to API routes); noindex header on all responses. Disabled when ACCESS_PIN is unset (local dev).
import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, PARTNER_COOKIE, PARTNER_NAME_COOKIE, isPublicPath, isPartnerPath, gateToken, partnerToken, partnerPins } from "@/lib/gate";
export async function middleware(req: NextRequest) {
  const res = NextResponse.next(); res.headers.set("X-Robots-Tag", "noindex, nofollow");
  const pin = process.env.ACCESS_PIN; const p = req.nextUrl.pathname;
  if (!pin || isPublicPath(p) || p.startsWith("/_next") || p.startsWith("/api/cron")) return res;
  const ok = req.cookies.get(GATE_COOKIE)?.value === (await gateToken(pin));
  if (ok) {
    // PHONES = FIELD MODE ONLY. Any CRM page opened on a phone goes to /field, unless the owner chose "full CRM" (/?full=1 → session cookie). Opening /field again resets it.
    const mobile = /Mobi|Android|iPhone|iPod/i.test(req.headers.get("user-agent") || "");
    if (mobile && !p.startsWith("/api/")) {
      if (p.startsWith("/field")) { if (req.cookies.get("crm-full")) res.cookies.set("crm-full", "", { path: "/", maxAge: 0 }); return res; }
      if (req.nextUrl.searchParams.get("full") === "1") { res.cookies.set("crm-full", "1", { path: "/", sameSite: "lax" }); return res; }
      if (!req.cookies.get("crm-full") && !/\.[a-z0-9]{2,5}$/i.test(p)) { const u = req.nextUrl.clone(); u.pathname = "/field"; u.search = ""; return NextResponse.redirect(u); }
    }
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
