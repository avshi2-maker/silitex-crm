// route.ts (src/app/api/capture/process/route.ts) · updated 18.10.2026 06:45 (Asia/Jerusalem) — owner only: POST {secure_url, resource_type, kind, duration} → card: contact JSON (vision) · photo: business facts (vision) · audio/video: Whisper transcript. Returns text + usage (Whisper cost included) for the token meter.
import { NextResponse } from "next/server";
import { askImageUrl } from "@/lib/ai";
import { imageUrl, audioUrl } from "@/lib/cloudinary";
import { transcribe, WHISPER_USD_PER_MIN } from "@/lib/whisper";
import { CARD_PROMPT, PHOTO_PROMPT, parseJson } from "@/prompts/field";
import { MODEL } from "@/lib/pricing";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const url = String(b.secure_url || ""); if (!/^https:\/\/res\.cloudinary\.com\//.test(url)) return NextResponse.json({ error: "Cloudinary URL required" }, { status: 400 });
  try {
    if (b.resource_type === "image") {
      const card = b.kind === "card";
      const out = await askImageUrl(card ? CARD_PROMPT : PHOTO_PROMPT, imageUrl({ secure_url: url }), 900);
      if (out.usage.mock) return NextResponse.json({ error: "Demo mode — no ANTHROPIC_API_KEY" }, { status: 503 });
      return NextResponse.json(card ? { card: parseJson<Record<string, string>>(out.text) || {}, text: out.text, usage: out.usage } : { text: out.text.trim(), usage: out.usage });
    }
    if (b.resource_type === "video") {
      const text = await transcribe(audioUrl({ secure_url: url }));
      const min = Math.max(1, Math.ceil((Number(b.duration) || 60) / 60));
      return NextResponse.json({ text, usage: { input_tokens: 0, output_tokens: 0, cost_usd: min * WHISPER_USD_PER_MIN, model: "whisper-1 (" + MODEL + " not used)" } });
    }
    return NextResponse.json({ error: "nothing to process" }, { status: 400 });
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 500 }); }
}
