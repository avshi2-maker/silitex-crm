// route.ts (src/app/api/scan/route.ts) · updated 22.10.2026 07:35 (Asia/Jerusalem) — time-boxed: crawl max 40 s, AI gets the rest of the 112 s (smaller text + shorter answer when the site was slow) → always a JSON answer, never a silent 120 s server cut · 20.10.2026 06:00 (Asia/Jerusalem) — CUSTOMER WEBSITE SCAN: POST {name, website, industry} → crawl the site (home + product pages) → AI: products, silicone uses, Silitex matches (cosmetics = official range), R&D questions → JSON + token usage. Owner only (PIN gate).
import { NextResponse } from "next/server";
import { scanSite, bundle } from "@/lib/sitescan";
import { scanPrompt, sectorOf, silitexList } from "@/prompts/scan";
import { ask } from "@/lib/ai";
import { parseLoose } from "@/lib/studio/json";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || "").slice(0, 120), website = String(b.website || "").trim(), industry = String(b.industry || "");
  if (!website) return NextResponse.json({ error: "no website" }, { status: 400 });
  const t0 = Date.now(); const { pages, error } = await scanSite(website, 8, 40000);
  if (!pages.length) return NextResponse.json({ error: error || "nothing read", pages: 0 }, { status: 422 });
  const sector = sectorOf(industry);
  try {
    const left = 112000 - (Date.now() - t0); const { text, usage } = await ask(scanPrompt({ name, industry, sector, site: bundle(pages, left < 60000 ? 16000 : 24000), list: silitexList(sector) }), undefined, left < 60000 ? 2200 : 3000, "any", Math.max(20000, left));
    const data = parseLoose(text);
    return NextResponse.json({ ok: true, data, usage, pages: pages.length, urls: pages.map((p) => p.url), sector, at: new Date().toISOString() });
  } catch (e) { const m = e instanceof Error ? e.message : "AI error"; return NextResponse.json({ error: /timed? ?out|abort/i.test(m) ? "timeout" : m, pages: pages.length }, { status: 502 }); }
}
