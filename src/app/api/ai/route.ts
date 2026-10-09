// route.ts (src/app/api/ai/route.ts) · updated 09.10.2026 10:30 (Asia/Jerusalem)
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const { prompt, context, maxTokens, lang } = await req.json();
    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });
    const out = await ask(String(prompt), context ? String(context) : undefined, maxTokens, lang === "en" ? "en" : lang === "it" ? "it" : "he");
    return NextResponse.json(out);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "ai error" }, { status: 500 });
  }
}
