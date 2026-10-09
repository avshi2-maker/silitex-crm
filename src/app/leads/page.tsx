"use client";
// page.tsx (src/app/leads/page.tsx) · updated 09.10.2026 10:30 (Asia/Jerusalem) — potential customers list + new lead
import Link from "next/link";
import { useState } from "react";
import { useStore, stageHe } from "@/lib/store";
import { Card, H1, Badge, inputCls, btnPrimary } from "@/components/ui";
import { fmtUsd, uid } from "@/lib/format";
import type { Lead } from "@/lib/types";
import { useLang } from "@/i18n";
export default function LeadsPage() {
  const { t: tr } = useLang();
  const { state, ready, upsertLead } = useStore();
  const [q, setQ] = useState(""); const [ind, setInd] = useState(""); const [showNew, setShowNew] = useState(false);
  const [n, setN] = useState({ name: "", industry: "", use_case: "", contact_role: "", value_usd: "" });
  if (!ready) return null;
  const inds = Array.from(new Set(state.leads.map((l) => l.industry)));
  const list = state.leads.filter((l) => (!ind || l.industry === ind) && (!q || (l.name + l.sub_industry + l.product_match + l.use_case).toLowerCase().includes(q.toLowerCase())));
  const create = () => {
    if (!n.name) return;
    const lead: Lead = { id: uid("LEAD"), name: n.name, industry: n.industry || tr("אחר"), sub_industry: "", product_match: "", use_case: n.use_case, volume_tons: 0, value_usd: Number(n.value_usd) || 0, tier: "Tier 3 - New", department: "", contact_role: n.contact_role, status: "new", stage: "prospect" };
    upsertLead(lead); setShowNew(false); setN({ name: "", industry: "", use_case: "", contact_role: "", value_usd: "" });
  };
  return (
    <div className="space-y-4">
      <H1 sub={tr("מאגר יעדים בישראל לפי תעשייה — Tier, פוטנציאל שנתי, התאמת מוצר")}>{tr("לקוחות פוטנציאליים — ")}{list.length}</H1>
      <Card className="flex flex-wrap gap-2 items-center">
        <input className={inputCls + " flex-1 min-w-[240px]"} placeholder={tr("חיפוש חברה / יישום / מוצר")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls + " w-60"} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">{tr("כל התעשיות")}</option>{inds.map((i) => <option key={i}>{i}</option>)}</select>
        <button className={btnPrimary} onClick={() => setShowNew((v) => !v)}>{tr("+ לקוח חדש")}</button>
      </Card>
      {showNew && (<Card className="grid md:grid-cols-5 gap-2">
        <input className={inputCls} placeholder={tr("שם חברה *")} value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} />
        <input className={inputCls} placeholder={tr("תעשייה")} value={n.industry} onChange={(e) => setN({ ...n, industry: e.target.value })} />
        <input className={inputCls} placeholder={tr("יישום / צורך")} value={n.use_case} onChange={(e) => setN({ ...n, use_case: e.target.value })} />
        <input className={inputCls} placeholder={tr("תפקיד איש קשר")} value={n.contact_role} onChange={(e) => setN({ ...n, contact_role: e.target.value })} />
        <div className="flex gap-2"><input className={inputCls} placeholder={tr("פוטנציאל $ / שנה")} value={n.value_usd} onChange={(e) => setN({ ...n, value_usd: e.target.value })} /><button className={btnPrimary} onClick={create}>{tr("שמור")}</button></div>
      </Card>)}
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="p-2 text-start">{tr("חברה")}</th><th className="p-2 text-start">{tr("תעשייה")}</th><th className="p-2 text-start">{tr("התאמת מוצר")}</th><th className="p-2 text-start">Tier</th><th className="p-2 text-start">{tr("פוטנציאל / שנה")}</th><th className="p-2 text-start">{tr("שלב")}</th></tr></thead>
          <tbody>{list.map((l) => (<tr key={l.id} className="border-t hover:bg-slate-50"><td className="p-2"><Link href={"/leads/" + l.id} className="font-medium text-brand-700 hover:underline">{l.name}</Link><div className="text-xs text-slate-500 line-clamp-1">{l.sub_industry}</div></td><td className="p-2">{l.industry}</td><td className="p-2 text-xs">{l.product_match}</td><td className="p-2"><Badge tone={/Tier 1/.test(l.tier) ? "green" : "amber"}>{l.tier}</Badge></td><td className="p-2 whitespace-nowrap">{fmtUsd(l.value_usd)}<div className="text-xs text-slate-500">{l.volume_tons}{tr(" טון")}</div></td><td className="p-2"><Badge tone="blue">{tr(stageHe(l.stage))}</Badge></td></tr>))}</tbody>
        </table>
      </Card>
    </div>
  );
}
