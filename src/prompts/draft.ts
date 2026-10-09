// draft.ts (src/prompts/draft.ts) · updated 09.10.2026 18:20 (Asia/Jerusalem) — AI draft of a new starter formula from a one-line brief (toy: clearly labelled, lab validation required)
import { ROLES, PRODUCT_TYPES, SIW_PATTERN } from "@/config/patterns";
export function draftContext(): string {
  return "Silitex building blocks by role:\n" + ROLES.map((r) => "- " + r.role + ": " + r.chem + " → " + r.silitex + " (D5-free: " + r.d5free + ")").join("\n") + "\n\nProduct-type patterns:\n" + PRODUCT_TYPES.map((p) => "- " + p.type + ": " + p.silitex).join("\n") + "\n\nProcess pattern (Si/W):\n" + SIW_PATTERN.map((s, i) => (i + 1) + ". " + s).join("\n");
}
export function draftPrompt(brief: string): string {
  return "Draft a STARTER formulation for: \"" + brief + "\". Use Silitex products as the silicone components (from the blocks above); other ingredients generic INCI. Output: name + type (O/W, W/O, Si/W, anhydrous); phase table (phase, INCI, wt%, function, Silitex product where silicone) summing to 100; procedure (numbered); expected properties (appearance, viscosity range, pH); 3 lab checks; one line 'D4/D5 status'. Header line must read: 'AI DRAFT — reference only, requires lab validation; Silitex SKUs are catalog cross-references'. Max 350 words.";
}
