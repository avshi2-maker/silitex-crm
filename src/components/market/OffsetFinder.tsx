"use client";
// OffsetFinder.tsx (src/components/market/OffsetFinder.tsx) · updated 11.10.2026 08:50 (Asia/Jerusalem) — competitor → Silitex equivalent search (offsets.json) for the "what are you using today?" conversation
import { useMemo, useState } from "react";
import { Card, inputCls } from "@/components/ui";
import { useLang } from "@/i18n";
import offsets from "@/data/offsets.json";
type Row = { category_id: string; family: string; dow_corning?: string; inci?: string; silitex_product: string; kosher?: string; fda?: string; eco_certs?: string; wacker?: string; momentive?: string; evonik?: string; shin_etsu?: string };
const ROWS = (offsets as { rows: Row[] }).rows;
export default function OffsetFinder() {
  const { t: tr } = useLang(); const [q, setQ] = useState("");
  const hits = useMemo(() => { const s = q.trim().toLowerCase(); if (!s) return []; return ROWS.filter((r) => JSON.stringify(r).toLowerCase().includes(s)).slice(0, 8); }, [q]);
  return (
    <Card>
      <div className="font-bold mb-1">🔁 {tr("מאתר תחליפים — \"מה אתם משתמשים היום?\"")}</div>
      <input className={inputCls} placeholder={tr("הקלד מוצר מתחרה / INCI / משפחה (Dow Corning 193, Antifoam A, amodimethicone…)")} value={q} onChange={(e) => setQ(e.target.value)} dir="ltr" />
      {hits.length > 0 && (<table className="w-full text-xs mt-2"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-2 text-start">{tr("משפחה")}</th><th className="p-2 text-start">{tr("מתחרה")}</th><th className="p-2 text-start">Silitex</th><th className="p-2 text-start">{tr("הסמכות")}</th></tr></thead>
        <tbody>{hits.map((r) => (<tr key={r.category_id} className="border-t align-top"><td className="p-2 font-medium">{r.family}</td><td className="p-2 text-slate-600" dir="ltr">{[r.dow_corning, r.wacker, r.momentive, r.evonik, r.shin_etsu].filter(Boolean).join(" · ")}</td><td className="p-2 text-brand-700 font-medium">{r.silitex_product}</td><td className="p-2 text-slate-500">{[r.kosher === "Yes" && "Kosher", r.fda === "Yes" && "FDA", r.eco_certs].filter(Boolean).join(" · ")}</td></tr>))}</tbody></table>)}
      {q && !hits.length && <div className="text-xs text-slate-400 mt-2">{tr("אין התאמה — נסה שם משפחה או INCI")}</div>}
    </Card>
  );
}
