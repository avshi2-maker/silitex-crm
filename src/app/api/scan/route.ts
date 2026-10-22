// route.ts (src/app/api/scan/route.ts) · updated 22.10.2026 08:30 (Asia/Jerusalem) — logic moved to lib/scan-run (shared with the server queue) · 07:35 — time-boxed (crawl max 40 s, AI inside 112 s) · 20.10.2026 06:00 — CUSTOMER WEBSITE SCAN: POST {name, website, industry} → crawl → AI: products, silicone uses, Silitex matches, R&D questions → JSON + token usage. Owner only (PIN gate).
import { NextResponse } from "next/server";
import { runScan } from "@/lib/scan-run";
export const runtime = "nodejs";
export const maxDuration = 120;
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || "").slice(0, 120), website = String(b.website || "").trim(), industry = String(b.industry || "");
  if (!website) return NextResponse.json({ error: "no website" }, { status: 400 });
  const r = await runScan(name, website, industry);
  if (!r.ok) return NextResponse.json({ error: r.error, pages: r.pages, usage: r.usage }, { status: r.pages ? 502 : 422 });
  return NextResponse.json({ ok: true, data: r.data, usage: r.usage, pages: r.pages, urls: r.urls, sector: r.sector, at: r.at });
}
