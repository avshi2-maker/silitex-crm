// hubArticles.ts (src/portal/hubArticles.ts) · created 18.11.2026 14:45 (Asia/Jerusalem) — v1.20.0 📰 PUBLIC PORTAL articles published from Sapirim Hub (sapirim + group)
// Read-only: https://hub.marble-art.co.il/api/pub/sapirim (only items Avshi approved with ✅). Cached 5 min — a new article shows within ~5 minutes, no deploy.
const API = "https://hub.marble-art.co.il/api/pub/sapirim";
const H = { "user-agent": "SapirimPortal/1.0 (+https://www.sapirim.com)" };
export type ArticleMeta = { slug: string; title: string; description: string | null; kind: string; published_at: string; updated_at: string; cover_url: string | null };
export type Article = ArticleMeta & { body_html: string; faq: { q: string; a: string }[] };
export async function listArticles(): Promise<ArticleMeta[]> {
  try { const r = await fetch(API, { headers: H, next: { revalidate: 300 } }); if (!r.ok) return []; return ((await r.json()).items || []) as ArticleMeta[]; } catch { return []; }
}
export async function getArticle(slug: string): Promise<Article | null> {
  try { const r = await fetch(`${API}/${encodeURIComponent(slug)}`, { headers: H, next: { revalidate: 300 } }); if (!r.ok) return null; return ((await r.json()).item || null) as Article | null; } catch { return null; }
}
export const dmy = (iso: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
