// route.ts (src/app/api/ai/route.ts) · updated 18.10.2026 17:25 — maxDuration 120 s · 16.10.2026 18:45 — + ru · 13.10.2026 06:40 — logs partner (Silitex staff) questions to partner_usage (Asia/Jerusalem)
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
import { logPartner } from "@/lib/partner-usage";
export const runtime = "nodejs";
export const maxDuration = 120; // Post Studio packs (3 languages) can take ~60 s
export async function POST(req: Request) {
  try {
    const { prompt, context, maxTokens, lang } = await req.json();
    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });
    const out = await ask(String(prompt), context ? String(context) : undefined, maxTokens, lang === "en" ? "en" : lang === "it" ? "it" : lang === "ru" ? "ru" : "he");
    const partner = req.headers.get("x-partner");
    if (partner) logPartner({ partner, path: "/api/ai", kind: "ask", question: String(prompt), input_tokens: out.usage.input_tokens, output_tokens: out.usage.output_tokens, cost_usd: out.usage.cost_usd, model: out.usage.model, lang });
    return NextResponse.json(out);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "ai error" }, { status: 500 });
  }
}
