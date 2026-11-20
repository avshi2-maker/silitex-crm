// route.ts (src/app/api/keyword-mine/route.ts) · created 20.11.2026 08:55 (Asia/Jerusalem) — v1.21.0 🌙 AI word miner for the Sapirim Hub WTA Nudge bank (the Hub has no AI key)
// POST {tabs:[{key,desc,words[]}], texts:[{src,tag,text}], searches:[{tag,query}]} with header x-hub-wa-key = HUB_WA_KEY →
// {items:[{tag,phrase,match,weight,negative,why,from}], usage}. Only SUGGESTIONS: Avshi approves each word in the Hub.
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
import { parseLoose } from "@/lib/studio/json";
export const runtime = "nodejs"; export const maxDuration = 90;
type Tab = { key: string; desc: string; words: string[] };
export async function POST(req: Request) {
  const key = process.env.HUB_WA_KEY;
  if (!key || req.headers.get("x-hub-wa-key") !== key) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({})) as { tabs?: Tab[]; texts?: { src?: string; tag?: string | null; text: string }[]; searches?: { tag: string; query: string }[] };
  const tabs = (b.tabs || []).slice(0, 12); const texts = (b.texts || []).slice(0, 60); const searches = (b.searches || []).slice(0, 80);
  if (!tabs.length || (!texts.length && !searches.length)) return NextResponse.json({ items: [], usage: null });
  const prompt = "You maintain a KEYWORD BANK that routes Avshi Sapir's incoming WhatsApp messages and e-mails (Israel, mostly Hebrew, some English) to the right business tab. " +
    "Each tab already has words. Read the NEW messages and the NEW Google searches below and propose words / short phrases (1–3 words) that are MISSING from the bank and would help route future messages correctly.\n\n" +
    "TABS (key: business · existing words):\n" + tabs.map((t) => "- " + t.key + ": " + t.desc + " · existing: " + t.words.join(", ")).join("\n") +
    "\n\nRULES:\n- Only words a real customer would write or search (products, materials, problems, places in a home / factory, industry terms, common misspellings, English terms).\n" +
    "- Hebrew words in base form (no ה/ו/ב/ל prefix). Never names of people, phone numbers, dates, prices, greetings, or generic words (מחיר, שלום, תודה, פרטים, הצעה).\n" +
    "- weight: 3 = only this business uses it · 2 = strong hint · 1 = weak hint. match: broad (word, any form) · phrase (exact 2–3 word phrase) · exact (short word that must stand alone).\n" +
    "- negative: true ONLY for a phrase that looks like this tab but means something else (it blocks the tab).\n" +
    "- A message already tagged with a tab is a confirmed example of that tab. Untagged ones: suggest only when the tab is clear.\n" +
    "- At most 25 items. Do not repeat existing words.\n\n" +
    "Return ONLY JSON: {\"items\":[{\"tag\":\"<tab key>\",\"phrase\":\"...\",\"match\":\"broad|phrase|exact\",\"weight\":1,\"negative\":false,\"why\":\"<max 8 words, Hebrew>\",\"from\":\"whatsapp|mail|google\"}]}\n\n" +
    "NEW MESSAGES:\n" + (texts.map((t, i) => "[" + (i + 1) + "] (" + (t.src || "") + (t.tag ? " · tab " + t.tag : "") + ") " + String(t.text || "").slice(0, 600).replace(/\s+/g, " ")).join("\n") || "(none)") +
    "\n\nNEW GOOGLE SEARCHES (tab · query):\n" + (searches.map((s) => s.tag + " · " + s.query).join("\n") || "(none)");
  try {
    const { text, usage } = await ask(prompt, undefined, 2500, "any", 80000);
    const j = parseLoose<{ items?: unknown[] }>(text) || {};
    return NextResponse.json({ items: Array.isArray(j.items) ? j.items : [], usage });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "ai error" }, { status: 500 }); }
}
