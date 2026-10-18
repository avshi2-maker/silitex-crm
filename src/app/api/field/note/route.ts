// route.ts (src/app/api/field/note/route.ts) · updated 18.10.2026 06:35 (Asia/Jerusalem) — owner only: POST {company, contact, industry, note} → structured summary, next step, due, stage, follow-up message (JSON) + usage
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
import { NOTE_PROMPT, noteContext, parseJson } from "@/prompts/field";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const note = String(b.note || "").trim(); if (note.length < 5) return NextResponse.json({ error: "note too short" }, { status: 400 });
  try {
    const out = await ask(NOTE_PROMPT, noteContext({ company: String(b.company || ""), contact: String(b.contact || ""), industry: String(b.industry || ""), note: note.slice(0, 8000) }), 900, "he");
    const r = parseJson<Record<string, unknown>>(out.text);
    return r ? NextResponse.json({ result: r, usage: out.usage }) : NextResponse.json({ error: out.usage.mock ? "Demo mode — no ANTHROPIC_API_KEY" : "AI returned no JSON — try again", usage: out.usage }, { status: 502 });
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "ai error" }, { status: 500 }); }
}
