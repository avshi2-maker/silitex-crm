// route.ts (src/app/api/wa-classify/route.ts) · created 08.11.2026 11:50 (Asia/Jerusalem) — v1.7.0
// 🧭 AI sorter for the Sapirim Hub (the Hub has no AI key): POST {text} with header x-hub-wa-key = HUB_WA_KEY →
// {tag, reason} — which of Avshi's businesses a NEW WhatsApp conversation belongs to. Only a suggestion: Avshi confirms with one tap.
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
import { parseLoose } from "@/lib/studio/json";
export const runtime = "nodejs"; export const maxDuration = 30;
const TAGS = {
  sinks: "Marble Art — custom natural-marble sinks, countertops, bathroom / kitchen stone work (private clients, architects, designers)",
  silitex: "Silitex / Sapirim — industrial & cosmetic silicones: antifoams, emulsions, softeners, silicone fluids, TDS / SDS / INCI, samples, factories, R&D",
  artfloor: "Artfloor — microtopping / microcement / Topcret floors and walls, balconies, stairs, renovation without demolition",
  epoxy: "Industrial epoxy / polyurethane floors (Stonhard) — factories, warehouses, cold rooms, food / pharma plants, m² quotes",
  ai: "AI Architect — building apps, CRMs, websites, automations, bots, AI systems for businesses",
  nutri: "NutriClinic — software for nutritionists / dietitians / clinics",
  personal: "Personal — family, friends, private matters, deliveries, spam, nothing business",
} as const;
export async function POST(req: Request) {
  const key = process.env.HUB_WA_KEY;
  if (!key || req.headers.get("x-hub-wa-key") !== key) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({})) as { text?: string }; const text = String(b.text || "").slice(0, 1500);
  if (text.length < 4) return NextResponse.json({ tag: null, reason: "too short" });
  const prompt = "Avshi Sapir runs several businesses in Israel. A NEW WhatsApp message arrived on his business number. Decide which business it belongs to.\n\nBUSINESSES:\n" +
    Object.entries(TAGS).map(([k, v]) => "- " + k + ": " + v).join("\n") +
    "\n\nIf the message is only a greeting or too vague to tell (\"hi\", \"call me\"), answer tag null.\nReturn ONLY JSON: {\"tag\": \"<key or null>\", \"reason\": \"<max 8 words, Hebrew>\"}\n\nMESSAGE:\n" + text;
  try {
    const { text: out, usage } = await ask(prompt, undefined, 120, "any", 12000);
    const j = parseLoose<{ tag?: string | null; reason?: string }>(out) || {};
    const tag = j.tag && j.tag in TAGS ? j.tag : null;
    return NextResponse.json({ tag, reason: String(j.reason || "").slice(0, 80), cost_usd: usage.cost_usd });
  } catch (e) { return NextResponse.json({ tag: null, reason: e instanceof Error ? e.message : "ai error" }); }
}
