// ask.ts (src/prompts/ask.ts) · updated 13.10.2026 08:15 — strict: NO_DATA marker when sources do not cover the question (no guessing, no outside knowledge) (Asia/Jerusalem) — Q&A over all Silitex assets
import type { KbChunk } from "@/lib/types";
export function askContext(hits: KbChunk[]): string {
  return hits.map((c, i) => "[" + (i + 1) + "] (" + c.doc_type + ") " + c.title + "\n" + c.text).join("\n\n");
}
export function askPrompt(q: string): string {
  return "Answer the question using ONLY the sources above; cite [n]. Structure: direct answer (2–3 sentences) → specific Silitex products that apply (name, why, what they replace) → certifications/limits → one-line commercial angle for the Israeli market. If the sources above do not contain the information needed, do NOT use outside knowledge and do NOT guess: reply with exactly the line NO_DATA on the first line, then one sentence naming what is missing. Question: " + q;
}
