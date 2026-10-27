// route.ts (src/app/api/sales-meetings/ai/route.ts) · created 27.10.2026 04:55 (Asia/Jerusalem) — v1.0.0 — owner only
// POST {held_at, with_who, kind, notes, images[{data,type}] (≤6 photos, resized in the browser), leads[{id,name}]} → Claude reads text + handwriting → SmSummary + usage.
import { NextResponse } from "next/server";
import { askWithImages } from "@/lib/ai";
import { SM_PROMPT, smContext, parseSm } from "@/prompts/sales-meeting";
export const runtime = "nodejs";
export const maxDuration = 120;
type Img = { data: string; type: "image/jpeg" | "image/png" | "image/webp" };
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const notes = String(b.notes || "").trim(); const images: Img[] = (Array.isArray(b.images) ? b.images : []).slice(0, 6).filter((x: Img) => x?.data && /^image\/(jpeg|png|webp)$/.test(x.type));
  if (notes.length < 10 && !images.length) return NextResponse.json({ error: "צריך הערות או צילום של הדפים" }, { status: 400 });
  const leads = (Array.isArray(b.leads) ? b.leads : []).slice(0, 800).map((l: { id: string; name: string }) => ({ id: String(l.id), name: String(l.name).slice(0, 80) }));
  try {
    const out = await askWithImages(SM_PROMPT, smContext(String(b.held_at || ""), String(b.with_who || ""), String(b.kind || ""), leads) + (notes ? "\n\nהערות מוקלדות:\n" + notes.slice(0, 60000) : ""), images, 3500);
    const summary = parseSm(out.text);
    if (!summary) return NextResponse.json({ error: out.usage.mock ? "Demo mode — no ANTHROPIC_API_KEY" : "ה-AI לא החזיר מבנה תקין — נסה שוב", usage: out.usage }, { status: 502 });
    return NextResponse.json({ summary, usage: out.usage });
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "ai error" }, { status: 500 }); }
}
