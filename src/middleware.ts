// middleware.ts (src/middleware.ts) · updated 18.10.2026 18:25 (Asia/Jerusalem) — public portal domain (PORTAL_HOST / PORTAL_PUBLIC) · 12:00 — partners on the field host → /expo (Silitex Expo); /expo login opens in partner mode · 10:30 — field host silitex-field.* → field mode only (UA phone-guessing removed) · 13.10.2026 06:40 — gate everything except PUBLIC_PREFIXES; partner cookie opens PARTNER_PREFIXES only (x-partner header forwarded to API routes); noindex header on all responses. Disabled when ACCESS_PIN is unset (local dev).
import { NextResponse, type NextRequest } from "next/server";
import { PORTAL_PATH } from "@/portal/config";
import { GATE_COOKIE, PARTNER_COOKIE, PARTNER_NAME_COOKIE, isPublicPath, isPartnerPath, gateToken, partnerToken, partnerPins } from "@/lib/gate";
export async function middleware(req: NextRequest) {
  const res = NextResponse.next(); res.headers.set("X-Robots-Tag", "noindex, nofollow");
  const pin = process.env.ACCESS_PIN; const p = req.nextUrl.pathname;
  // PUBLIC PORTAL domain (PORTAL_HOST, e.g. www.sapirim.com): clean URLs → /he /en /ru pages; robots / sitemap / llms.txt; nothing of the CRM is reachable there. Public + indexable only when PORTAL_PUBLIC=1, otherwise it stays behind the PIN like everything else.
  const host = (req.headers.get("host") || "").toLowerCase(); const ph = (process.env.PORTAL_HOST || "").toLowerCase();
  if (ph && (host === ph || host === ph.replace(/^www\./, "") || "www." + host === ph)) {
    const live = process.env.PORTAL_PUBLIC === "1"; const u = req.nextUrl.clone();
    const special: Record<string, string> = { "/robots.txt": "/api/portal/robots", "/sitemap.xml": "/api/portal/sitemap", "/llms.txt": "/api/portal/llms" };
    if (special[p]) { u.pathname = special[p]; return NextResponse.rewrite(u); }
    if (p === "/") { u.pathname = "/he"; return NextResponse.redirect(u, 308); }
    const ok = PORTAL_PATH.test(p) || p.startsWith("/_next") || p.startsWith("/catalogues/") || p.startsWith("/request") || p.startsWith("/api/forms") || p.startsWith("/assets/") || p === "/favicon.png" || p === "/silitex-logo.png";
    if (!ok) { u.pathname = "/he"; u.search = ""; return NextResponse.redirect(u); }
    if (live) { const r = NextResponse.next(); r.headers.set("X-Robots-Tag", PORTAL_PATH.test(p) ? "index, follow" : "noindex"); return r; }
  }
  if (!pin || isPublicPath(p) || p.startsWith("/_next") || p.startsWith("/api/cron")) return res;
  const ok = req.cookies.get(GATE_COOKIE)?.value === (await gateToken(pin));
  if (ok) {
    // FIELD HOST (KfarTenant method): silitex-field.marble-art.co.il is the phone address. The ADDRESS decides — no device guessing.
    // On that host only field mode (+ /today, APIs, files) is served; anything else → /field. silitex.marble-art.co.il stays the full CRM on every device.
    const host = (req.headers.get("host") || "").toLowerCase();
    if (host.startsWith("silitex-field.") && !p.startsWith("/api/") && !p.startsWith("/field") && !p.startsWith("/today") && !p.startsWith("/expo") && !/\.[a-z0-9]{2,5}$/i.test(p)) { const u = req.nextUrl.clone(); u.pathname = "/field"; u.search = ""; return NextResponse.redirect(u); }
    return res;
  }
  // partner (Silitex staff) — knowledge pages only
  const pname = (req.cookies.get(PARTNER_NAME_COOKIE)?.value || "").toLowerCase(); const ptok = req.cookies.get(PARTNER_COOKIE)?.value; const pins = partnerPins();
  if (pname && ptok && pins[pname] && ptok === (await partnerToken(pname, pins[pname]))) {
    // field host = Silitex Expo for partners: every page except /expo, APIs and files → /expo
    const fieldHost = (req.headers.get("host") || "").toLowerCase().startsWith("silitex-field.");
    if (fieldHost && !p.startsWith("/expo") && !p.startsWith("/api/") && !/\.[a-z0-9]{2,5}$/i.test(p)) { const u = req.nextUrl.clone(); u.pathname = "/expo"; u.search = ""; return NextResponse.redirect(u); }
    if (isPartnerPath(p) || p === "/") {
      if (p === "/") { const u = req.nextUrl.clone(); u.pathname = "/partner"; return NextResponse.redirect(u); }
      const h = new Headers(req.headers); h.set("x-partner", pname);
      const r2 = NextResponse.next({ request: { headers: h } }); r2.headers.set("X-Robots-Tag", "noindex, nofollow"); return r2;
    }
    if (p.startsWith("/api/")) return NextResponse.json({ error: "partner: not allowed" }, { status: 403 });
    const u = req.nextUrl.clone(); u.pathname = "/partner"; return NextResponse.redirect(u);
  }
  if (p.startsWith("/api/")) return NextResponse.json({ error: "locked" }, { status: 401 });
  const url = req.nextUrl.clone(); url.pathname = "/login"; url.searchParams.set("next", p + req.nextUrl.search); if (p.startsWith("/expo")) url.searchParams.set("partner", "1");
  return NextResponse.redirect(url);
}
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
