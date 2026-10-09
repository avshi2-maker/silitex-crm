// route.ts (src/app/api/rag/crawl/route.ts) · updated 09.10.2026 10:05 (Asia/Jerusalem) — on-demand: POST {category} → docs+chunks (client stores them in KB)
import { NextResponse } from "next/server";
import { crawlCategory } from "@/lib/crawl";
import { CATEGORIES } from "@/config/crawl";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET() { return NextResponse.json({ categories: CATEGORIES }); }
export async function POST(req: Request) {
  try {
    const { category } = await req.json();
    if (!CATEGORIES.includes(category)) return NextResponse.json({ error: "unknown category" }, { status: 400 });
    return NextResponse.json(await crawlCategory(category));
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "crawl error" }, { status: 500 }); }
}
