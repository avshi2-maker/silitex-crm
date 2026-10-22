// route.ts (src/app/api/silitex-request/route.ts) · created 22.10.2026 09:50 (Asia/Jerusalem) — ASK SILITEX → SILITEX REQUEST (owner): POST {question, answer, sources} → English technical e-mail to Silitex (subject + body, customer kept anonymous) + the open questions as register items (cat / prio). Rules: no prices, no "identical / drop-in / exclusive", cosmetics = official range only, never invent data. Returns usage for the token meter.
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
import { parseLoose } from "@/lib/studio/json";
export const runtime = "nodejs";
export const maxDuration = 90;
const CATS = ["Products & grades", "Samples & lab", "Regulatory & certificates", "Commercial & prices", "Pharma", "Marketing", "Portal, IT & web"];
export async function POST(req: Request) {
  if (req.headers.get("x-partner")) return NextResponse.json({ error: "owner only" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const question = String(b.question || "").slice(0, 1500), answer = String(b.answer || "").slice(0, 6000), sources = String(b.sources || "").slice(0, 3000);
  if (question.length < 5) return NextResponse.json({ error: "question required" }, { status: 400 });
  const prompt = `You write for Avshi Sapir (Sapirim — official Silitex S.r.l. distributor in Israel) to Dr. Federica Biti (Silitex export sales) and Eleonora Pravato.
A technical question came up in the Israeli market. Our internal research answer (from the Silitex catalogue) is below.
Write ONE short, professional English e-mail asking Silitex for what is still missing to serve this customer:
- 2–3 sentences of context (market, application). Keep the customer ANONYMOUS ("an Israeli producer of …") unless the question explicitly says it may be named.
- the Silitex grades we already short-listed (only grades that appear in the research answer / sources; codes as written).
- a numbered list of precise requests: technical data, starter formulation, TDS/SDS, regulatory (EU Cosmetics Regulation, D4/D5/D6 residues when cosmetic leave-on), countertype references, samples (quantity), anything the research answer marked as unknown / "to check with Silitex".
- close politely, signature: Avshi Sapir · Sapirim — Silitex distribution Israel · avshi@sapirim.com · +972 50 523 1042.
Rules: no prices or discounts, never "identical", "drop-in" or "exclusive", never invent data, cosmetics = official Silitex cosmetic range only, no food.
Also return each numbered request as a register item: short question (English, max 200 chars), category from [${CATS.join(" | ")}], priority blocker|important|nice (blocker = without it the customer cannot test).
Return ONLY JSON: {"subject":"...","body":"...","questions":[{"q":"...","cat":"...","prio":"..."}]}

QUESTION FROM THE MARKET:
${question}

OUR RESEARCH ANSWER:
${answer || "(none yet — use the sources)"}

SOURCES (catalogue extracts):
${sources || "(none)"}`;
  try {
    const { text, usage } = await ask(prompt, undefined, 1800, "en");
    const j = parseLoose<{ subject?: string; body?: string; questions?: { q: string; cat: string; prio: string }[] }>(text) || {};
    const qs = (j.questions || []).filter((x) => x && x.q).slice(0, 10).map((x) => ({ q: String(x.q).slice(0, 300), cat: CATS.includes(x.cat) ? x.cat : "Products & grades", prio: ["blocker", "important", "nice"].includes(x.prio) ? x.prio : "important" }));
    return NextResponse.json({ ok: true, subject: String(j.subject || "Technical request from Israel"), body: String(j.body || text), questions: qs, usage });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "ai error" }, { status: 502 }); }
}
