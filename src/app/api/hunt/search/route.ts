// route.ts (src/app/api/hunt/search/route.ts) · updated 24.10.2026 05:30 (Asia/Jerusalem) — removed user_location (IL not supported) · created 24.10.2026 05:40
// 🤖 CUSTOMER SEARCH INSIDE THE CRM: the builder's prompt → Claude + the web_search server tool (Israel-localised, up to 20 searches)
// → answer with the CSV → back to the builder (box 3) → import. Replaces the Comet / NotebookLM copy-paste round.
// Owner only (middleware: partners get 403 on /api/*). Handles pause_turn (long searches). Cost = tokens + $0.01 per search.
import { NextResponse } from "next/server";
import { costUsd, WEB_SEARCH_USD } from "@/lib/pricing";
export const runtime = "nodejs";
export const maxDuration = 300;

const MODEL = process.env.HUNT_MODEL || "claude-opus-5-5";
const SYSTEM = "You are a meticulous B2B market researcher for an industrial silicone-chemicals distributor in Israel. Use the web_search tool as much as needed to find REAL companies with local production / formulation / R&D. Never invent companies, people, phones or e-mails — an empty cell is better than a guess. Answer exactly in the requested CSV format, inside one ```csv code block.";
type Block = { type: string; text?: string };

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ error: "ANTHROPIC_API_KEY missing" }, { status: 503 });
  let prompt = ""; try { prompt = String((await req.json()).prompt || "").slice(0, 20000); } catch {}
  if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });
  const messages: { role: "user" | "assistant"; content: unknown }[] = [{ role: "user", content: prompt }];
  const tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 20 }]; // no user_location: the search API rejects country "IL" — the prompt itself says Israel (+ Hebrew queries)
  let inTok = 0, outTok = 0, searches = 0; const texts: string[] = []; const t0 = Date.now();
  try {
    for (let turn = 0; turn < 5; turn++) {
      const left = 285_000 - (Date.now() - t0); if (left < 20_000) break;
      const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), left);
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", signal: ctl.signal, headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: MODEL, max_tokens: 16000, system: SYSTEM, tools, messages }) }).finally(() => clearTimeout(timer));
      const j = await r.json();
      if (!r.ok) return NextResponse.json({ error: j?.error?.message || "AI " + r.status }, { status: 502 });
      const u = j.usage || {}; inTok += (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0); outTok += u.output_tokens || 0; searches += u.server_tool_use?.web_search_requests || 0;
      for (const b of (j.content || []) as Block[]) if (b.type === "text" && b.text) texts.push(b.text);
      if (j.stop_reason !== "pause_turn") break;
      messages.push({ role: "assistant", content: j.content }); // continue the paused search turn unchanged
    }
  } catch (e) {
    if (!texts.length) return NextResponse.json({ error: e instanceof Error && e.name === "AbortError" ? "timeout — try fewer rows" : "network error" }, { status: 504 });
  }
  const cost = costUsd(MODEL, inTok, outTok) + searches * WEB_SEARCH_USD;
  console.log(JSON.stringify({ hunt: "claude-search", model: MODEL, searches, inTok, outTok, cost: +cost.toFixed(3), sec: Math.round((Date.now() - t0) / 1000) }));
  return NextResponse.json({ text: texts.join("\n"), usage: { input_tokens: inTok, output_tokens: outTok, searches, cost_usd: cost, model: MODEL, seconds: Math.round((Date.now() - t0) / 1000) } });
}
