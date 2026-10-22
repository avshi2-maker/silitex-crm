// scan-run.ts (src/lib/scan-run.ts) · created 22.10.2026 08:30 (Asia/Jerusalem) — server only. ONE website-scan run (crawl max 40 s → AI inside the 112 s budget) shared by the browser route /api/scan and the server queue worker /api/scan/worker.
import { scanSite, bundle } from "@/lib/sitescan";
import { scanPrompt, sectorOf, silitexList } from "@/prompts/scan";
import { ask } from "@/lib/ai";
import { parseLoose } from "@/lib/studio/json";
import type { Usage } from "@/lib/types";
import type { ScanData } from "@/lib/scan";
export type RunOut = { ok: true; data: ScanData; usage: Usage; pages: number; urls: string[]; sector: string; at: string } | { ok: false; error: string; pages: number; usage?: Usage };
export async function runScan(name: string, website: string, industry: string, budget = 112000): Promise<RunOut> {
  if (!website) return { ok: false, error: "no website", pages: 0 };
  const t0 = Date.now(); const { pages, error } = await scanSite(website, 8, 40000);
  if (!pages.length) return { ok: false, error: error || "nothing read", pages: 0 };
  const sector = sectorOf(industry);
  try {
    const left = budget - (Date.now() - t0);
    const { text, usage } = await ask(scanPrompt({ name, industry, sector, site: bundle(pages, left < 60000 ? 16000 : 24000), list: silitexList(sector) }), undefined, left < 60000 ? 2200 : 3000, "any", Math.max(20000, left));
    const data = parseLoose(text) as ScanData;
    if (!data || typeof data !== "object") return { ok: false, error: "no answer", pages: pages.length, usage };
    return { ok: true, data, usage, pages: pages.length, urls: pages.map((p) => p.url), sector, at: new Date().toISOString() };
  } catch (e) { const m = e instanceof Error ? e.message : "AI error"; return { ok: false, error: /timed? ?out|abort/i.test(m) ? "timeout" : m, pages: pages.length }; }
}
