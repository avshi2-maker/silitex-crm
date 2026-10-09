// report.ts (src/prompts/report.ts) · updated 09.10.2026 18:30 (Asia/Jerusalem) — monthly principal report to Silitex (always English)
import { stageHe, isClosed } from "@/config/stages";
import { fmtDate, fmtUsd } from "@/lib/format";
import type { Lead, Sample, Activity, Doc } from "@/lib/types";
export function reportContext(leads: Lead[], samples: Sample[], activities: Activity[], docs: Doc[] = []): string {
  const offers = docs.filter((d) => d.kind === "offer");
  const byStage: Record<string, Lead[]> = {}; leads.forEach((l) => (byStage[l.stage] = [...(byStage[l.stage] || []), l]));
  const open = leads.filter((l) => !isClosed(l.stage));
  return "Report date: " + fmtDate(new Date()) + "\nOpen accounts: " + open.length + " · potential " + fmtUsd(open.reduce((a, l) => a + l.value_usd, 0)) + " · " + open.reduce((a, l) => a + l.volume_tons, 0) + " t/yr\n" +
    "Won: " + (byStage.won || []).map((l) => l.name + " (" + fmtUsd(l.value_usd) + ")").join(", ") + "\n\nPipeline by stage:\n" + Object.entries(byStage).map(([s, ls]) => "- " + stageHe(s) + " / " + s + ": " + ls.map((l) => l.name + " [" + (l.recommended_sku || l.product_match) + "]").join("; ")).join("\n") +
    "\n\nSamples (" + samples.length + "):\n" + samples.map((s) => "- " + s.lead_name + ": " + s.sku + " " + s.kg + "kg, sent " + fmtDate(s.sent_at) + ", status " + s.status + (s.result ? ", " + s.result : "")).join("\n") +
    "\n\nPrice offers (" + offers.length + ", EUR " + offers.reduce((a, d) => a + (d.amount_eur || 0), 0) + "):\n" + offers.map((d) => "- " + d.lead_name + ": EUR " + (d.amount_eur || 0) + ", sent " + fmtDate(d.sent_at) + ", valid " + fmtDate(d.valid_until) + ", " + d.status).join("\n") + "\nData sheets sent: " + docs.filter((d) => d.kind !== "offer").length +
    "\n\nRecent activity (last 30):\n" + activities.slice(0, 30).map((a) => "- " + fmtDate(a.at) + " " + a.kind + ": " + a.text).join("\n");
}
export const REPORT_PROMPT = "Write the monthly DISTRIBUTOR REPORT TO PRINCIPAL (Silitex S.r.l.) in professional English, max 350 words, with headings: 1) Executive summary, 2) Pipeline by stage (counts + key accounts), 3) Samples in field & lab results, 4) Offers, wins & contracts (EUR offered / accepted), 5) Forecast next 90 days (tons, EUR estimate at ~5 EUR/kg where unknown — mark as estimate), 6) Support needed from Silitex. Use the data only; no invented facts. Sign: Avshi Sapir, Silitex Israel.";
