// route.ts (src/app/api/silitex-lead-request/route.ts) · created 08.11.2026 07:10 (Asia/Jerusalem) — v1.6.0
// 🇮🇹 ONE CUSTOMER → SILITEX (owner only, 100% transparent — Avshi's policy): customer name + website + the customer's own request
// + what Sapirim already answered → English e-mail to Federica / Eleonora asking for focused technical support,
// + the open points as Federica-register items. Rules: never invent data, no prices from us, quote faithfully.
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
import { parseLoose } from "@/lib/studio/json";
export const runtime = "nodejs";
export const maxDuration = 90;
const CATS = ["Products & grades", "Samples & lab", "Regulatory & certificates", "Commercial & prices", "Pharma", "Marketing", "Portal, IT & web"];
const S = (v: unknown, n: number) => String(v || "").slice(0, n);
export async function POST(req: Request) {
  if (req.headers.get("x-partner")) return NextResponse.json({ error: "owner only" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const customer = S(b.customer, 200), website = S(b.website, 300), industry = S(b.industry, 300), city = S(b.city, 100), contact = S(b.contact, 200);
  const request = S(b.request, 5000), answer = S(b.answer, 4000), rows = S(b.rows, 4000), files = S(b.files, 600), extra = S(b.extra, 1500);
  if (!request && !answer) return NextResponse.json({ error: "no customer request or answer to quote" }, { status: 400 });
  const prompt = `You write for Avshi Sapir (Sapirim — Silitex S.r.l. distributor in Israel) to Dr. Federica Biti (Export Sales Manager) and Eleonora Pravato (Export sales assistant) at Silitex.
Avshi's policy is 100% transparency with Silitex about his leads: NAME the customer and give the website.
Write ONE professional, friendly English e-mail:
1. Subject: "New lead Israel — <customer> — <product asked>".
2. Short intro: the customer (name, city, what they make, website URL as given) and who contacted us (name, role).
3. "The customer's request" — a faithful summary of every point they asked (product, grade, specification, quantities, documents, conditions such as "no substitute approved"). Quote key sentences verbatim in quotation marks.
4. "Our first answer (sent)" — a faithful short summary of what Sapirim already replied / offered, quoting the key lines. Mention attached files we sent.
5. "What we need from Silitex" — a numbered, focused list: exact Silitex grade + code that matches, full specification (e.g. viscosity and measurement temperature), confirmation of cosmetic suitability / INCI, TDS, SDS, current-batch CoA, sample availability and size for the customer's pilot, smallest pack + MOQ, price indication for that pack (EUR, Incoterm), lead time, shelf life. Only items still open given our answer; add anything the request needs that the Silitex data does not show.
6. Close warmly; signature: Avshi Sapir · Sapirim — Silitex distribution Israel · avshi@sapirim.com · +972 50 523 1042.
Rules: never invent product data, codes or prices; use only SILITEX DATA for grade names; plain text, no Markdown.
Also return each numbered request as a register item: short question (English, max 200 chars, start with the customer name), category from [${CATS.join(" | ")}], priority blocker|important|nice (blocker = customer cannot test without it).
Return ONLY JSON: {"subject":"...","body":"...","questions":[{"q":"...","cat":"...","prio":"..."}]}

CUSTOMER: ${customer}
CITY: ${city || "—"}
INDUSTRY / WHAT THEY MAKE: ${industry || "—"}
WEBSITE: ${website || "—"}
CONTACT: ${contact || "—"}

THE CUSTOMER'S REQUEST (their e-mail):
${request || "(no e-mail — see our answer)"}

OUR FIRST ANSWER (already sent):
${answer || "(not yet answered)"}
FILES WE ATTACHED: ${files || "none"}

SILITEX DATA (catalogue rows matched to the request):
${rows || "(none matched)"}

AVSHI'S EXTRA NOTE:
${extra || "—"}`;
  try {
    const { text, usage } = await ask(prompt, undefined, 2000, "en");
    const j = parseLoose<{ subject?: string; body?: string; questions?: { q: string; cat: string; prio: string }[] }>(text) || {};
    const qs = (j.questions || []).filter((x) => x && x.q).slice(0, 12).map((x) => ({ q: String(x.q).slice(0, 300), cat: CATS.includes(x.cat) ? x.cat : "Products & grades", prio: ["blocker", "important", "nice"].includes(x.prio) ? x.prio : "important" }));
    return NextResponse.json({ ok: true, subject: String(j.subject || "New lead Israel — " + customer), body: String(j.body || text), questions: qs, usage });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "ai error" }, { status: 502 }); }
}
