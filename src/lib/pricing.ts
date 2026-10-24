// pricing.ts (src/lib/pricing.ts) · updated 24.10.2026 05:40 (Asia/Jerusalem) — + 5.5 models + web search $10 / 1,000 searches (platform.claude.com pricing 23.10.2026) · 09.10.2026 09:10
// USD per 1M tokens — adjust when Anthropic pricing changes.
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
  "claude-sonnet-4-5": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-opus-4-1": { input: 15, output: 75 },
};
export function costUsd(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICES[model] || PRICES["claude-sonnet-4-5"];
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

/** Claude web search tool: $10 per 1,000 searches (+ the result tokens, billed as input) */
export const WEB_SEARCH_USD = 0.01;
