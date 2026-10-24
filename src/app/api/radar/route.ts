// route.ts (src/app/api/radar/route.ts) · updated 24.10.2026 06:10 (Asia/Jerusalem) — fix "no table": text blocks joined without separators (citations split the JSON) + repair pass without search · created 24.10.2026 06:00
// 🛰️ GAP RADAR — owner only. GET → saved runs (newest first, 12). POST {ours: string[]} → Claude + web search over the 5 producers' industry pages
// → rows (fit + match to our list) → saved in radar_runs. Cost = tokens + $0.01 per search (meter in the UI).
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { costUsd, WEB_SEARCH_USD } from "@/lib/pricing";
import { radarPrompt, parseRows } from "@/lib/radar";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
const MODEL = process.env.HUNT_MODEL || "claude-opus-5-5";

export async function GET() {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ runs: [] });
  const r = await sb.from("radar_runs").select("id,created_at,model,searches,input_tokens,output_tokens,cost_usd,rows").order("created_at", { ascending: false }).limit(12);
  return r.error ? NextResponse.json({ error: r.error.message }, { status: 500 }) : NextResponse.json({ runs: r.data || [] });
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY; if (!key) return NextResponse.json({ error: "ANTHROPIC_API_KEY missing" }, { status: 503 });
  let ours: string[] = []; try { const j = await req.json(); ours = (Array.isArray(j.ours) ? j.ours : []).map(String).slice(0, 80); } catch {}
  const messages: { role: "user" | "assistant"; content: unknown }[] = [{ role: "user", content: radarPrompt(ours) }];
  const tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 25 }];
  let inTok = 0, outTok = 0, searches = 0; const texts: string[] = []; const t0 = Date.now();
  try {
    for (let turn = 0; turn < 5; turn++) {
      const left = 285_000 - (Date.now() - t0); if (left < 20_000) break;
      const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), left);
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", signal: ctl.signal, headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: MODEL, max_tokens: 16000, system: "You are a silicone-industry market analyst. Be factual and cite producer pages. Answer only with the requested JSON block.", tools, messages }) }).finally(() => clearTimeout(timer));
      const j = await r.json(); if (!r.ok) return NextResponse.json({ error: j?.error?.message || "AI " + r.status }, { status: 502 });
      const u = j.usage || {}; inTok += (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0); outTok += u.output_tokens || 0; searches += u.server_tool_use?.web_search_requests || 0;
      for (const b of (j.content || []) as { type: string; text?: string }[]) if (b.type === "text" && b.text) texts.push(b.text);
      if (j.stop_reason !== "pause_turn") break;
      messages.push({ role: "assistant", content: j.content });
    }
  } catch (e) { if (!texts.length) return NextResponse.json({ error: e instanceof Error && e.name === "AbortError" ? "timeout" : "network error" }, { status: 504 }); }
  const raw = texts.join(""); // web-search answers come as many text blocks split at citations — join WITHOUT separators or JSON strings break
  let rows = parseRows(raw);
  if (!rows.length && raw.trim()) { // repair pass: same model, no tools — turn the research text into the JSON table
    try {
      const r2 = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: MODEL, max_tokens: 12000, messages: [{ role: "user", content: radarPrompt(ours).split("Output ONLY")[0] + "\nBelow is research text already collected. Do NOT search again. Convert it into the JSON array exactly as specified (fields: industry, producers, functions, silitex_fit, our_match, israel, who, uses, sources). Output ONLY one ```json block.\n\nRESEARCH TEXT:\n" + raw.slice(-60000) }] }) });
      const j2 = await r2.json(); if (r2.ok) { const u = j2.usage || {}; inTok += u.input_tokens || 0; outTok += u.output_tokens || 0; rows = parseRows(((j2.content || []) as { type: string; text?: string }[]).filter((b) => b.type === "text").map((b) => b.text).join("")); }
    } catch {}
  }
  if (!rows.length) { console.log(JSON.stringify({ radar: "no-table", searches, inTok, outTok, tail: raw.slice(-400) })); return NextResponse.json({ error: "no table in the answer — run again (" + searches + " searches, $" + (costUsd(MODEL, inTok, outTok) + searches * WEB_SEARCH_USD).toFixed(2) + ")" }, { status: 502 }); }
  const cost = costUsd(MODEL, inTok, outTok) + searches * WEB_SEARCH_USD;
  const run = { model: MODEL, searches, input_tokens: inTok, output_tokens: outTok, cost_usd: +cost.toFixed(4), rows, raw };
  const sb = serviceClient(); let saved: Record<string, unknown> = { ...run, id: "local-" + Date.now(), created_at: new Date().toISOString() };
  if (sb) { const w = await sb.from("radar_runs").insert(run).select("id,created_at").single(); if (!w.error && w.data) saved = { ...run, ...w.data }; }
  delete saved.raw;
  console.log(JSON.stringify({ radar: "run", rows: rows.length, searches, cost: run.cost_usd, sec: Math.round((Date.now() - t0) / 1000) }));
  return NextResponse.json({ run: saved });
}
