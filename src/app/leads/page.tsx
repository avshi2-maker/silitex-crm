"use client";
// page.tsx (src/app/leads/page.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — potential customers list + CRM intake (NewLeadForm) + website inbox
import Link from "next/link";
import { useState } from "react";
import { useStore, stageHe } from "@/lib/store";
import { Card, H1, Badge, inputCls, btnPrimary } from "@/components/ui";
import { fmtUsd } from "@/lib/format";
import NewLeadForm from "@/components/leads/NewLeadForm";
import InboxCard from "@/components/leads/InboxCard";
import { useLang } from "@/i18n";
export default function LeadsPage() {
  const { t: tr } = useLang();
  const { state, ready, upsertLead } = useStore();
  const [q, setQ] = useState(""); const [ind, setInd] = useState(""); const [showNew, setShowNew] = useState(false);
  const [prefill, setPrefill] = useState<Record<string, string>>({});
  if (!ready) return null;
  const inds = Array.from(new Set(state.leads.map((l) => l.industry)));
  const list = state.leads.filter((l) => (!ind || l.industry === ind) && (!q || (l.name + l.sub_industry + l.product_match + l.use_case).toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-4">
      <H1 sub={tr("מאגר יעדים בישראל לפי תעשייה — Tier, פוטנציאל שנתי, התאמת מוצר")}>{tr("לקוחות פוטנציאליים — ")}{list.length}</H1>
      <Card className="flex flex-wrap gap-2 items-center">
        <input className={inputCls + " flex-1 min-w-[240px]"} placeholder={tr("חיפוש חברה / יישום / מוצר")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls + " w-60"} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">{tr("כל התעשיות")}</option>{inds.map((i) => <option key={i}>{i}</option>)}</select>
        <button className={btnPrimary} onClick={() => setShowNew((v) => !v)}>{tr("+ לקוח חדש")}</button>
      </Card>
      {showNew && <NewLeadForm initial={prefill} onSave={(l) => { upsertLead(l); setShowNew(false); setPrefill({}); }} onCancel={() => setShowNew(false)} />}
      <InboxCard existing={state.leads.map((l) => l.name)} onImport={(sb) => { setPrefill({ name: sb.company, contact_name: sb.name, contact_phone: sb.phone || "", contact_email: sb.email, source: "טופס אתר", use_case: [sb.product, sb.fields?.application, sb.message].filter(Boolean).join(" · ") }); setShowNew(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="p-2 text-start">{tr("חברה")}</th><th className="p-2 text-start">{tr("תעשייה")}</th><th className="p-2 text-start">{tr("התאמת מוצר")}</th><th className="p-2 text-start">Tier</th><th className="p-2 text-start">{tr("פוטנציאל / שנה")}</th><th className="p-2 text-start">{tr("שלב")}</th></tr></thead>
          <tbody>{list.map((l) => (<tr key={l.id} className="border-t hover:bg-slate-50"><td className="p-2"><Link href={"/leads/" + l.id} className="font-medium text-brand-700 hover:underline">{l.name}</Link><div className="text-xs text-slate-500 line-clamp-1">{l.sub_industry}</div></td><td className="p-2">{l.industry}</td><td className="p-2 text-xs">{l.product_match}</td><td className="p-2"><Badge tone={/Tier 1/.test(l.tier) ? "green" : "amber"}>{l.tier}</Badge></td><td className="p-2 whitespace-nowrap">{fmtUsd(l.value_usd)}<div className="text-xs text-slate-500">{l.volume_tons}{tr(" טון")}</div></td><td className="p-2"><Badge tone="blue">{tr(stageHe(l.stage))}</Badge></td></tr>))}</tbody>
        </table>
      </Card>
    </div>
  );
}
