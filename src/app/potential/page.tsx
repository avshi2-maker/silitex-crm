"use client";
// page.tsx (src/app/potential/page.tsx) · updated 22.10.2026 08:35 (Asia/Jerusalem) — server-scan results applied here too (report always synced) · created 22.10.2026 08:05 (Asia/Jerusalem) — 🎯 POTENTIAL ANALYTICS: live from every customer + website scan + A/B/C/D priority. KPIs · tons by industry (matched vs all) · Silitex grades most in demand · ranked target list (filter industry / grade / scanned) · 📅 put the top targets into the next month's tasks (Sun–Thu, N per day) · 🇮🇹 Federica view: English, counts only, no company names · CSV + export bar.
import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, H1, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import Bars from "@/components/potential/Bars";
import { rowsOf, byIndustry, byGrade, matched, federicaText, csvOf, schedule, taskTitle } from "@/lib/potential";
import { fmtDate, todayIso } from "@/lib/format";
import type { Grade } from "@/lib/priority";
import { useLang } from "@/i18n";
import { useScanJobs } from "@/lib/use-scan-jobs";
const TONE: Record<Grade, string> = { A: "green", B: "blue", C: "amber", D: "slate" };
const r1 = (n: number) => Math.round(n * 10) / 10;
export default function PotentialPage() {
  const { t: tr } = useLang();
  const { state, ready, addTask, upsertLead } = useStore();
  const sj = useScanJobs(state.leads, upsertLead, ready);
  const [ind, setInd] = useState(""); const [g, setG] = useState<Grade | "">(""); const [onlyM, setOnlyM] = useState(false); const [tab, setTab] = useState<"me" | "fed">("me");
  const [n, setN] = useState(20); const [perDay, setPerDay] = useState(2); const [msg, setMsg] = useState("");
  const rows = useMemo(() => rowsOf(state.leads, state.tasks), [state.leads, state.tasks]);
  if (!ready) return null;
  const inds = byIndustry(rows); const grades = byGrade(rows);
  const list = rows.filter((r) => (!ind || r.lead.industry === ind) && (!g || r.s.grade === g) && (!onlyM || matched(r)));
  const sc = rows.filter((r) => r.scanned).length, mt = rows.filter(matched), tonsM = mt.reduce((a, r) => a + r.s.tons, 0);
  const plan = schedule(list, state.tasks, n, perDay);
  const doPlan = () => { plan.forEach(({ r, due }) => addTask({ lead_id: r.lead.id, lead_name: r.lead.name, title: taskTitle(r), due, cadence: "once", kind: "followup" })); setMsg("✓ " + plan.length + tr(" משימות נוספו ל'היום שלי' עד ") + (plan.length ? fmtDate(plan[plan.length - 1].due) : "")); };
  const csv = () => { const b = new Blob(["﻿" + csvOf(list)], { type: "text/csv;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "silitex_potential_" + todayIso() + ".csv"; a.click(); };
  const fed = federicaText(rows, fmtDate(todayIso()));
  const meText = list.slice(0, 60).map((r, i) => (i + 1) + ". " + r.lead.name + " · " + r.lead.industry + " · " + r.s.grade + " " + r.s.total + " · ~" + r1(r.s.tons) + " t · " + (r.grades.join(", ") || "—")).join("\n");
  const kpi = (v: string | number, l: string, sub?: string) => <div className="bg-white border rounded-xl p-3"><div className="text-2xl font-bold text-ink-900" dir="ltr">{v}</div><div className="text-xs text-slate-500">{l}</div>{sub && <div className="text-[11px] text-slate-400">{sub}</div>}</div>;
  const tabCls = (on: boolean) => "px-3 py-2 rounded-lg text-sm " + (on ? "bg-brand-500 text-white" : "bg-white border");
  return (
    <div className="space-y-4">
      <H1 sub={tr("מתעדכן לבד מכל לקוח, כל סריקת אתר ומנוע העדיפויות A/B/C/D. מי הכי מתאים ל-Silitex ובאיזה נפח — כדי לפנות אליהם קודם.")}>🎯 {tr("פוטנציאל — מי קודם")}</H1>
      {sj.busy && sj.st && <div className="text-xs text-emerald-700">🚀 {tr("סריקה בשרת פעילה:")} {sj.st.queued} {tr("בתור")} — {tr("הדוח מתעדכן לבד")}</div>}
      <div className="flex flex-wrap gap-2"><button className={tabCls(tab === "me")} onClick={() => setTab("me")}>🎯 {tr("רשימת יעדים שלי")}</button><button className={tabCls(tab === "fed")} onClick={() => setTab("fed")}>🇮🇹 {tr("לפדריקה — באנגלית, בלי שמות")}</button></div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {kpi(rows.length, tr("לקוחות בתיק"), tr("ללא מזון"))}
        {kpi(sc + " / " + rows.length, tr("אתרים נסרקו"), Math.round((100 * sc) / Math.max(1, rows.length)) + "%")}
        {kpi(mt.length, tr("עם התאמת Silitex"), tr("חזקה או בינונית"))}
        {kpi("~" + r1(tonsM) + " t", tr("נפח משוער — מותאמים"), tr("טון לשנה, הערכה לפי Tier כשאין נתון"))}
        {kpi(rows.filter((r) => r.s.grade === "A").length + " / " + rows.filter((r) => r.s.grade === "B").length, "A / B", tr("להתחיל עכשיו / אחריהם"))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card><div className="font-bold mb-2">{tr("נפח משוער לפי תעשייה (טון/שנה)")} <span className="text-xs font-normal text-slate-400">{tr("כהה = עם התאמה · בהיר = כל הלקוחות")}</span></div><Bars unit=" t" items={inds.map((x) => ({ label: x.industry, value: x.tonsMatched, total: x.tons, note: x.matched + "/" + x.total }))} /></Card>
        <Card><div className="font-bold mb-2">{tr("דרגות Silitex הכי מבוקשות")} <span className="text-xs font-normal text-slate-400">{tr("מספר לקוחות שהסריקה התאימה")}</span></div>{grades.length ? <Bars items={grades.slice(0, 14).map((x) => ({ label: x.grade, value: x.customers, note: x.strong + " " + tr("חזקות") }))} /> : <div className="text-sm text-slate-500">{tr("עוד אין סריקות — הרץ סריקה ב-")}<Link href="/scan" className="underline">/scan</Link></div>}</Card>
      </div>
      {tab === "fed" ? (
        <Card className="space-y-2"><div className="font-bold">🇮🇹 {tr("תמונת פוטנציאל לפדריקה")}</div><pre className="whitespace-pre-wrap text-sm bg-slate-50 rounded-lg p-3" dir="ltr">{fed}</pre><ExportBar title={"Sapirim — Silitex Israel · market potential " + fmtDate(todayIso())} text={fed} filename={"silitex_potential_federica_" + todayIso() + ".txt"} /></Card>
      ) : (<>
        <Card className="space-y-2">
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-slate-500">{tr("תעשייה")}<select className={inputCls + " mt-1"} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">{tr("הכל")}</option>{inds.map((x) => <option key={x.industry} value={x.industry}>{x.industry} ({x.total})</option>)}</select></label>
            <label className="text-xs text-slate-500">{tr("דירוג")}<select className={inputCls + " mt-1"} value={g} onChange={(e) => setG(e.target.value as Grade | "")}><option value="">{tr("הכל")}</option>{(["A", "B", "C", "D"] as Grade[]).map((x) => <option key={x}>{x}</option>)}</select></label>
            <label className="text-xs flex items-center gap-1 border rounded-lg px-2 py-2"><input type="checkbox" checked={onlyM} onChange={(e) => setOnlyM(e.target.checked)} />{tr("רק עם התאמת Silitex")}</label>
            <span className="text-sm text-slate-500 flex-1" dir="ltr">{list.length}</span>
            <button className={btnGhost} onClick={csv}>⬇️ Excel (CSV)</button>
          </div>
          <div className="flex flex-wrap items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl p-2 text-sm">
            <b>📅 {tr("לחודש הקרוב:")}</b>{tr("קח את")}<select className={inputCls + " !w-20 py-1"} value={n} onChange={(e) => setN(Number(e.target.value))}>{[10, 20, 30, 40].map((x) => <option key={x}>{x}</option>)}</select>{tr("הראשונים ברשימה (בלי משימה פתוחה),")}<select className={inputCls + " !w-16 py-1"} value={perDay} onChange={(e) => setPerDay(Number(e.target.value))}>{[1, 2, 3, 4].map((x) => <option key={x}>{x}</option>)}</select>{tr("ביום, א׳–ה׳")}
            <button className={btnPrimary} disabled={!plan.length} onClick={doPlan}>{tr("שבץ")} {plan.length} {tr("משימות")}{plan.length ? " · " + fmtDate(plan[0].due) + " → " + fmtDate(plan[plan.length - 1].due) : ""}</button>
            {msg && <span className="text-emerald-700">{msg} · <Link href="/today" className="underline">{tr("היום שלי")}</Link></span>}
          </div>
        </Card>
        <Card className="divide-y">{list.map((r, i) => (
          <div key={r.lead.id} className="py-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="w-7 text-slate-400 tabular-nums" dir="ltr">{i + 1}</span>
            <Badge tone={TONE[r.s.grade]}>{r.s.grade} {r.s.total}</Badge>
            <Link href={"/leads/" + r.lead.id} className="font-medium text-brand-700 hover:underline">{r.lead.name}</Link>
            <span className="text-xs text-slate-400">{r.lead.industry}</span>
            <span className="text-xs text-slate-600" dir="ltr">~{r1(r.s.tons)} t</span>
            {r.scanned ? <span className="text-xs">{r.hi > 0 && <Badge tone="green">{r.hi} {tr("חזקות")}</Badge>} {r.md > 0 && <Badge tone="blue">{r.md} {tr("בינוניות")}</Badge>}{!matched(r) && <Badge tone="slate">{tr("אין התאמה")}</Badge>}</span> : r.failed ? <Link href="/scan" className="text-xs text-red-600">⚠️ {tr("סריקה נכשלה")}</Link> : <Link href="/scan" className="text-xs text-amber-700">{tr("לא נסרק")}</Link>}
            <span className="text-xs text-slate-500 basis-full md:basis-auto md:ms-auto truncate max-w-full md:max-w-[45%]" dir="ltr" title={r.grades.join(" · ")}>{r.grades.slice(0, 3).join(" · ")}</span>
          </div>))}</Card>
        <ExportBar title={tr("פוטנציאל — רשימת יעדים") + " · " + fmtDate(todayIso())} text={meText} filename={"potential_" + todayIso() + ".txt"} />
      </>)}
    </div>
  );
}
