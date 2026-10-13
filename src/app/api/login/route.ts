// route.ts (src/app/api/login/route.ts) · updated 13.10.2026 06:40 (Asia/Jerusalem) — POST {pin} → owner gate cookie (30 days). POST {partner, pin} → partner cookies (90 days, knowledge pages only). DELETE → logout both.
import { NextResponse } from "next/server";
import { GATE_COOKIE, PARTNER_COOKIE, PARTNER_NAME_COOKIE, gateToken, partnerToken, partnerPins } from "@/lib/gate";
import { logPartner } from "@/lib/partner-usage";
export const runtime = "nodejs";
const slow = () => new Promise((r) => setTimeout(r, 800));
export async function POST(req: Request) {
  const { pin, partner } = await req.json().catch(() => ({ pin: "", partner: "" }));
  if (partner) {
    const name = String(partner).trim().toLowerCase(); const pins = partnerPins();
    if (!pins[name] || String(pin) !== pins[name]) { await slow(); return NextResponse.json({ ok: false }, { status: 401 }); }
    const res = NextResponse.json({ ok: true, partner: name });
    const opts = { secure: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 90 };
    res.cookies.set(PARTNER_COOKIE, await partnerToken(name, pins[name]), { ...opts, httpOnly: true });
    res.cookies.set(PARTNER_NAME_COOKIE, name, { ...opts, httpOnly: false });
    logPartner({ partner: name, path: "/login", kind: "login" });
    return res;
  }
  const real = process.env.ACCESS_PIN;
  if (!real) return NextResponse.json({ ok: true, note: "gate disabled" });
  if (String(pin) !== real) { await slow(); return NextResponse.json({ ok: false }, { status: 401 }); }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, await gateToken(real), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
export async function DELETE() { const res = NextResponse.json({ ok: true }); for (const c of [GATE_COOKIE, PARTNER_COOKIE, PARTNER_NAME_COOKIE]) res.cookies.set(c, "", { path: "/", maxAge: 0 }); return res; }
