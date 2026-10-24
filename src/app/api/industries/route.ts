// route.ts (src/app/api/industries/route.ts) · created 24.10.2026 06:00 (Asia/Jerusalem) — owner: industries added from the 🛰️ gap radar (table extra_industries). GET list · POST {name, who, uses, source} add / update.
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ items: [] });
  const r = await sb.from("extra_industries").select("name,who,uses,source,created_at").order("created_at");
  return r.error ? NextResponse.json({ error: r.error.message }, { status: 500 }) : NextResponse.json({ items: r.data || [] });
}
export async function POST(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no-db" }, { status: 503 });
  let b: Record<string, unknown> = {}; try { b = await req.json(); } catch {}
  const name = String(b.name || "").trim().slice(0, 80); if (name.length < 3) return NextResponse.json({ error: "name required" }, { status: 400 });
  const row = { name, who: String(b.who || "").slice(0, 600), uses: String(b.uses || "").slice(0, 600), source: String(b.source || "radar").slice(0, 120) };
  const r = await sb.from("extra_industries").upsert(row);
  return r.error ? NextResponse.json({ error: r.error.message }, { status: 500 }) : NextResponse.json({ ok: true, item: row });
}
