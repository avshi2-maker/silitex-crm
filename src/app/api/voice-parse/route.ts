// route.ts (src/app/api/voice-parse/route.ts) · created 08.11.2026 18:45 (Asia/Jerusalem) — v1.9.0
// 🎙️ Voice-inbox parser for the Sapirim Hub (the Hub has no AI key): POST {text, today, customers:{biz:[names]}} with header
// x-hub-wa-key = HUB_WA_KEY → {tasks:[{biz, customer, title, due}], usage}. Avshi's own note (typed or transcribed) → tasks per business.
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
import { parseLoose } from "@/lib/studio/json";
export const runtime = "nodejs"; export const maxDuration = 40;
const BIZ = {
  silitex: "Silitex / Sapirim — industrial & cosmetic silicones, Silitex Italy (Federica, Eleonora), factories, samples, TDS, quotations",
  sinks: "Marble Art — custom marble sinks / countertops, architects, designers, Ales (the fabricator)",
  artfloor: "Artfloor — microtopping / microcement floors and walls (Topcret)",
  epoxy: "Industrial epoxy floors (Stonhard)",
  ai: "AI Architect — building apps / CRMs / websites for clients, LinkedIn, the Hub itself",
  nutri: "NutriClinic — software for nutritionists (Nir)",
  personal: "Personal / home / family / accounting (Cash-Box, VAT, bank) / anything else",
} as const;
type T = { biz: string; customer: string | null; title: string; due: string };
export async function POST(req: Request) {
  const key = process.env.HUB_WA_KEY;
  if (!key || req.headers.get("x-hub-wa-key") !== key) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({})) as { text?: string; today?: string; customers?: Record<string, string[]> };
  const text = String(b.text || "").slice(0, 4000); const today = String(b.today || new Date().toISOString().slice(0, 10));
  if (text.length < 3) return NextResponse.json({ tasks: [], usage: null });
  const known = Object.entries(b.customers || {}).map(([k, v]) => "- " + k + ": " + (v || []).slice(0, 150).join(" | ")).join("\n");
  const prompt = `Avshi Sapir (one-man business owner in Israel) sent himself a quick note (typed or a transcribed voice message, usually Hebrew). Turn it into concrete TASKS.
TODAY: ${today} (${new Date(today + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long" })}). Week starts Sunday in Israel.
BUSINESSES:
${Object.entries(BIZ).map(([k, v]) => "- " + k + ": " + v).join("\n")}
KNOWN CUSTOMERS per business (match spelling loosely, Hebrew/English; copy the KNOWN name exactly when it matches):
${known || "none"}
Rules: one task per action. title = short imperative Hebrew (keep product / company names as said). customer = known name or the name said, else null.
due = yyyy-mm-dd from what he said ("מחר" = tomorrow, "ביום שלישי" = next Tuesday, "בעוד שבוע" = +7); no date said → today. Never invent tasks that are not in the note.
If the note contains no actionable task, return an empty list.
Return ONLY JSON: {"tasks":[{"biz":"<key>","customer":null,"title":"","due":"yyyy-mm-dd"}]}

NOTE:
${text}`;
  try {
    const { text: out, usage } = await ask(prompt, undefined, 900, "any", 30000);
    const j = parseLoose<{ tasks?: T[] }>(out) || {};
    const tasks = (j.tasks || []).slice(0, 12).map((t) => ({ biz: t.biz in BIZ ? t.biz : "personal", customer: t.customer ? String(t.customer).slice(0, 80) : null, title: String(t.title || "").slice(0, 200), due: /^\d{4}-\d{2}-\d{2}$/.test(String(t.due)) ? String(t.due) : today })).filter((t) => t.title);
    return NextResponse.json({ tasks, usage });
  } catch (e) { return NextResponse.json({ tasks: [], error: e instanceof Error ? e.message : "ai error" }, { status: 500 }); }
}
