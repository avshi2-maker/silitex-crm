// ask.ts (src/prompts/ask.ts) · updated 09.10.2026 12:30 (Asia/Jerusalem) — Q&A over all Silitex assets
import type { KbChunk } from "@/lib/types";
export function askContext(hits: KbChunk[]): string {
  return hits.map((c, i) => "[" + (i + 1) + "] (" + c.doc_type + ") " + c.title + "\n" + c.text).join("\n\n");
}
export function askPrompt(q: string): string {
  return "Answer the question using ONLY the sources above; cite [n]. Structure: direct answer (2–3 sentences) → specific Silitex products that apply (name, why, what they replace) → certifications/limits → one-line commercial angle for the Israeli market. If the sources don't cover it, say what is missing. Question: " + q;
}
