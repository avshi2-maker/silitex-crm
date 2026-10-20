// route.ts (src/app/api/matrix/en/route.ts) · created 20.10.2026 09:40 (Asia/Jerusalem) — FEDERICA DRAFT: POST {text} (industry → product category → Silitex grade → gap, counts only) → clean English draft for the Friday report, merges near-duplicate categories, never adds company names. Owner only (PIN gate).
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
export const runtime = "nodejs";
export const maxDuration = 90;
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})); const text = String(b.text || "").slice(0, 30000);
  if (!text.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });
  const prompt = `You prepare the Israel market-mapping section of Avshi Sapir's weekly Friday report to Federica (Silitex S.r.l., export manager).
Input below (Hebrew): per industry → product category found on Israeli producers' websites → (number of producers) → Silitex grades matched → gap.
Write it in clear professional English:
- One short intro line: work in progress, built from producers' websites, matches are first suggestions to confirm in the lab.
- Per industry: heading with "N producers mapped / N scanned", then a compact table in plain text: Product category | Producers | Silitex grade(s) | Gap (Yes / No / To check).
- Merge near-duplicate categories (sum the producer counts). Translate categories to English; keep grade names exactly as written.
- NEVER add or guess company names, prices, volumes, or claims like "identical", "drop-in", "exclusive".
- End with "Gaps for Silitex to review:" = bullet list of the Yes rows (category + industry).
Plain text only, no markdown symbols except "|" in tables.

INPUT
${text}`;
  try { const { text: out, usage } = await ask(prompt, undefined, 3000, "en"); return NextResponse.json({ ok: true, text: out, usage }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "AI error" }, { status: 502 }); }
}
