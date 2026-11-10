// route.ts (src/app/api/call-parse/route.ts) · created 10.11.2026 16:10 (Asia/Jerusalem) — v1.10.2 🗣 call analysis for the Sapirim Hub "מנתח שיחות"
// The Hub has no AI key: POST {text, today} (a transcribed phone call / pasted chat, usually Hebrew) with header x-hub-wa-key = HUB_WA_KEY
// → {analysis:{box, confidence, summary, who, company, phone, asked, next_step, next_due}, usage}. Only what was SAID; empty when not said.
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
import { parseLoose } from "@/lib/studio/json";
export const runtime = "nodejs"; export const maxDuration = 60;
const BOX = {
  silitex: "silicones (industrial / cosmetic), Silitex Italy, antifoams, emulsions, softeners, samples, TDS, quotations for factories",
  sinks: "Marble Art — custom marble sinks / countertops, architects, interior designers, Ales the fabricator",
  artfloor: "Artfloor — microtopping / microcement floors and walls (Topcret)",
  epoxy: "industrial epoxy floors (Stonhard)",
  nutri: "NutriClinic — software for nutritionists",
  ai: "AI Architect — building apps / CRMs / websites for clients",
  personal: "personal / family / home / bank / spam / sales calls TO Avshi",
} as const;
export async function POST(req: Request) {
  const key = process.env.HUB_WA_KEY;
  if (!key || req.headers.get("x-hub-wa-key") !== key) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { text?: string; today?: string };
  const text = String(b.text || "").slice(0, 30000); const today = String(b.today || new Date().toISOString().slice(0, 10));
  if (text.length < 10) return NextResponse.json({ analysis: null, usage: null });
  const prompt = `This is a transcribed phone call (or pasted chat) of Avshi Sapir, a one-man business owner in Israel. TODAY: ${today}.
Decide which business box it belongs to and pull out ONLY what was actually said. Never invent: a field that was not said = "".
BOXES:
${Object.entries(BOX).map(([k, v]) => "- " + k + ": " + v).join("\n")}
Reply with ONE line of JSON only:
{"box":"<one key above or \\"\\">","confidence":0-100,"summary":"2 short Hebrew sentences","who":"","company":"","phone":"","asked":"what the other side wants (Hebrew)","next_step":"Hebrew, what Avshi promised / must do next","next_due":"YYYY-MM-DD or \\"\\"","junk":true|false}
junk = spam / wrong number / sales pitch with nothing for Avshi.`;
  try {
    const { text: out, usage } = await ask(prompt, text, 700, "any", 50000);
    return NextResponse.json({ analysis: parseLoose(out), usage });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "AI failed" }, { status: 502 }); }
}
