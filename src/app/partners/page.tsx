// page.tsx (src/app/partners/page.tsx) · updated 22.10.2026 08:45 (Asia/Jerusalem) — view moved to components/PartnersView (client, translated EN / IT / RU) · 13.10.2026 07:20 — + Ask-Sapirim feedback inbox (Asia/Jerusalem) — OWNER view: partner (Silitex staff) usage — logins, AI questions, tokens, cost per partner + last 50 questions. Server component (service role). Not visible to partners (not in PARTNER_PREFIXES).
import { partnerStats } from "@/lib/partner-usage";
import { listFeedback } from "@/lib/partner-feedback";
import PartnersView from "@/components/PartnersView";
export const dynamic = "force-dynamic";
export default async function PartnersPage() {
  const { stats, recent } = await partnerStats(); const feedback = await listFeedback(); const openCount = feedback.filter((f) => !f.replied_at).length;
  const pins = (process.env.PARTNER_PINS || "").split(",").map((x) => x.split(":")[0]?.trim()).filter(Boolean);
  const tot = stats.reduce((a, s) => ({ asks: a.asks + s.asks, cost: a.cost + s.cost_usd }), { asks: 0, cost: 0 });
  return <PartnersView stats={stats} recent={recent} feedback={feedback} pins={pins} tot={tot} openCount={openCount} />;
}
