"use client";
// PrioritiesCard.tsx (src/components/PrioritiesCard.tsx) · updated 09.10.2026 12:30 (Asia/Jerusalem) — 5 priority product families (from priorities CSV)
import { PRIORITIES } from "@/lib/data";
import { Card, Badge } from "./ui";
import { fmtUsd } from "@/lib/format";
import { useLang } from "@/i18n";
export default function PrioritiesCard() {
  const { t: tr } = useLang();
  const total = PRIORITIES.reduce((a, p) => a + p.value_usd, 0);
  return (
    <Card>
      <div className="flex items-center justify-between mb-2"><h3 className="font-bold">{tr("סדרי עדיפויות — משפחות מוצר")}</h3><Badge tone="green">{tr("פוטנציאל ")}{fmtUsd(total)}{tr(" / שנה")} · {tr("לפי משפחה")}</Badge></div>
      <div className="space-y-2">
        {PRIORITIES.map((p) => (
          <div key={p.rank} className="border rounded-lg p-2 text-sm">
            <div className="flex justify-between gap-2"><span className="font-medium">{p.rank}. {p.family}</span><span className="text-slate-500 whitespace-nowrap">{fmtUsd(p.value_usd)} · {p.volume_tons}{tr(" טון")}</span></div>
            <div className="text-xs text-slate-600 mt-1"><b>SKU:</b> {p.skus}</div>
            <div className="text-xs text-slate-500"><b>{tr("יעדים:")}</b> {p.targets}</div>
            <div className="text-xs text-slate-400"><b>{tr("מחליף:")}</b> {p.offsets}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
