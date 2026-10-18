// route.ts (src/app/api/portal/robots/route.ts) · updated 18.10.2026 18:20 (Asia/Jerusalem) — robots.txt for the PUBLIC PORTAL domain (served at /robots.txt on PORTAL_HOST via middleware): allow all + AI crawlers, point to sitemap and llms.txt. The CRM domain keeps its own "Disallow: /".
import { PORTAL_URL } from "@/portal/config";
const AI = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "Bingbot", "Applebot-Extended"];
export function GET() {
  const live = process.env.PORTAL_PUBLIC === "1";
  const body = live
    ? ["User-agent: *", "Allow: /", "Disallow: /api/", "", ...AI.flatMap((b) => ["User-agent: " + b, "Allow: /", ""]), "Sitemap: " + PORTAL_URL + "/sitemap.xml", "# AI summary: " + PORTAL_URL + "/llms.txt"].join("\n")
    : "User-agent: *\nDisallow: /\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
