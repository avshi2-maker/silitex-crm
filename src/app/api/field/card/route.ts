// route.ts (src/app/api/field/card/route.ts) · updated 18.10.2026 12:05 (Asia/Jerusalem) — + Silitex staff (Expo), usage logged per partner · 06:35 — POST {image: dataURL (client-resized JPEG)} → business-card fields (Claude vision) + usage
import { NextResponse } from "next/server";
import { askImage } from "@/lib/ai";
import { CARD_PROMPT, parseJson } from "@/prompts/field";
import { logPartner } from "@/lib/partner-usage";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(req: Request) {
  const { image } = await req.json().catch(() => ({}));
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(String(image || ""));
  if (!m) return NextResponse.json({ error: "image required" }, { status: 400 });
  if (m[2].length > 4_000_000) return NextResponse.json({ error: "image too large" }, { status: 413 });
  try {
    const out = await askImage(CARD_PROMPT, m[2], m[1] as "image/jpeg" | "image/png" | "image/webp");
    const partner = req.headers.get("x-partner");
    if (partner) logPartner({ partner, path: "/api/field/card", kind: "ask", question: "card scan", input_tokens: out.usage.input_tokens, output_tokens: out.usage.output_tokens, cost_usd: out.usage.cost_usd, model: out.usage.model });
    if (out.usage.mock) return NextResponse.json({ error: "Demo mode — no ANTHROPIC_API_KEY", usage: out.usage }, { status: 503 });
    const card = parseJson<Record<string, string>>(out.text);
    return card ? NextResponse.json({ card, usage: out.usage }) : NextResponse.json({ error: "Could not read the card — try a sharper photo", usage: out.usage }, { status: 502 });
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "ai error" }, { status: 500 }); }
}
