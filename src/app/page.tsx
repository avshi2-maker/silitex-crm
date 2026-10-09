"use client";
// page.tsx (src/app/page.tsx) · updated 09.10.2026 10:05 (Asia/Jerusalem) — dashboard
import Link from "next/link";
import { useStore, STAGES, isClosed } from "@/lib/store";
import { PRODUCTS, OFFSETS } from "@/lib/data";
import { Card, H1, Stat, Badge } from "@/components/ui";
import { fmtUsd, todayIso, fmtDate } from "@/lib/format";
import PrioritiesCard from "@/components/PrioritiesCard";
export default function Dashboard() {
  const { state, ready } = useStore();
  if (!ready) return null;
  const today = todayIso();
  const open = state.leads.filter((l) => !isClosed(l.stage));
  const pipelineUsd = open.reduce((a, l) => a + l.value_usd, 0);
  const due = state.tasks.filter((t) => !t.done && t.due <= today);
  return (
    <div className="space-y-6">
      <H1 sub={"היום " + fmtDate(new Date())}>לוח בקרה — Silitex ישראל</H1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="מוצרים בקטלוג" value={PRODUCTS.length} hint={OFFSETS.rows.length + " קטגוריות מקבילות"} />
        <Stat label="לקוחות פוטנציאליים פתוחים" value={open.length} hint={state.leads.length + " סה\"כ"} />
        <Stat label="פוטנציאל שנתי בצנרת" value={fmtUsd(pipelineUsd)} />
        <Stat label="משימות להיום" value={due.length} hint={state.tasks.filter((t) => !t.done).length + " פתוחות"} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold mb-2">צנרת לפי שלב</h3>
          <div className="space-y-1">
            {STAGES.map((s) => { const n = state.leads.filter((l) => l.stage === s.key).length; return (<div key={s.key} className="flex items-center gap-2 text-sm"><span className="w-28">{s.he}</span><div className="flex-1 bg-slate-100 rounded h-3"><div className="bg-brand-500 h-3 rounded" style={{ width: (n / Math.max(1, state.leads.length)) * 100 + "%" }} /></div><span className="w-6 text-left">{n}</span></div>); })}
          </div>
          <Link href="/pipeline" className="text-sm text-brand-500 mt-2 inline-block">לצנרת →</Link>
        </Card>
        <Card>
          <h3 className="font-bold mb-2">משימות להיום</h3>
          {due.length === 0 && <p className="text-sm text-slate-500">אין משימות. <Link href="/schedule" className="text-brand-500">צור לוח יומי/שבועי →</Link></p>}
          <ul className="space-y-1 text-sm">{due.slice(0, 8).map((t) => (<li key={t.id} className="flex gap-2"><Badge tone={t.cadence === "weekly" ? "amber" : "blue"}>{t.cadence === "weekly" ? "שבועי" : "יומי"}</Badge><Link href={"/leads/" + t.lead_id} className="hover:underline">{t.lead_name}</Link><span className="text-slate-500 truncate">— {t.title}</span></li>))}</ul>
        </Card>
      </div>
      <PrioritiesCard />
      <Card>
        <h3 className="font-bold mb-2">לקוחות Tier 1 — פנייה מיידית</h3>
        <div className="grid md:grid-cols-3 gap-2">
          {state.leads.filter((l) => /Tier 1/.test(l.tier)).map((l) => (<Link key={l.id} href={"/leads/" + l.id} className="border rounded-lg p-3 hover:bg-slate-50"><div className="font-medium">{l.name}</div><div className="text-xs text-slate-500">{l.industry}</div><div className="text-xs mt-1">{fmtUsd(l.value_usd)} / שנה · {l.volume_tons} טון</div></Link>))}
        </div>
      </Card>
    </div>
  );
}
