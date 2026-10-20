// sitescan.ts (src/lib/sitescan.ts) · updated 20.10.2026 06:00 (Asia/Jerusalem) — server only. CUSTOMER WEBSITE SCANNER: home page + sitemap + the most product-like internal pages (max ~8) → clean text bundle for the AI (titles, headings, product names, ingredient words). Polite: 8 s timeout per page, same domain only.
const UA = "Mozilla/5.0 (compatible; SilitexCRM/1.0; +https://silitex.marble-art.co.il)";
const KEY = /(product|products|shop|store|collection|category|catalog|range|line|skin|hair|body|face|sun|care|cosmetic|detergent|clean|paint|coating|מוצר|מוצרים|קטגורי|חנות|סדר|קולקצי|טיפוח|שיער|פנים|גוף|שמש|ניקוי|צבע)/i;
const SKIP = /\.(jpg|jpeg|png|gif|webp|svg|pdf|zip|mp4|css|js)(\?|$)|(cart|checkout|login|account|wishlist|privacy|terms|cookie|wp-admin|feed|tel:|mailto:|whatsapp)/i;
export type ScanPage = { url: string; title: string; text: string };
async function get(url: string, ms = 8000): Promise<string> {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "he,en;q=0.8" }, signal: ctl.signal, redirect: "follow", cache: "no-store" }); if (!r.ok) return ""; const ct = r.headers.get("content-type") || ""; if (!/html|xml|text/.test(ct)) return ""; return (await r.text()).slice(0, 600000); } catch { return ""; } finally { clearTimeout(t); }
}
const decode = (s: string) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
export function htmlText(html: string): { title: string; text: string } {
  const title = decode((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || "").trim()).slice(0, 200);
  const meta = decode(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i.exec(html)?.[1] || "");
  const body = html.replace(/<(script|style|noscript|svg|iframe)[\s\S]*?<\/\1>/gi, " ").replace(/<(br|\/p|\/div|\/li|\/h\d|\/tr)[^>]*>/gi, "\n").replace(/<[^>]+>/g, " ");
  const text = decode(body).split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l.length > 2 && l.length < 300).filter((l, i, a) => a.indexOf(l) === i).join("\n");
  return { title, text: (meta ? meta + "\n" : "") + text };
}
function links(html: string, base: URL): { url: string; label: string }[] {
  const out: { url: string; label: string }[] = []; const re = /<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi; let m: RegExpExecArray | null;
  while ((m = re.exec(html))) { try { const u = new URL(m[1], base); if (u.hostname.replace(/^www\./, "") !== base.hostname.replace(/^www\./, "")) continue; u.hash = ""; const s = u.toString(); if (SKIP.test(s)) continue; out.push({ url: s, label: decode(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim().slice(0, 80) }); } catch {} }
  return out;
}
export async function scanSite(website: string, maxPages = 8, budgetMs = 38000): Promise<{ pages: ScanPage[]; error?: string }> {
  const t0 = Date.now(); let base: URL;
  try { base = new URL(/^https?:\/\//.test(website) ? website : "https://" + website); } catch { return { pages: [], error: "bad website" }; }
  const home = await get(base.toString()); if (!home) return { pages: [], error: "site not reachable" };
  const pages: ScanPage[] = [{ url: base.toString(), ...htmlText(home) }];
  const cand = new Map<string, number>();
  for (const l of links(home, base)) { const sc = (KEY.test(l.url) ? 2 : 0) + (KEY.test(l.label) ? 2 : 0) + (l.url.split("/").length <= 6 ? 1 : 0); if (sc > 0) cand.set(l.url, Math.max(cand.get(l.url) || 0, sc)); }
  // sitemap product URLs
  const sm = await get(new URL("/sitemap.xml", base).toString(), 5000);
  if (sm) for (const u of (sm.match(/<loc>([^<]+)<\/loc>/g) || []).map((x) => x.replace(/<\/?loc>/g, "")).slice(0, 400)) if (KEY.test(u) && !SKIP.test(u) && !/sitemap/i.test(u)) cand.set(u, Math.max(cand.get(u) || 0, 1));
  const order = [...cand.entries()].sort((a, b) => b[1] - a[1]).map(([u]) => u).filter((u) => u !== base.toString()).slice(0, maxPages * 2);
  for (const u of order) { if (pages.length >= maxPages || Date.now() - t0 > budgetMs) break; const h = await get(u); if (h) pages.push({ url: u, ...htmlText(h) }); }
  return { pages };
}
export const bundle = (pages: ScanPage[], max = 28000) => pages.map((p) => "### " + p.url + "\n" + p.title + "\n" + p.text).join("\n\n").slice(0, max);
