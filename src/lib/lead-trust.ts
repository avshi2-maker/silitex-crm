// lead-trust.ts (src/lib/lead-trust.ts) · created 23.10.2026 16:10 (Asia/Jerusalem)
// FOUND-BY-SEVERAL-TOOLS + CONFIDENCE: reads the customer's source ("Comet — … · also found by: Gemini · also found by: NotebookLM")
// → which AI search tools found it, and how much to trust it:
//   ✅ high   = found by 2+ different tools (almost certainly real)
//   🟡 medium = one tool, but its website was scanned (real site, real content)
//   ⚠ low    = one tool only, no readable website → verify before calling
//   📝 manual = typed in / SAP / website form / Silitex / Avshi — not an AI find, no warning
import type { Lead } from "@/lib/types";
import { scanOf, scanErr } from "@/lib/scan";

export type Trust = "high" | "medium" | "low" | "manual";
const TOOLS: [string, RegExp][] = [["Claude", /claude/i], ["Deep Research", /deep research/i], ["NotebookLM", /notebook\s*lm/i], ["Comet", /comet/i], ["Gemini", /gemini/i], ["Perplexity", /perplexity/i], ["ChatGPT", /chatgpt|gpt/i]];

/** distinct AI tools that found this customer, in the order they found it */
export function toolsOf(source?: string): string[] {
  const out: string[] = [];
  for (const part of String(source || "").split(/·\s*also found by:/i)) {
    const hit = TOOLS.find(([, re]) => re.test(part)); if (hit && !out.includes(hit[0])) out.push(hit[0]);
  }
  return out;
}

export function trustOf(l: Lead): { level: Trust; tools: string[]; why: string } {
  const tools = toolsOf(l.source);
  if (!tools.length) return { level: "manual", tools, why: "הוזן ידנית / SAP / טופס — לא חיפוש AI" };
  if (tools.length >= 2) return { level: "high", tools, why: "נמצא ב-" + tools.length + " כלי חיפוש שונים" };
  if (scanOf(l)) return { level: "medium", tools, why: "כלי אחד, האתר נסרק בהצלחה" };
  return { level: "low", tools, why: scanErr(l) ? "כלי אחד, האתר לא נקרא — לאמת" : !l.website ? "כלי אחד, אין אתר — לאמת" : "כלי אחד, האתר עוד לא נסרק — לאמת" };
}

export const TRUST_UI: Record<Trust, { icon: string; he: string; tone: string }> = {
  high: { icon: "✅", he: "אומת ע״י כמה כלים", tone: "green" },
  medium: { icon: "🟡", he: "כלי אחד + אתר", tone: "amber" },
  low: { icon: "⚠", he: "לאמת קודם", tone: "red" },
  manual: { icon: "📝", he: "ידני", tone: "slate" },
};
