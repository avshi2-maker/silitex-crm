// route.ts (src/app/api/meetings/summarize/route.ts) · updated 16.10.2026 18:00 (Asia/Jerusalem) — owner only: POST {transcript, open[]} → Claude JSON summary + usage (for the token meter)
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
import { MEETING_PROMPT, previousContext, parseSummary } from "@/prompts/meeting";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(req: Request) {
  const { transcript, open } = await req.json().catch(() => ({}));
  const t = String(transcript || "").trim(); if (t.length < 200) return NextResponse.json({ error: "transcript too short" }, { status: 400 });
  try {
    const out = await ask(MEETING_PROMPT, previousContext(Array.isArray(open) ? open : []) + "TRANSCRIPT:\n" + t.slice(0, 400_000), 4000, "en");
    const summary = parseSummary(out.text);
    if (!summary) return NextResponse.json({ error: out.usage.mock ? "Demo mode — no ANTHROPIC_API_KEY" : "AI returned no valid JSON — try again", raw: out.text.slice(0, 800), usage: out.usage }, { status: 502 });
    return NextResponse.json({ summary, usage: out.usage });
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "ai error" }, { status: 500 }); }
}
