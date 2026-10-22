// route.ts (src/app/api/field/note/route.ts) · updated 22.10.2026 07:10 (Asia/Jerusalem) — long meeting recordings: note up to 60,000 chars (was 8,000), summary up to 1,500 tokens · 18.10.2026 12:05 (Asia/Jerusalem) — + mode "expo" (Silitex staff: summary in her language, follow-up signed by her, usage logged per partner) · 06:35 — owner: POST {company, contact, industry, note} → structured summary, next step, due, stage, follow-up message (JSON) + usage
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
import { NOTE_PROMPT, noteContext, parseJson, expoNotePrompt } from "@/prompts/field";
import { logPartner } from "@/lib/partner-usage";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const note = String(b.note || "").trim(); if (note.length < 5) return NextResponse.json({ error: "note too short" }, { status: 400 });
  try {
    const expo = b.mode === "expo"; const lang = (["en", "it", "he", "ru"].includes(b.lang) ? b.lang : "en") as "en" | "it" | "he" | "ru";
    const out = await ask(expo ? expoNotePrompt(lang, String(b.signer || "Silitex S.r.l.").slice(0, 120)) : NOTE_PROMPT, noteContext({ company: String(b.company || ""), contact: String(b.contact || ""), industry: String(b.industry || ""), note: note.slice(0, 60000) }), 1500, expo ? lang : "he");
    const partner = req.headers.get("x-partner");
    if (partner) logPartner({ partner, path: "/api/field/note", kind: "ask", question: "expo note: " + String(b.company || ""), input_tokens: out.usage.input_tokens, output_tokens: out.usage.output_tokens, cost_usd: out.usage.cost_usd, model: out.usage.model, lang });
    const r = parseJson<Record<string, unknown>>(out.text);
    return r ? NextResponse.json({ result: r, usage: out.usage }) : NextResponse.json({ error: out.usage.mock ? "Demo mode — no ANTHROPIC_API_KEY" : "AI returned no JSON — try again", usage: out.usage }, { status: 502 });
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "ai error" }, { status: 500 }); }
}
