// engines.ts (src/lib/visibility/engines.ts) · updated 18.10.2026 18:55 (Asia/Jerusalem) — AI VISIBILITY BOT (server): ask the question to Claude (Anthropic web search tool) and ChatGPT (OpenAI Responses API web search) exactly like a user would, return answer text + cited sources + cost. Plain fetch, no extra packages.
import { MODEL, costUsd } from "@/lib/pricing";
export type EngineOut = { text: string; sources: { url: string; title: string }[]; cost: number };
export type Engine = "claude" | "chatgpt";
export const engineReady = (e: Engine) => (e === "claude" ? !!process.env.ANTHROPIC_API_KEY : !!process.env.OPENAI_API_KEY);
const uniq = (s: { url: string; title: string }[]) => s.filter((x, i) => x.url && s.findIndex((y) => y.url === x.url) === i).slice(0, 12);
export async function askClaudeWeb(q: string): Promise<EngineOut> {
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 900, tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }], messages: [{ role: "user", content: q }] }) });
  const j = await r.json(); if (!r.ok) throw new Error("claude: " + (j?.error?.message || r.status));
  const blocks = (j.content || []) as { type: string; text?: string; citations?: { url?: string; title?: string }[]; content?: { url?: string; title?: string }[] }[];
  const text = blocks.filter((b) => b.type === "text").map((b) => b.text || "").join("").trim();
  const sources = uniq([...blocks.flatMap((b) => (b.citations || []).map((c) => ({ url: c.url || "", title: c.title || "" }))), ...blocks.filter((b) => b.type === "web_search_tool_result" && Array.isArray(b.content)).flatMap((b) => (b.content || []).map((c) => ({ url: c.url || "", title: c.title || "" })))]);
  const searches = Number(j.usage?.server_tool_use?.web_search_requests || 0);
  return { text, sources, cost: costUsd(MODEL, j.usage?.input_tokens || 0, j.usage?.output_tokens || 0) + searches * 0.01 };
}
export async function askChatGPTWeb(q: string): Promise<EngineOut> {
  const call = (tool: string) => fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: "Bearer " + (process.env.OPENAI_API_KEY || ""), "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.OPENAI_VIS_MODEL || "gpt-4.1-mini", tools: [{ type: tool }], input: q }) });
  let r = await call("web_search"); if (r.status === 400) r = await call("web_search_preview");
  const j = await r.json(); if (!r.ok) throw new Error("chatgpt: " + (j?.error?.message || r.status));
  type Ann = { type: string; url?: string; title?: string }; type Part = { type: string; text?: string; annotations?: Ann[] };
  const parts = ((j.output || []) as { type: string; content?: Part[] }[]).filter((o) => o.type === "message").flatMap((o) => o.content || []).filter((c) => c.type === "output_text");
  const text = parts.map((p) => p.text || "").join("").trim() || String(j.output_text || "");
  const sources = uniq(parts.flatMap((p) => (p.annotations || []).filter((a) => a.type === "url_citation").map((a) => ({ url: a.url || "", title: a.title || "" }))));
  const calls = ((j.output || []) as { type: string }[]).filter((o) => /web_search/.test(o.type)).length;
  return { text, sources, cost: ((j.usage?.input_tokens || 0) * 0.4 + (j.usage?.output_tokens || 0) * 1.6) / 1e6 + calls * 0.025 };
}
