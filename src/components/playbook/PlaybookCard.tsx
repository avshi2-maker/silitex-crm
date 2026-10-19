"use client";
// PlaybookCard.tsx (src/components/playbook/PlaybookCard.tsx) · updated 19.10.2026 11:45 (Asia/Jerusalem) — ACCOUNT PLAYBOOK on the customer page: all steps with owner (me / Silitex / customer / Pini), ✓ done steps with date, the active step (✓ done + note, change date), next steps with estimated dates. No plan yet → pick the template (suggested by industry) + start date → ▶ start.
import { useState } from "react";
import { PLAYBOOKS, OWNER_HE, suggestPlaybook } from "@/config/playbooks";
import { parsePlan, planTasksOf } from "@/lib/playbook";
import { Card, inputCls, btnPrimary } from "@/components/ui";
import { fmtDate, todayIso, addDays } from "@/lib/format";
import type { Lead, Task } from "@/lib/types";
import { useLang } from "@/i18n";
const OWNER_CLS: Record<string, string> = { me: "bg-brand-500 text-white", silitex: "bg-blue-100 text-blue-800", customer: "bg-amber-100 text-amber-800", pini: "bg-violet-100 text-violet-800" };
type Ops = { tasks: Task[]; startPlan: (leadId: string, tpl: string, due: string) => void; advancePlan: (id: string, note: string) => void; setTaskDue: (id: string, due: string) => void; stopPlan: (leadId: string) => void };
export default function PlaybookCard({ lead, ops }: { lead: Lead; ops: Ops }) {
  const { t: tr } = useLang();
  const { startPlan, advancePlan, setTaskDue, stopPlan } = ops;
  const mine = planTasksOf(ops.tasks, lead.id);
  const active = mine.find((t) => !t.done); const ap = parsePlan(active?.kind);
  const lastTpl = ap?.tpl || parsePlan([...mine].sort((a, b) => b.due.localeCompare(a.due))[0]?.kind)?.tpl;
  const [tpl, setTpl] = useState(lastTpl || suggestPlaybook(lead.industry)); const [start, setStart] = useState(todayIso()); const [note, setNote] = useState(""); const [ask, setAsk] = useState(false);
  const today = todayIso();
  if (!active) {
    const finished = !!lastTpl && mine.some((t) => t.done && parsePlan(t.kind)?.seq === PLAYBOOKS[lastTpl]?.steps.length);
    return (
      <Card className="space-y-2">
        <div className="font-bold">🗺️ {tr("תוכנית עבודה")}</div>
        {finished && <div className="text-sm text-emerald-700">✓ {tr("התוכנית הושלמה")}</div>}
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-slate-500">{tr("סוג")}<select className={inputCls + " mt-1"} value={tpl} onChange={(e) => setTpl(e.target.value)}>{Object.entries(PLAYBOOKS).map(([k, v]) => <option key={k} value={k}>{tr(v.he)}</option>)}</select></label>
          <label className="text-xs text-slate-500">{tr("שלב ראשון ב-")}<input type="date" className={inputCls + " mt-1"} value={start} onChange={(e) => setStart(e.target.value)} /></label>
          <button className={btnPrimary} onClick={() => startPlan(lead.id, tpl, start)}>▶ {tr("הפעל תוכנית")}</button>
        </div>
        <ol className="text-xs text-slate-500 list-decimal ms-5">{PLAYBOOKS[tpl].steps.map((s, i) => <li key={i}>{tr(s.title)} · {tr(OWNER_HE[s.owner])}</li>)}</ol>
      </Card>
    );
  }
  const steps = PLAYBOOKS[ap!.tpl].steps; let est = active.due;
  return (
    <Card className="space-y-2">
      <div className="flex items-center gap-2"><div className="font-bold flex-1">🗺️ {tr("תוכנית עבודה")} · {tr(PLAYBOOKS[ap!.tpl].he)}</div><span className="text-xs text-slate-500">{tr("שלב")} <span dir="ltr">{ap!.seq}/{steps.length}</span></span>
        {ask ? <><button className="text-xs px-2 py-1 rounded bg-red-600 text-white" onClick={() => { stopPlan(lead.id); setAsk(false); }}>{tr("כן, עצור")}</button><button className="text-xs px-2 py-1 rounded border" onClick={() => setAsk(false)}>✕</button></> : <button className="text-xs text-slate-400 hover:text-red-600" onClick={() => setAsk(true)}>{tr("עצור תוכנית")}</button>}</div>
      <div className="h-1.5 bg-slate-100 rounded"><div className="h-1.5 bg-brand-500 rounded" style={{ width: Math.round(((ap!.seq - 1) / steps.length) * 100) + "%" }} /></div>
      <ol className="space-y-1.5">{steps.map((s, i) => {
        const n = i + 1; const done = mine.find((t) => t.done && parsePlan(t.kind)?.seq === n && parsePlan(t.kind)?.tpl === ap!.tpl);
        const isActive = n === ap!.seq; if (n > ap!.seq) est = addDays(est, s.wait);
        const badge = <span className={"text-[10px] px-1.5 py-0.5 rounded-full " + OWNER_CLS[s.owner]}>{tr(OWNER_HE[s.owner])}</span>;
        if (isActive) return (
          <li key={n} className="border-2 border-brand-500 rounded-xl p-2 space-y-2 bg-white">
            <div className="flex flex-wrap items-center gap-2"><span className="font-bold">{n}.</span><span className="font-medium flex-1">{tr(s.title)}</span>{badge}<input type="date" className={"border rounded px-1 text-xs " + (active.due < today ? "text-red-600 border-red-300" : "")} value={active.due} onChange={(e) => setTaskDue(active.id, e.target.value)} /></div>
            <div className="flex gap-2"><input className={inputCls + " text-sm"} placeholder={tr("מה היה? (נרשם בתיק הלקוח)")} value={note} onChange={(e) => setNote(e.target.value)} /><button className={btnPrimary + " whitespace-nowrap"} onClick={() => { advancePlan(active.id, note); setNote(""); }}>✓ {tr("בוצע")}</button></div>
            {s.stage && <div className="text-[11px] text-slate-500">{tr("בסיום: השלב בצנרת יעודכן")}</div>}
          </li>);
        return (
          <li key={n} className={"flex items-center gap-2 text-sm px-2 " + (done ? "text-slate-500" : n < ap!.seq ? "text-slate-400" : "text-slate-600")}>
            <span className="w-5">{done ? "✓" : n + "."}</span><span className={"flex-1 " + (done ? "line-through" : "")}>{tr(s.title)}</span>{badge}<span className="text-xs text-slate-400 w-20 text-end">{done ? fmtDate(done.due) : n > ap!.seq ? "~" + fmtDate(est) : ""}</span>
          </li>);
      })}</ol>
    </Card>
  );
}
