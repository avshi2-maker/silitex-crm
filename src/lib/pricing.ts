// pricing.ts (src/lib/pricing.ts) · updated 09.10.2026 09:10 (Asia/Jerusalem)
// USD per 1M tokens — adjust when Anthropic pricing changes.
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-5": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-opus-4-1": { input: 15, output: 75 },
};
export function costUsd(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICES[model] || PRICES["claude-sonnet-4-5"];
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}
