// intake.ts (src/lib/intake.ts) · updated 09.10.2026 19:30 (Asia/Jerusalem)
// Helpers for the 8-section fact-finding intake: seed records, completeness %, text summary for AI prompts.
import records from "@/data/intake_records.json";
import { INTAKE, INTAKE_FIELDS } from "@/config/intake";
import type { Lead } from "@/lib/types";
export const INTAKE_SEED = (records as { records: Record<string, Record<string, string>> }).records;
export function intakeOf(lead: Lead): Record<string, string> { return lead.intake && Object.keys(lead.intake).length ? lead.intake : INTAKE_SEED[lead.id] || {}; }
export function intakePct(lead: Lead): number {
  const v = intakeOf(lead); const req = INTAKE_FIELDS.filter((f) => f.req);
  const core = [lead.name, lead.contact_name, lead.contact_phone].filter(Boolean).length;
  return Math.round(((req.filter((f) => (v[f.id] || "").trim()).length + core) / (req.length + 3)) * 100);
}
export function intakeSummary(lead: Lead): string {
  const v = intakeOf(lead);
  return INTAKE.map((s) => { const rows = s.fields.filter((f) => (v[f.id] || "").trim()).map((f) => "  " + f.he + ": " + v[f.id]); return rows.length ? s.n + ". " + s.he + "\n" + rows.join("\n") : ""; }).filter(Boolean).join("\n");
}
