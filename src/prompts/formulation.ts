// formulation.ts (src/prompts/formulation.ts) · updated 09.10.2026 18:00 (Asia/Jerusalem) — adapt a starter formula to Silitex (and D4/D5-free)
import type { Formulation } from "@/lib/formulations";
import { formulationText } from "@/lib/formulations";
export function formulationContext(f: Formulation): string { return formulationText(f); }
export const FORMULATION_PROMPT = "Rewrite this starter formulation as a SILITEX version: keep all non-silicone ingredients and percentages; replace each silicone ingredient with the Silitex product indicated (or state 'to confirm with Silitex lab' where no exact match), and give a second column 'D4/D5-free variant' using linear dimethicone carriers (Silitex DM series, SG 9041 / Velvet Gel D5-free). Output: (1) substitution table (original → Silitex → D5-free), (2) adjusted phase table, (3) 3 lab-check points (viscosity, refractive index/clarity, stability at 50°C), (4) one commercial paragraph for an Israeli cosmetics formulator. Max 300 words.";
