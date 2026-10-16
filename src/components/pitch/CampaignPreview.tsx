"use client";
// CampaignPreview.tsx (src/components/pitch/CampaignPreview.tsx) · updated 16.10.2026 09:20 (Asia/Jerusalem) — /pitch "After signing — LinkedIn campaign": one approved-style draft post (public/campaign/dynapan-draft.png) + the 4 operating rules (cadence, Silitex approval, tracking, cost).
const RULES: [string, string][] = [
  ["📅 Cadence", "2 posts a month, one technical theme each — cyclic-free routes, plant-origin antifoams, cost-in-use, kosher food line."],
  ["✅ Silitex approves", "Every claim comes from your TDS; nothing is published about your brand without your written approval. We tag the Silitex company page so your team can share."],
  ["📈 Measured", "Each post points to a 2 kg sample request; the CRM records post → sample request → lab test, reported monthly."],
  ["💶 Sapirim invests", "Content, design and posting are Sapirim's cost. From Silitex: TDS data, approval within a few days, a share when a post goes live."],
];
export const campaignText = () => "After signing — LinkedIn campaign\n" + RULES.map(([t, d]) => "  • " + t.replace(/^\S+ /, "") + ": " + d).join("\n");
export default function CampaignPreview() {
  return (
    <section className="bg-white border rounded-2xl p-6 shadow-sm" dir="ltr">
      <h2 className="text-2xl font-bold text-ink-900">After signing — LinkedIn campaign</h2>
      <p className="text-slate-600 mt-1 mb-4">Your sales network and Israeli R&amp;D chemists and plant managers are on LinkedIn. One draft example — for discussion, not published.</p>
      <div className="grid lg:grid-cols-[3fr_2fr] gap-5 items-start">
        <img src="/campaign/dynapan-draft.png" alt="Draft LinkedIn post — DYNAPAN cost-in-use (for Silitex approval)" className="w-full rounded-xl border" />
        <ul className="space-y-3">{RULES.map(([t, d]) => <li key={t} className="border rounded-xl p-3"><div className="font-bold text-sm">{t}</div><div className="text-sm text-slate-600 mt-0.5">{d}</div></li>)}</ul>
      </div>
    </section>
  );
}
