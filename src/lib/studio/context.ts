// context.ts (src/lib/studio/context.ts) · updated 18.10.2026 17:10 (Asia/Jerusalem) — POST STUDIO sources: partner-safe index (no customer records / owner strategy), competitor-code equivalents, industry catalogue rows, fixed regulation facts. Same data the public portal will use.
import { searchPartner } from "@/lib/search-partner";
import { searchEquiv } from "@/lib/equiv-search";
import { industryLine } from "@/lib/industry-lines";
import { INDUSTRIES } from "@/config/industries";
import { REGULATION_FACTS } from "@/prompts/studio";
export type StudioKind = "industry" | "code" | "product" | "regulation" | "free";
export const STUDIO_INDUSTRIES = INDUSTRIES.filter((i) => i.key !== "food");
export function studioSources(kind: StudioKind, value: string): { topic: string; context: string; count: number } {
  const parts: string[] = []; let topic = value;
  if (kind === "industry") {
    const ind = STUDIO_INDUSTRIES.find((i) => i.key === value); topic = "Industry: " + (ind?.match.source.split("|").slice(0, 3).join(", ") || value);
    const line = industryLine(value); line.rows.slice(0, 10).forEach((r) => parts.push([r.product, r.code, r.inci && "INCI: " + r.inci, r.active_pct && "Active " + r.active_pct + "%", r.description, r.application && "Application: " + r.application, r.compliance && "Compliance: " + r.compliance].filter(Boolean).join(" · ")));
    searchPartner(topic, 5).forEach((h) => parts.push(h.title + ": " + h.text.slice(0, 500)));
  } else if (kind === "code") {
    topic = "Equivalent to competitor code " + value;
    searchEquiv(value, 4).forEach((h) => parts.push("Competitor " + h.producer + " " + h.competitor + " (" + h.family + ", INCI " + h.inci + ") → Silitex: " + h.silitex + (h.certs.length ? " · certs: " + h.certs.join(", ") : "") + (h.rows[0] ? " · " + h.rows[0].description : "")));
  } else if (kind === "regulation") {
    topic = "Cyclic siloxanes D4 / D5 / D6 — what changed in the rules and what it means for formulators";
    parts.push(REGULATION_FACTS); searchPartner("D4 D5 D6 cyclic siloxane regulation", 4).forEach((h) => parts.push(h.title + ": " + h.text.slice(0, 500)));
  } else {
    searchPartner(value, 8).forEach((h) => parts.push(h.title + ": " + h.text.slice(0, 600)));
  }
  return { topic, context: parts.map((p, i) => "[" + (i + 1) + "] " + p).join("\n"), count: parts.length };
}
