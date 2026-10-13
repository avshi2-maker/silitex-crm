// integrity.ts (src/lib/integrity.ts) · updated 13.10.2026 07:00 (Asia/Jerusalem) — honesty check for the plan: which Yr-1 tons rest on SKUs confirmed in the 2026 catalogues, which rest on website-only names (catalogues not yet received), and which sector catalogues to ask Silitex for.
import type { Lead } from "@/lib/types";
import { provenance, skuTokens, type Provenance } from "@/lib/catalog";
export type LeadCheck = { id: string; name: string; tons: number; usd: number; status: "full" | "core" | "pending"; tokens: { t: string; p: Provenance }[] };
export function checkLeads(leads: Lead[]): { rows: LeadCheck[]; backedTons: number; pendingTons: number; backedUsd: number; pendingUsd: number; websiteOnly: string[] } {
  const rows: LeadCheck[] = leads.map((l) => { const tokens = skuTokens(l.recommended_sku || "").map((t) => ({ t, p: provenance(t) })); const core = tokens[0]?.p; const status = tokens.length && tokens.every((x) => x.p === "catalogue") ? "full" : core === "catalogue" ? "core" : "pending"; return { id: l.id, name: l.name, tons: l.volume_tons || 0, usd: l.value_usd || 0, status, tokens }; });
  const backed = rows.filter((r) => r.status !== "pending"), pend = rows.filter((r) => r.status === "pending");
  const websiteOnly = Array.from(new Set(rows.flatMap((r) => r.tokens.filter((x) => x.p === "website").map((x) => x.t)))).sort();
  return { rows, backedTons: backed.reduce((a, r) => a + r.tons, 0), pendingTons: pend.reduce((a, r) => a + r.tons, 0), backedUsd: backed.reduce((a, r) => a + r.usd, 0), pendingUsd: pend.reduce((a, r) => a + r.usd, 0), websiteOnly };
}
/** sector catalogues NOT yet received (the website lists these families; the 5 PDFs don't) */
export const MISSING_CATALOGUES = ["Textile finishing (MICROAMISIL, MACROAMISIL, NANOAMISIL, STONIX, BIRDYSIL, GOTS grades)", "Paper & pulp (VOLUMEX, VOLUSOFT, ANTIGAP paper, CPL 2907 paper)", "Building / water repellents (SILWALL PRF 100, SAR BRILL, BRILSAR 1000, REOPERG)", "Water-treatment chemicals (BLACKFLOC, CATLOX HC, BLACK OIL demulsifiers, SINDEKOR)", "Industrial / metalworking antifoams (SUREVAT, DYNAKOS 130 E, REOGUM 500, ANTISCHIUMA 3, BERETEX 350)", "Agro adjuvants (AGRIWET) — not in the Food & Agri catalogue", "Raw materials / fluids technical line (FLUIDO DI SILICONE 5–2,000,000 cSt, GOMMA SILICONICA)"];
