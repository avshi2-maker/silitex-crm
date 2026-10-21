// route.ts (src/app/api/federica/route.ts) · created 21.10.2026 16:45 (Asia/Jerusalem) — owner only (PIN gate): GET the Silitex open-questions register (seeds itself once) · POST {items} upsert (add / edit / mark asked / answered).
import { NextResponse } from "next/server";
import { listFq, saveFq } from "@/lib/fq";
import type { Fq } from "@/lib/fq-types";
export const runtime = "nodejs";
export async function GET() { const r = await listFq(); return NextResponse.json(r, { status: "error" in r ? 503 : 200 }); }
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})); const items = (b.items || []) as Fq[];
  if (!Array.isArray(items) || !items.length) return NextResponse.json({ error: "items required" }, { status: 400 });
  const r = await saveFq(items.map((f) => ({ ...f, q: String(f.q).slice(0, 2000), answer: String(f.answer || "").slice(0, 4000) })));
  return NextResponse.json(r, { status: "error" in r ? 503 : 200 });
}
