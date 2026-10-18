// search-partner.ts (src/lib/search-partner.ts) · updated 18.10.2026 11:20 (Asia/Jerusalem) — PARTNER-SAFE search for Silitex staff (/expo, partner pages): uses search_index_partner.json — no customer records, no owner priorities, no food line. Never import search_index.json from partner code.
import index from "@/data/search_index_partner.json";
import { scoreChunks } from "./rag";
import type { KbChunk } from "./types";
type Doc = { id: string; type: string; title: string; ref: string; text: string };
const DOCS = (index as { docs: Doc[] }).docs;
const CHUNKS: KbChunk[] = DOCS.map((d) => ({ id: d.id, doc_id: d.type, title: d.title, doc_type: d.type, product_ref: d.ref, text: d.text }));
export const PARTNER_INDEX_COUNT = DOCS.length;
export function searchPartner(query: string, k = 10): KbChunk[] { return scoreChunks(query, CHUNKS, k); }
