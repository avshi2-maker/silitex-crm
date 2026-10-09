// route.ts (src/app/api/cron/crawl/route.ts) · updated 09.10.2026 10:05 (Asia/Jerusalem) — weekly (vercel.json): crawl all categories → Supabase KB. Needs SUPABASE_SERVICE_ROLE_KEY; otherwise reports skip.
import { NextResponse } from "next/server";
import { crawlCategory } from "@/lib/crawl";
import { CATEGORIES } from "@/config/crawl";
import { serviceClient, saveKbServer, kbHasTitle } from "@/lib/server-data";
import { uid } from "@/lib/format";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== "Bearer " + secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!serviceClient()) return NextResponse.json({ ok: false, skipped: "no SUPABASE_SERVICE_ROLE_KEY — crawl from /kb page instead" });
  let saved = 0, skipped = 0; const errors: string[] = [];
  for (const c of CATEGORIES) {
    try {
      const r = await crawlCategory(c); errors.push(...r.errors);
      for (const d of r.docs) {
        if (await kbHasTitle(d.title)) { skipped++; continue; }
        const id = uid("doc");
        const ok = await saveKbServer({ id, title: d.title, doc_type: "SALES", product_ref: d.product_ref, created_at: new Date().toISOString(), chunks: d.chunks.length },
          d.chunks.map((text) => ({ id: uid("chk"), doc_id: id, title: d.title, doc_type: "SALES", product_ref: d.product_ref, text })));
        if (ok) saved++;
      }
    } catch (e: unknown) { errors.push(c + ": " + (e instanceof Error ? e.message : "fail")); }
  }
  return NextResponse.json({ ok: true, saved, skipped, errors: errors.slice(0, 20) });
}
