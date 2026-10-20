// route.ts (src/app/api/match/report/route.ts) · created 20.10.2026 18:30 (Asia/Jerusalem) — FREE MATCH REPORT draft: POST {company, contact, lang, industry, scan} → customer-facing report in the visitor's language (he/en/ru/it) from the website scan; honest wording, no prices, signed by Avshi. Avshi reviews and sends it himself. Owner only (PIN gate).
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
export const runtime = "nodejs";
export const maxDuration = 90;
const LANG: Record<string, string> = { he: "Hebrew", en: "English", ru: "Russian", it: "Italian" };
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const company = String(b.company || "").slice(0, 120), contact = String(b.contact || "").slice(0, 80), lang = LANG[String(b.lang)] ? String(b.lang) : "he", industry = String(b.industry || "");
  const scan = JSON.stringify(b.scan || {}).slice(0, 14000);
  if (!company || scan.length < 20) return NextResponse.json({ error: "company and scan required" }, { status: 400 });
  const prompt = `Write a short, personal "free match report" e-mail from Avshi Sapir (Sapirim, Israel — 35 years in industrial silicones; distributes Silitex S.r.l., Italy) to ${contact || "the contact"} at ${company}${industry ? " (" + industry + ")" : ""}.
It is based on an AI reading of their public website (DATA below) that Avshi has reviewed.
Language: ${LANG[lang]} only (product and grade names stay as written).
Structure (plain text, short headings, max ~250 words):
1. One-line thanks for the request.
2. "What we understood about your production" — 2–4 bullets from the product lines in DATA (only what DATA says).
3. "Where Silitex can help" — up to 5 bullets: Silitex grade name → for which product line / function. Use ONLY matches from DATA with confidence high or medium. If none, say a short technical call is needed to choose.
4. Next step: a 20-minute technical call and a lab sample of the 1–2 most relevant grades.
5. Signature: Avshi Sapir · Sapirim · +972-50-523-1042 · avshi@sapirim.com · www.sapirim.com
Rules: no prices; never "identical", "drop-in", "exclusive" or "full replacement" — say "equivalent to verify in your lab"; do not invent products, customers or numbers; friendly and professional.

DATA
${scan}`;
  try { const { text, usage } = await ask(prompt, undefined, 1400, lang as "he" | "en" | "ru" | "it"); return NextResponse.json({ ok: true, text, usage }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "AI error" }, { status: 502 }); }
}
