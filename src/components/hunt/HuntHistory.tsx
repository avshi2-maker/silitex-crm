"use client";
// HuntHistory.tsx (src/components/hunt/HuntHistory.tsx) · created 22.10.2026 18:00 (Asia/Jerusalem) — 🧲 search history: per industry → customers in the CRM, search rounds, last search, new found; never-searched industries in amber (the gaps). Click an industry → it fills the builder. Data = activities lead_id "hunt:<industry>" (synced, every device).
import { useMemo } from "react";
import type { Lead, Activity } from "@/lib/types";
import { useLang } from "@/i18n";
import { Badge } from "@/components/ui";
import { industryOptions } from "@/config/industry-list";
import { HUNT_LEAD, parseHuntLog } from "@/lib/hunt-prompt";
import { fmtDate } from "@/lib/format";

export default function HuntHistory({ leads, activities, current, onPick }: { leads: Lead[]; activities: Activity[]; current: string; onPick: (industry: string) => void }) {
  const { t: tr } = useLang();
  const rows = useMemo(() => {
    const hunts = activities.filter((a) => a.lead_id.startsWith("hunt:"));
    return industryOptions(leads.map((l) => l.industry)).map((ind) => {
      const mine = hunts.filter((a) => a.lead_id === HUNT_LEAD(ind)).sort((a, b) => b.at.localeCompare(a.at));
      const found = mine.reduce((s, a) => s + (parseHuntLog(a.text)?.n || 0), 0);
      return { ind, customers: leads.filter((l) => l.industry === ind).length, rounds: mine.length, last: mine[0]?.at || "", found };
    }).sort((a, b) => (a.rounds ? 1 : 0) - (b.rounds ? 1 : 0) || b.customers - a.customers);
  }, [leads, activities]);
  const recent = useMemo(() => activities.filter((a) => a.lead_id.startsWith("hunt:")).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8), [activities]);
  const never = rows.filter((r) => !r.rounds).length;
  return (
    <details className="group">
      <summary className="cursor-pointer font-bold flex flex-wrap items-center gap-2">📚 {tr("היסטוריית חיפושים לפי תעשייה")} <Badge tone="amber">{never} {tr("לא נחפשו עדיין")}</Badge><Badge>{recent.length ? tr("אחרון") + ": " + fmtDate(recent[0].at) : tr("עוד אין חיפושים")}</Badge></summary>
      <div className="overflow-x-auto mt-2"><table className="w-full text-xs">
        <thead className="bg-slate-50"><tr><th className="p-1 text-start">{tr("תעשייה")}</th><th className="p-1">{tr("לקוחות ב-CRM")}</th><th className="p-1">{tr("סבבי חיפוש")}</th><th className="p-1">{tr("חיפוש אחרון")}</th><th className="p-1">{tr("חדשות שנמצאו")}</th></tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.ind} className={"border-t cursor-pointer hover:bg-brand-50 " + (r.ind === current ? "bg-brand-50 font-bold " : "") + (!r.rounds ? "text-amber-700" : "")} onClick={() => onPick(r.ind)} title={tr("לחץ — למלא בבונה")}>
            <td className="p-1" dir="ltr">{!r.rounds && "⚠ "}{r.ind}</td><td className="p-1 text-center">{r.customers}</td><td className="p-1 text-center">{r.rounds || "—"}</td><td className="p-1 text-center">{r.last ? fmtDate(r.last) : "—"}</td><td className="p-1 text-center">{r.rounds ? r.found : "—"}</td>
          </tr>))}</tbody></table></div>
      {recent.length > 0 && <ul className="mt-2 text-xs text-slate-600 space-y-0.5">{recent.map((a) => { const p = parseHuntLog(a.text); return <li key={a.id} dir="auto">{fmtDate(a.at)} · {p ? p.tool + " · " + p.seg + " · " + p.n + " " + tr("חדשים") + " · " + p.u + " " + tr("עודכנו") + " · " + p.s + " " + tr("לסריקה") : a.text}</li>; })}</ul>}
    </details>
  );
}
