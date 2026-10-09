// crawl.ts (src/lib/crawl.ts) · updated 09.10.2026 10:05 (Asia/Jerusalem) — server only
// Fetch a silitex.it category → discover product pages → plain text → chunks. Used by /api/rag/crawl (on demand) and /api/cron/crawl (weekly → Supabase).
import { SILITEX_BASE, CATEGORY_PATH, MAX_PRODUCTS_PER_CALL, FETCH_TIMEOUT_MS } from "@/config/crawl";
import { chunkText } from "./rag";
export type CrawledDoc = { url: string; title: string; product_ref: string; chunks: string[] };
async function get(url: string): Promise<string> {
  const r = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), headers: { "User-Agent": "SilitexCRM/1.0 (distributor research)" } });
  if (!r.ok) throw new Error(r.status + " " + url);
  return r.text();
}
export function htmlToText(html: string): string {
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html.replace(/<header[\s\S]*?<\/header>/gi, "").replace(/<footer[\s\S]*?<\/footer>/gi, "").replace(/<nav[\s\S]*?<\/nav>/gi, "");
  return main.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "").replace(/<br\s*\/?>|<\/p>|<\/li>|<\/h\d>|<\/tr>/gi, "\n").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n\n").trim();
}
export function titleOf(html: string, fallback: string): string {
  return (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || fallback).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
export function productLinks(html: string, category: string): string[] {
  const prefix = CATEGORY_PATH + category + "/";
  const re = new RegExp('href="(' + SILITEX_BASE.replace(/\./g, "\\.") + ')?(' + prefix.replace(/\//g, "\\/") + '[a-z0-9-]+)"', "g");
  const out = new Set<string>(); let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.add(SILITEX_BASE + m[2]);
  return Array.from(out);
}
export async function crawlCategory(category: string): Promise<{ category: string; docs: CrawledDoc[]; errors: string[] }> {
  const docs: CrawledDoc[] = []; const errors: string[] = [];
  const catUrl = SILITEX_BASE + CATEGORY_PATH + category;
  const html = await get(catUrl);
  const catText = htmlToText(html);
  if (catText.length > 200) docs.push({ url: catUrl, title: "silitex.it · " + titleOf(html, category), product_ref: "", chunks: chunkText(catText) });
  for (const url of productLinks(html, category).slice(0, MAX_PRODUCTS_PER_CALL)) {
    try {
      const h = await get(url); const t = htmlToText(h); const title = titleOf(h, url.split("/").pop() || url);
      if (t.length > 120) docs.push({ url, title: "silitex.it · " + title, product_ref: title.toUpperCase(), chunks: chunkText(t) });
    } catch (e: unknown) { errors.push(e instanceof Error ? e.message : url); }
  }
  return { category, docs, errors };
}
