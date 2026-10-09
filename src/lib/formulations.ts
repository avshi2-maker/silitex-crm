// formulations.ts (src/lib/formulations.ts) · updated 09.10.2026 18:00 (Asia/Jerusalem) — typed access to src/data/formulations.json + Silitex substitution lookup
import data from "@/data/formulations.json";
export type Row = [string, number, string];
export type Phase = { phase: string; rows: Row[] };
export type Formulation = { id: string; code: string; name: string; category: string; type: string; source: string; pdf: string; hero_ingredient: string; claims: string[]; properties: { appearance: string; viscosity: string; ph: string; stability: string }; procedure: string[]; phases: Phase[] };
export type Sub = { silitex: string; note: string; d5free: boolean };
export const FORMULATIONS = (data as unknown as { items: Formulation[] }).items;
export const SUBS = (data as unknown as { silitex_map: Record<string, Sub> }).silitex_map;
export const FORM_META = data as unknown as { updated: string; disclaimer: string; notebooklm_prompt: string; cases: unknown[] };
export const isSilicone = (inci: string) => /siloxane|dimethicone|trimethicone|silicone|silsesquioxane|siloxysilicate/i.test(inci);
export function subFor(inci: string): Sub | undefined { return SUBS[inci] || Object.entries(SUBS).find(([k]) => inci.toLowerCase().includes(k.toLowerCase()))?.[1]; }
export function formulationText(f: Formulation): string {
  return f.name + " (" + f.code + ") · " + f.type + "\n" + f.source + "\n\n" + f.phases.map((p) => "Phase " + p.phase + "\n" + p.rows.map((r) => "  " + r[1] + "%  " + r[0] + "  [" + r[2] + "]" + (isSilicone(r[0]) ? "  → Silitex: " + (subFor(r[0])?.silitex || "—") : "")).join("\n")).join("\n") + "\n\nProcedure:\n" + f.procedure.map((s, i) => (i + 1) + ". " + s).join("\n");
}
