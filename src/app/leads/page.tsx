"use client";
// page.tsx (src/app/leads/page.tsx) · updated 09.10.2026 09:10 (Asia/Jerusalem) — potential customers list + new lead
import Link from "next/link";
import { useState } from "react";
import { useStore, STAGES } from "@/lib/store";
import { Card, H1, Badge, inputCls, btnPrimary } from "@/components/ui";
import { fmtUsd, uid } from "@/lib/format";
import type { Lead } from "@/lib/types";
export default function LeadsPage() {
  const { state, ready, upsertLead } = useStore();
  const [q, setQ] = useState(""); const [ind, setInd] = useState(""); const [showNew, setShowNew] = useState(false);
  const [n, setN] = useState({ name: "", industry: "", use_case: "", contact_role: "", value_usd: "" });
  if (!ready) return null;
  const inds = Array.from(new Set(state.leads.map((l) => l.industry)));
  const list = state.leads.filter((l) => (!ind || l.industry === ind) && (!q || (l.name + l.sub_industry + l.product_match + l.use_case).toLowerCase().includes(q.toLowerCase())));
  const create = () => {
    if (!n.name) return;
    const lead: Lead = { id: uid("LEAD"), name: n.name, industry: n.industry || "אחר", sub_industry: "", product_match: "", use_case: n.use_case, volume_tons: 0, value_usd: Number(n.value_usd) || 0, tier: "Tier 3 - New", department: "", contact_role: n.contact_role, status: "new", stage: "prospect" };
    upsertLead(lead); setShowNew(false); setN({ name: "", industry: "", use_case: "", contact_role: "", value_usd: "" });
  };
  return (
    <div className="space-y-4">
      <H1 sub="מאגר יעדים בישראל לפי תעשייה — Tier, פוטנציאל שנתי, התאמת מוצר">לקוחות פוטנציאליים — {list.length}</H1>
      <Card className="flex flex-wrap gap-2 items-center">
        <input className={inputCls + " flex-1 min-w-[240px]"} placeholder="חיפוש חברה / יישום / מוצר" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls + " w-60"} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">כל התעשיות</option>{inds.map((i) => <option key={i}>{i}</option>)}</select>
        <button className={btnPrimary} onClick={() => setShowNew((v) => !v)}>+ לקוח חדש</button>
      </Card>
      {showNew && (<Card className="grid md:grid-cols-5 gap-2">
        <input className={inputCls} placeholder="שם חברה *" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} />
        <input className={inputCls} placeholder="תעשייה" value={n.industry} onChange={(e) => setN({ ...n, industry: e.target.value })} />
        <input className={inputCls} placeholder="יישום / צורך" value={n.use_case} onChange={(e) => setN({ ...n, use_case: e.target.value })} />
        <input className={inputCls} placeholder="תפקיד איש קשר" value={n.contact_role} onChange={(e) => setN({ ...n, contact_role: e.target.value })} />
        <div className="flex gap-2"><input className={inputCls} placeholder="פוטנציאל $ / שנה" value={n.value_usd} onChange={(e) => setN({ ...n, value_usd: e.target.value })} /><button className={btnPrimary} onClick={create}>שמור</button></div>
      </Card>)}
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="p-2 text-right">חברה</th><th className="p-2 text-right">תעשייה</th><th className="p-2 text-right">התאמת מוצר</th><th className="p-2 text-right">Tier</th><th className="p-2 text-right">פוטנציאל / שנה</th><th className="p-2 text-right">שלב</th></tr></thead>
          <tbody>{list.map((l) => (<tr key={l.id} className="border-t hover:bg-slate-50"><td className="p-2"><Link href={"/leads/" + l.id} className="font-medium text-brand-700 hover:underline">{l.name}</Link><div className="text-xs text-slate-500 line-clamp-1">{l.sub_industry}</div></td><td className="p-2">{l.industry}</td><td className="p-2 text-xs">{l.product_match}</td><td className="p-2"><Badge tone={/Tier 1/.test(l.tier) ? "green" : "amber"}>{l.tier}</Badge></td><td className="p-2 whitespace-nowrap">{fmtUsd(l.value_usd)}<div className="text-xs text-slate-500">{l.volume_tons} טון</div></td><td className="p-2"><Badge tone="blue">{STAGES.find((s) => s.key === l.stage)?.he}</Badge></td></tr>))}</tbody>
        </table>
      </Card>
    </div>
  );
}
