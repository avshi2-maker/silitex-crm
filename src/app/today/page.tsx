"use client";
// page.tsx (src/app/today/page.tsx) · updated 17.10.2026 08:15 (Asia/Jerusalem) — "My day": every open task (leads, follow-ups, Silitex meetings) by overdue / today / next 7 days; ✓ opens one form → log on the lead + stage + next step; active leads with no next step; quick add; call / WhatsApp links
import { useState } from "react";
import Link from "next/link";
import { useStore, stageHe } from "@/lib/store";
import { isClosed } from "@/config/stages";
import { Card, H1, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import DoneForm from "@/components/today/DoneForm";
import { fmtDate, todayIso, addDays } from "@/lib/format";
import type { Task, Lead } from "@/lib/types";
import { useLang } from "@/i18n";
const wa = (p?: string) => { const d = (p || "").replace(/\D/g, ""); return d ? "https://wa.me/" + (d.startsWith("0") ? "972" + d.slice(1) : d) : ""; };
export default function TodayPage() {
  const { t: tr } = useLang();
  const { state, ready, completeTask, toggleTask, addTask } = useStore();
  const [open, setOpen] = useState(""); const [q, setQ] = useState({ lead: "", title: "", due: todayIso() }); const [plan, setPlan] = useState<Record<string, string>>({});
  if (!ready) return null;
  const today = todayIso(); const week = addDays(today, 7); const weekAgo = addDays(today, -7);
  const leadOf = (t: Task) => state.leads.find((l) => l.id === t.lead_id);
  const openTasks = state.tasks.filter((t) => !t.done).sort((a, b) => a.due.localeCompare(b.due));
  const groups = [
    { key: "late", he: "באיחור", tone: "red", items: openTasks.filter((t) => t.due < today) },
    { key: "today", he: "היום", tone: "blue", items: openTasks.filter((t) => t.due === today) },
    { key: "week", he: "7 הימים הקרובים", tone: "slate", items: openTasks.filter((t) => t.due > today && t.due <= week) },
  ];
  const withTask = new Set(openTasks.map((t) => t.lead_id));
  const idle = state.leads.filter((l) => !isClosed(l.stage) && !withTask.has(l.id)).sort((a, b) => (b.value_usd || 0) - (a.value_usd || 0));
  const doneToday = state.activities.filter((a) => a.at.slice(0, 10) === today && a.kind !== "stage" && a.kind !== "import").length;
  const calls7 = state.activities.filter((a) => a.at.slice(0, 10) >= weekAgo && ["call", "email", "whatsapp", "visit"].includes(a.kind)).length;
  const text = groups.map((g) => tr(g.he) + ":\n" + g.items.map((t) => "  ☐ " + fmtDate(t.due) + " " + t.lead_name + " — " + t.title).join("\n")).join("\n\n");
  const row = (t: Task) => {
    const l = leadOf(t); const ph = l?.contact_phone;
    return (
      <li key={t.id} className="border rounded-xl p-3 bg-white">
        <div className="flex flex-wrap items-center gap-2">
          <button aria-label={tr("בוצע")} onClick={() => setOpen(open === t.id ? "" : t.id)} className="w-9 h-9 shrink-0 rounded-lg border-2 border-slate-300 hover:border-brand-500 text-lg">{open === t.id ? "✎" : ""}</button>
          <div className="flex-1 min-w-[12rem]">
            <div className="font-medium">{t.title}</div>
            <div className="text-xs text-slate-500 flex flex-wrap gap-2 items-center">
              {l ? <Link href={"/leads/" + l.id} className="text-brand-700 font-medium hover:underline">{l.name}</Link> : t.lead_id === "silitex" ? <Link href="/meetings" className="text-brand-700 hover:underline">Silitex</Link> : <span>{t.lead_name}</span>}
              {l && <Badge tone="blue">{tr(stageHe(l.stage))}</Badge>}
              {l?.contact_name && <span>{l.contact_name}</span>}
              <span className={t.due < today ? "text-red-600 font-bold" : ""}>{fmtDate(t.due)}</span>
              {t.kind && <span className="text-slate-400">{t.kind}</span>}
            </div>
          </div>
          {ph && <a href={"tel:" + ph.replace(/\s/g, "")} className={btnGhost + " text-xs"}>📞 {ph}</a>}
          {ph && <a href={wa(ph)} target="_blank" rel="noreferrer" className={btnGhost + " text-xs"}>💬</a>}
        </div>
        {open === t.id && (l
          ? <DoneForm stage={l.stage} hasLead onCancel={() => setOpen("")} onSave={(o) => { completeTask(t.id, o); setOpen(""); }} />
          : <div className="mt-2 flex gap-2"><button className={btnPrimary} onClick={() => { toggleTask(t.id); setOpen(""); }}>✓ {tr("בוצע")}</button><button className={btnGhost} onClick={() => setOpen("")}>{tr("ביטול")}</button></div>)}
      </li>
    );
  };
  const addQuick = () => { const l = state.leads.find((x) => x.id === q.lead); if (!q.title.trim()) return; addTask({ lead_id: l?.id || "", lead_name: l?.name || tr("כללי"), title: q.title.trim(), due: q.due, cadence: "once", kind: "manual" }); setQ({ ...q, title: "" }); };
  const planIdle = (l: Lead) => { addTask({ lead_id: l.id, lead_name: l.name, title: plan[l.id] || tr("שיחת בירור: מוצר בשימוש, כמויות, מחיר יעד"), due: today, cadence: "once", kind: "followup" }); };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <H1 sub={tr("כל המשימות שלך במקום אחד: לקוחות, מעקבים, דגימות, פגישות Silitex. ✓ = תיעוד + שלב + צעד הבא בפעולה אחת.")}>☀️ {tr("היום שלי")} · {fmtDate(today)}</H1>
        <div className="flex gap-2 text-sm"><Badge tone="red">{groups[0].items.length} {tr("באיחור")}</Badge><Badge tone="blue">{groups[1].items.length} {tr("היום")}</Badge><Badge tone="green">{doneToday} {tr("תועדו היום")}</Badge><Badge>{calls7} {tr("פניות ב-7 ימים")}</Badge></div>
      </div>
      <Card className="grid md:grid-cols-[1fr_2fr_auto_auto] gap-2 items-end">
        <label className="text-xs text-slate-500">{tr("לקוח")}<select className={inputCls + " mt-1"} value={q.lead} onChange={(e) => setQ({ ...q, lead: e.target.value })}><option value="">{tr("— כללי —")}</option>{[...state.leads].sort((a, b) => a.name.localeCompare(b.name)).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
        <label className="text-xs text-slate-500">{tr("משימה")}<input className={inputCls + " mt-1"} placeholder={tr("למשל: להתקשר ללקוח ישן מ-SAP")} value={q.title} onChange={(e) => setQ({ ...q, title: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addQuick()} /></label>
        <label className="text-xs text-slate-500">{tr("תאריך")}<input type="date" className={inputCls + " mt-1"} value={q.due} onChange={(e) => setQ({ ...q, due: e.target.value })} /></label>
        <button className={btnPrimary} onClick={addQuick}>+ {tr("הוסף")}</button>
      </Card>
      {groups.map((g) => (
        <Card key={g.key} className="space-y-2">
          <h2 className="font-bold">{tr(g.he)} <Badge tone={g.tone}>{g.items.length}</Badge></h2>
          {g.items.length === 0 ? <p className="text-sm text-slate-400">—</p> : <ul className="space-y-2">{g.items.map((t) => row(t))}</ul>}
        </Card>
      ))}
      <Card className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">🧭 {tr("לקוחות פעילים בלי צעד הבא")} <Badge tone="amber">{idle.length}</Badge></h2><Link href="/leads/import" className={btnGhost + " text-sm"}>📥 {tr("ייבוא לקוחות מ-Excel / SAP")}</Link></div>
        <p className="text-xs text-slate-500">{tr("ממוין לפי פוטנציאל. כל לקוח פעיל צריך משימה פתוחה — אחרת הוא נשכח.")}</p>
        <ul className="divide-y">{idle.slice(0, 40).map((l) => (
          <li key={l.id} className="py-2 flex flex-wrap items-center gap-2 text-sm">
            <Link href={"/leads/" + l.id} className="font-medium text-brand-700 hover:underline min-w-[10rem]">{l.name}</Link>
            <Badge tone="blue">{tr(stageHe(l.stage))}</Badge><span className="text-xs text-slate-500">{l.industry}{l.product_match ? " · " + l.product_match : ""}</span>
            <input className={inputCls + " flex-1 min-w-[12rem]"} placeholder={tr("שיחת בירור: מוצר בשימוש, כמויות, מחיר יעד")} value={plan[l.id] || ""} onChange={(e) => setPlan({ ...plan, [l.id]: e.target.value })} />
            <button className={btnGhost + " text-xs"} onClick={() => planIdle(l)}>+ {tr("להיום")}</button>
          </li>))}</ul>
        {idle.length > 40 && <div className="text-xs text-slate-500">+{idle.length - 40} {tr("נוספים")} · <Link className="underline" href="/leads">{tr("כל הלקוחות")}</Link></div>}
      </Card>
      <ExportBar title={tr("תוכנית עבודה ") + fmtDate(today)} text={text} />
    </div>
  );
}
