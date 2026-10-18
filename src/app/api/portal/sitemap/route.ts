// route.ts (src/app/api/portal/sitemap/route.ts) · updated 18.10.2026 18:20 (Asia/Jerusalem) — sitemap.xml for the PUBLIC PORTAL: every page in he/en/ru with hreflang alternates (Google + Bing → ChatGPT search)
import { PORTAL_URL, PORTAL_LANGS } from "@/portal/config";
import { portalPaths } from "@/portal/data";
export function GET() {
  const day = new Date().toISOString().slice(0, 10);
  const urls = portalPaths().flatMap((path) => PORTAL_LANGS.map((l) => "<url><loc>" + PORTAL_URL + "/" + l + path + "</loc><lastmod>" + day + "</lastmod>" + PORTAL_LANGS.map((a) => '<xhtml:link rel="alternate" hreflang="' + a + '" href="' + PORTAL_URL + "/" + a + path + '"/>').join("") + "</url>"));
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + urls.join("\n") + "\n</urlset>";
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
