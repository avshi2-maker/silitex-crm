// route.ts (src/app/api/match/report/route.ts) · updated 20.10.2026 18:40 (Asia/Jerusalem) — prompt moved to lib/match-report (shared with the automatic run) · created 18:30 — FREE MATCH REPORT draft: POST {company, contact, lang, industry, scan} → customer-facing report in the visitor's language (he/en/ru/it) from the website scan; honest wording, no prices, signed by Avshi. Avshi reviews and sends it himself. Owner only (PIN gate).
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
import { reportPrompt, REPORT_LANG } from "@/lib/match-report";
export const runtime = "nodejs";
export const maxDuration = 90;
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const company = String(b.company || "").slice(0, 120), contact = String(b.contact || "").slice(0, 80), lang = REPORT_LANG[String(b.lang)] ? String(b.lang) : "he", industry = String(b.industry || "");
  if (!company || JSON.stringify(b.scan || {}).length < 20) return NextResponse.json({ error: "company and scan required" }, { status: 400 });
  try { const { text, usage } = await ask(reportPrompt({ company, contact, lang, industry, scan: b.scan }), undefined, 1400, lang as "he" | "en" | "ru" | "it"); return NextResponse.json({ ok: true, text, usage }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "AI error" }, { status: 502 }); }
}
