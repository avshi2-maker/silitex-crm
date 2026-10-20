// route.ts (src/app/api/scan/route.ts) · updated 20.10.2026 06:00 (Asia/Jerusalem) — CUSTOMER WEBSITE SCAN: POST {name, website, industry} → crawl the site (home + product pages) → AI: products, silicone uses, Silitex matches (cosmetics = official range), R&D questions → JSON + token usage. Owner only (PIN gate).
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
  const { pages, error } = await scanSite(website);
  if (!pages.length) return NextResponse.json({ error: error || "nothing read", pages: 0 }, { status: 422 });
  const sector = sectorOf(industry);
  try {
    const { text, usage } = await ask(scanPrompt({ name, industry, sector, site: bundle(pages), list: silitexList(sector) }), undefined, 3500, "any");
    const data = parseLoose(text);
    return NextResponse.json({ ok: true, data, usage, pages: pages.length, urls: pages.map((p) => p.url), sector, at: new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "AI error", pages: pages.length }, { status: 502 }); }
}
