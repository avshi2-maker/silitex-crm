// route.ts (src/app/api/login/route.ts) · updated 09.10.2026 17:05 (Asia/Jerusalem) — POST {pin} → sets gate cookie (30 days, httpOnly). DELETE → logout.
import { NextResponse } from "next/server";
import { GATE_COOKIE, gateToken } from "@/lib/gate";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const { pin } = await req.json().catch(() => ({ pin: "" }));
  const real = process.env.ACCESS_PIN;
  if (!real) return NextResponse.json({ ok: true, note: "gate disabled" });
  if (String(pin) !== real) { await new Promise((r) => setTimeout(r, 800)); return NextResponse.json({ ok: false }, { status: 401 }); }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, await gateToken(real), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
export async function DELETE() { const res = NextResponse.json({ ok: true }); res.cookies.set(GATE_COOKIE, "", { path: "/", maxAge: 0 }); return res; }
