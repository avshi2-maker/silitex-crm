// route.ts (src/app/api/partner/me/route.ts) · updated 13.10.2026 06:40 (Asia/Jerusalem) — who am I (partner name from middleware header) — used by the partner landing page
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET(req: Request) { return NextResponse.json({ partner: req.headers.get("x-partner") || null }); }
