// route.ts (src/app/api/cron/expo/[slug]/route.ts) · created 28.10.2026 08:45 (Asia/Jerusalem) — v1.3.0 🎪 Expo Ready pack as an HTML page for Federica's NotebookLM (added as a "Website" source; Google fetches it — Silitex IT blocks the CRM site for her).
// Under /api/cron so the PIN gate lets Google in. Content = public exhibitor info + Silitex products only (no customers, no CRM data). Unguessable slug instead of a key, so the notebook never shows the CRM export key.
import { PACKS } from "@/lib/expo-ready";
import { packHtml } from "@/lib/expo-ready-html";
export const dynamic = "force-dynamic";
const SLUGS: Record<string, string> = { "fi-europe-2026-x7k2q9": "fi-europe-2026", "paint-coatings-2026-m4r8t1": "paint-coatings-2026" };
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params; const p = PACKS.find((x) => x.id === SLUGS[slug]);
  if (!p) return new Response("not found", { status: 404 });
  return new Response(packHtml(p), { headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex", "cache-control": "no-store" } });
}
