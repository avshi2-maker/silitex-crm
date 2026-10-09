// rag.ts (src/lib/rag.ts) · updated 09.10.2026 09:10 (Asia/Jerusalem)
// Chunking + lightweight keyword retrieval (BM25-style) over the knowledge base. Swap scoreChunks for pgvector when embeddings are added.
import type { KbChunk } from "./types";
export function chunkText(text: string, size = 900, overlap = 150): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) { out.push(text.slice(i, i + size)); i += size - overlap; }
  return out.filter((c) => c.trim().length > 40);
}
function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^\p{L}\p{N}%.\-]+/gu, " ").split(" ").filter((t) => t.length > 1);
}
export function scoreChunks(query: string, chunks: KbChunk[], k = 6): KbChunk[] {
  const q = tokens(query); if (!q.length || !chunks.length) return [];
  const N = chunks.length;
  const df = new Map<string, number>();
  const docs = chunks.map((c) => { const t = tokens(c.text + " " + c.title + " " + c.product_ref); new Set(t).forEach((w) => df.set(w, (df.get(w) || 0) + 1)); return t; });
  const avg = docs.reduce((a, d) => a + d.length, 0) / N;
  const scored = chunks.map((c, i) => {
    const d = docs[i]; let s = 0;
    for (const w of q) {
      const tf = d.filter((x) => x === w || x.startsWith(w)).length; if (!tf) continue;
      const idf = Math.log(1 + (N - (df.get(w) || 0) + 0.5) / ((df.get(w) || 0) + 0.5));
      s += idf * (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * d.length / avg));
    }
    return { c, s };
  });
  return scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, k).map((x) => x.c);
}
