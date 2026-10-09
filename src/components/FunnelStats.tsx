"use client";
// FunnelStats.tsx (src/components/FunnelStats.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — sales funnel KPIs for /report: offers, acceptance, win rate, samples pass rate, activity 30d
import { Card } from "./ui";
import { useLang } from "@/i18n";
import type { Lead, Doc, Sample, Activity } from "@/lib/types";
export function funnel(leads: Lead[], docs: Doc[], samples: Sample[], activities: Activity[]) {
  const offers = docs.filter((d) => d.kind === "offer"); const accepted = offers.filter((d) => d.status === "accepted");
  const closed = leads.filter((l) => l.stage === "won" || l.stage === "lost"); const won = leads.filter((l) => l.stage === "won");
  const tested = samples.filter((s) => s.status === "passed" || s.status === "failed"); const passed = samples.filter((s) => s.status === "passed");
  const since = Date.now() - 30 * 864e5;
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) + "%" : "—");
  return {
    offers: offers.length, offersEur: offers.reduce((a, d) => a + (d.amount_eur || 0), 0), acceptedEur: accepted.reduce((a, d) => a + (d.amount_eur || 0), 0),
    acceptRate: pct(accepted.length, offers.length), winRate: pct(won.length, closed.length), passRate: pct(passed.length, tested.length),
    docsSent: docs.filter((d) => d.kind !== "offer").length, touches30: activities.filter((a) => new Date(a.at).getTime() > since).length, wonUsd: won.reduce((a, l) => a + l.value_usd, 0),
  };
}
export default function FunnelStats({ leads, docs, samples, activities }: { leads: Lead[]; docs: Doc[]; samples: Sample[]; activities: Activity[] }) {
  const { t: tr } = useLang(); const f = funnel(leads, docs, samples, activities);
  const cells: [string, string | number][] = [[tr("הצעות מחיר"), f.offers], [tr("סה\"כ הוצע €"), f.offersEur.toLocaleString("en-US")], [tr("התקבל €"), f.acceptedEur.toLocaleString("en-US")], [tr("אחוז קבלת הצעות"), f.acceptRate], [tr("אחוז זכייה"), f.winRate], [tr("דגימות שעברו"), f.passRate], [tr("דפי נתונים נשלחו"), f.docsSent], [tr("מגעים 30 יום"), f.touches30]];
  return (<Card className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-center">{cells.map(([k, v]) => <div key={k} className="border rounded-lg p-2"><div className="text-xs text-slate-500">{k}</div><div className="text-lg font-bold text-ink-900">{v}</div></div>)}</Card>);
}
