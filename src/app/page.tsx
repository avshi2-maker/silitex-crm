"use client";
// page.tsx (src/app/page.tsx) · updated 16.11.2026 19:30 (Asia/Jerusalem) — v1.14.0 🤖 agent cards waiting (link to /agent) · 16:50 — v1.12.0 REAL PROCESS ONLY: demo blocks removed (pipeline $ potential "19 accounts", lab / pilot / R&D / purchasing stage counters, stage bars, Tier-1 targets, priorities card, "create daily/weekly schedule" link); now: 📁 open projects (stage, ⏰ stall, 🇮🇹 answer in), 🔔 today's tasks, 🆕 new customers (14 days), offers · 08.11.2026 13:00 — v1.7.2 ⚙ demo-data button removed
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useProjects } from "@/lib/use-projects";
import { Card, H1, Stat, Badge } from "@/components/ui";
import { todayIso, fmtDate, addDays } from "@/lib/format";
import { ENDED } from "@/config/projects";
import { stageText, stallInfo } from "@/lib/projects";
import OffersCard from "@/components/OffersCard";
import QuickMatch from "@/components/QuickMatch";
import { useLang } from "@/i18n";
export default function Dashboard() {
  const { t: tr } = useLang();
  const { state, ready } = useStore(); const { list } = useProjects({ lite: true });
  const [agent, setAgent] = useState<number | null>(null); useEffect(() => { fetch("/api/agent?status=pending", { cache: "no-store" }).then((r) => r.json()).then((j) => setAgent((j.items || []).length)).catch(() => setAgent(0)); }, []);
  if (!ready) return null;
  const today = todayIso(); const since = addDays(today, -14);
  const projects = (list || []).filter((p) => !ENDED.includes(p.stage)).sort((a, b) => b.opened_at.localeCompare(a.opened_at));
  const stalled = projects.filter((p) => stallInfo(p).stalled);
  const waiting = projects.filter((p) => p.stage === "silitex");
  const answered = projects.filter((p) => p.silitex_answer && p.stage === "offer");
  const due = state.tasks.filter((t) => !t.done && t.due <= today).sort((a, b) => a.due.localeCompare(b.due));
  const fresh = state.leads.filter((l) => (l.created_at || "").slice(0, 10) >= since).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  return (
    <div className="space-y-6">
      <H1 sub={tr("היום ") + fmtDate(new Date()) + " · " + tr("רק תהליכים אמיתיים פתוחים")}>{tr("לוח בקרה — Silitex ישראל")}</H1>
      <Link href="/agent" className="flex items-center gap-3 rounded-xl border-2 border-violet-300 bg-violet-50 p-4 hover:bg-violet-100"><span className="text-3xl">🤖</span><div className="flex-1"><div className="font-bold">{tr("סוכן משרד")}</div><div className="text-sm text-slate-600">{tr("פעולות ממתינות לאישורך")}</div></div><span className="text-3xl font-extrabold">{agent === null ? "…" : agent}</span></Link>
      <QuickMatch />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat label={"📁 " + tr("פרויקטים פתוחים")} value={list === null ? "…" : projects.length} hint={"#SPR"} />
        <Stat label={"🇮🇹 " + tr("ממתין ל-Silitex")} value={waiting.length} hint={answered.length + " " + tr("תשובה הגיעה")} />
        <Stat label={"⏰ " + tr("תקועים")} value={stalled.length} hint={tr("לקדם או ⏸ לדחות")} />
        <Stat label={"🔔 " + tr("משימות להיום")} value={due.length} hint={state.tasks.filter((t) => !t.done).length + tr(" פתוחות")} />
        <Stat label={"🆕 " + tr("לקוחות חדשים (14 יום)")} value={fresh.length} hint={state.leads.length + tr(" סה״כ")} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center mb-2"><h3 className="font-bold flex-1">📁 {tr("פרויקטים פתוחים")}</h3><Link href="/projects" className="text-sm text-brand-500">{tr("לכל הפרויקטים →")}</Link></div>
          {list !== null && projects.length === 0 && <p className="text-sm text-slate-500">{tr("אין פרויקטים פתוחים.")}</p>}
          <ul className="space-y-1 text-sm">{projects.slice(0, 10).map((p) => { const s = stallInfo(p); return (
            <li key={p.id} className="flex flex-wrap items-center gap-2"><Link href={"/projects/" + p.id} className="font-mono text-brand-700 hover:underline" dir="ltr">#{p.id}</Link><span className="truncate max-w-[12rem]">{p.lead_name}</span><span className="text-xs text-slate-500">{stageText(p.stage)}</span>{s.stalled && <Badge tone="red">⏰ {s.days}</Badge>}{s.held && <Badge tone="amber">⏸</Badge>}{p.silitex_answer && <Badge tone="green">🇮🇹 {tr("תשובה הגיעה")}</Badge>}</li>); })}</ul>
        </Card>
        <Card>
          <h3 className="font-bold mb-2">🔔 {tr("משימות להיום")}</h3>
          {due.length === 0 && <p className="text-sm text-slate-500">{tr("אין משימות להיום.")}</p>}
          <ul className="space-y-1 text-sm">{due.slice(0, 10).map((t) => (<li key={t.id} className="flex gap-2">{t.due < today && <Badge tone="red">{fmtDate(t.due)}</Badge>}<Link href={"/leads/" + t.lead_id} className="hover:underline whitespace-nowrap">{t.lead_name}</Link><span className="text-slate-500 truncate">— {t.title}</span></li>))}</ul>
        </Card>
      </div>
      <Card>
        <h3 className="font-bold mb-2">🆕 {tr("לקוחות חדשים (14 יום)")}</h3>
        {fresh.length === 0 && <p className="text-sm text-slate-500">{tr("אין לקוחות חדשים.")}</p>}
        <div className="grid md:grid-cols-3 gap-2">{fresh.slice(0, 9).map((l) => { const p = projects.find((x) => x.lead_id === l.id); return (
          <Link key={l.id} href={"/leads/" + l.id} className="border rounded-lg p-3 hover:bg-slate-50"><div className="font-medium truncate">{l.name}</div><div className="text-xs text-slate-500">{l.industry} · {l.source || "—"} · {fmtDate(l.created_at)}</div><div className="text-xs mt-1">{p ? <span className="text-brand-700" dir="ltr">📁 #{p.id}</span> : <span className="text-amber-700">{tr("אין פרויקט — 📁 לפתוח")}</span>}</div></Link>); })}</div>
      </Card>
      <OffersCard docs={state.docs} />
    </div>
  );
}
