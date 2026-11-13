// route.ts (src/app/api/pricelist/route.ts) · created 13.11.2026 13:25 (Asia/Jerusalem) — v1.11.0 💶 Silitex price list (behind the PIN gate, owner only — partners get 403 from the middleware)
// GET → all price_list rows · PUT {row} → upsert one product; a changed / new pack price is appended to history (never lost) · PUT {rows} → many at once (AI quote import)
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { keyOf, type PriceRow, type PriceHist } from "@/lib/pricelist";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const COLS = ["product", "code", "sector", "inci", "cas", "rda", "packs", "tds_url", "sds_url", "po_ref", "countertype", "notes"] as const;

export async function GET() {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ rows: [], note: "no supabase" });
  const r = await sb.from("price_list").select("*").limit(2000);
  if (r.error) return NextResponse.json({ rows: [], error: r.error.message, missing: /does not exist|schema cache/i.test(r.error.message) });
  return NextResponse.json({ rows: r.data || [] });
}

async function upsertOne(sb: NonNullable<ReturnType<typeof serviceClient>>, row: Partial<PriceRow>) {
  if (!row.product) throw new Error("product required");
  const id = keyOf(row.product);
  const cur = (await sb.from("price_list").select("*").eq("id", id).maybeSingle()).data as PriceRow | null;
  const next: Record<string, unknown> = { id, updated_at: new Date().toISOString() };
  for (const k of COLS) if (k in row) next[k] = (row as Record<string, unknown>)[k] ?? (k === "rda" ? null : k === "packs" ? [] : "");
  // history: every pack whose €/kg is new or changed
  const hist: PriceHist[] = [...(cur?.history || [])];
  const old = new Map((cur?.packs || []).map((p) => [p.label.toLowerCase(), p.eur_kg]));
  for (const p of row.packs || []) if (old.get(p.label.toLowerCase()) !== p.eur_kg) hist.push({ at: p.quoted_at || new Date().toISOString().slice(0, 10), label: p.label, eur_kg: p.eur_kg, source: p.source || "" });
  next.history = hist;
  const r = await sb.from("price_list").upsert({ ...(cur || {}), ...next }).select("*").single();
  if (r.error) throw new Error(r.error.message);
  return r.data as PriceRow;
}

export async function PUT(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  const b = (await req.json()) as { row?: Partial<PriceRow>; rows?: Partial<PriceRow>[] };
  try {
    const list = b.rows || (b.row ? [b.row] : []); const saved: PriceRow[] = [];
    for (const r of list) saved.push(await upsertOne(sb, r));
    return NextResponse.json({ saved });
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "save failed" }, { status: 500 }); }
}
