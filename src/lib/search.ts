// search.ts (src/lib/search.ts) · updated 09.10.2026 12:30 (Asia/Jerusalem)
// Unified search over the prebuilt asset index (src/data/search_index.json) + uploaded/crawled KB chunks. BM25 via lib/rag.ts.
import index from "@/data/search_index.json";
import { scoreChunks } from "./rag";
import type { KbChunk } from "./types";
export type IndexDoc = { id: string; type: string; title: string; ref: string; text: string };
export const INDEX = index as { built: string; count: number; docs: IndexDoc[] };
export const TYPE_HE: Record<string, string> = { product: "מוצר", offset: "מקבילות", food_grade: "קו מזון", priority: "עדיפות", lead: "לקוח", kb: "מסמך" };
export function searchAll(query: string, kb: KbChunk[], k = 10): KbChunk[] {
  const assetChunks: KbChunk[] = INDEX.docs.map((d) => ({ id: d.id, doc_id: d.type, title: d.title, doc_type: d.type, product_ref: d.ref, text: d.text }));
  return scoreChunks(query, [...assetChunks, ...kb], k);
}
