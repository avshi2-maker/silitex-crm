// rag.ts (src/prompts/rag.ts) · updated 09.10.2026 09:40 (Asia/Jerusalem) — answer from retrieved chunks with [n] citations
import type { KbChunk } from "@/lib/types";
export function ragContext(hits: KbChunk[]): string {
  if (!hits.length) return "(אין מסמכים במאגר — ענה מהקטלוג הכללי בלבד וציין זאת)";
  return hits.map((c, i) => "[" + (i + 1) + "] " + c.title + " (" + c.doc_type + (c.product_ref ? " · " + c.product_ref : "") + ")\n" + c.text).join("\n\n");
}
export function ragPrompt(question: string): string {
  return "ענה על השאלה בהסתמך על המקטעים בלבד, עם ציון מקור [n]. שאלה: " + question;
}
