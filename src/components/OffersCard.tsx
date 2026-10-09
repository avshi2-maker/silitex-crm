"use client";
// OffersCard.tsx (src/components/OffersCard.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — dashboard: open price offers, expiring soon, total EUR
import Link from "next/link";
import { Card, Badge } from "./ui";
import { fmtDate, todayIso, addDays } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Doc } from "@/lib/types";
export default function OffersCard({ docs }: { docs: Doc[] }) {
  const { t: tr } = useLang();
  const open = docs.filter((d) => d.kind === "offer" && d.status === "sent").sort((a, b) => (a.valid_until || "").localeCompare(b.valid_until || ""));
  const soon = addDays(todayIso(), 5); const today = todayIso();
  const total = open.reduce((a, d) => a + (d.amount_eur || 0), 0);
  return (
    <Card>
      <div className="flex items-center justify-between mb-2"><h3 className="font-bold">{tr("הצעות מחיר פתוחות")} ({open.length})</h3><b className="text-brand-500">€{total.toLocaleString("en-US")}</b></div>
      {open.length === 0 && <p className="text-sm text-slate-400">{tr("אין הצעות פתוחות. שלח הצעה מתיק הלקוח → מסמכים.")}</p>}
      <ul className="text-sm space-y-1">{open.slice(0, 6).map((d) => { const late = (d.valid_until || "") < today, near = !late && (d.valid_until || "") <= soon; return (<li key={d.id} className="flex items-center gap-2"><Badge tone={late ? "red" : near ? "amber" : "blue"}>{late ? tr("פג") : near ? tr("פג בקרוב") : tr("פתוח")}</Badge><Link href={"/leads/" + d.lead_id} className="font-medium text-brand-700 hover:underline">{d.lead_name}</Link><span className="text-slate-500 truncate">€{(d.amount_eur || 0).toLocaleString("en-US")} · {tr("עד")} {fmtDate(d.valid_until)}</span></li>); })}</ul>
    </Card>
  );
}
