"use client";
// page.tsx (src/app/social/page.tsx) · updated 18.10.2026 18:55 (Asia/Jerusalem) — SOCIAL PLAN (owner): posting calendar for Facebook (Sapirim Page) + LinkedIn (Avshi's profile), same schedule. Per post: open Post Studio pre-filled, tick Created → Scheduled → Published per platform, note / link. Progress bar + export bar. Ticks kept on this computer.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, H1, Badge, inputCls } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import { SOCIAL_PLAN, PLATFORMS, type PlanPost } from "@/config/social-plan";
import { fmtDate, todayIso } from "@/lib/format";
import { useLang } from "@/i18n";
type St = Record<string, { made?: boolean; fb?: number; li?: number; note?: string }>; // fb/li: 0 none · 1 scheduled · 2 published
const KEY = "silitex-social-v1";
const STEP = ["—", "🕒", "✅"];
const studioUrl = (p: PlanPost) => "/studio?kind=" + p.kind + "&value=" + encodeURIComponent(p.value) + "&langs=" + p.langs.join(",") + "&brand=sapirim";
const DAYS: Record<string, string> = { "0": "א׳", "1": "ב׳", "2": "ג׳", "3": "ד׳", "4": "ה׳", "5": "ו׳", "6": "ש׳" };
export default function SocialPage() {
  const { t: tr } = useLang();
  const [st, setSt] = useState<St>({}); const [ready, setReady] = useState(false);
  useEffect(() => { try { setSt(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {} setReady(true); }, []);
  const save = (n: St) => { setSt(n); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} };
  const patch = (id: string, p: Partial<St[string]>) => save({ ...st, [id]: { ...st[id], ...p } });
  const cycle = (id: string, k: "fb" | "li") => patch(id, { [k]: ((st[id]?.[k] || 0) + 1) % 3 });
  if (!ready) return null;
  const today = todayIso(); const total = SOCIAL_PLAN.length * 2;
  const done = SOCIAL_PLAN.reduce((s, p) => s + ((st[p.id]?.fb || 0) === 2 ? 1 : 0) + ((st[p.id]?.li || 0) === 2 ? 1 : 0), 0);
  const sched = SOCIAL_PLAN.reduce((s, p) => s + ((st[p.id]?.fb || 0) >= 1 ? 1 : 0) + ((st[p.id]?.li || 0) >= 1 ? 1 : 0), 0);
  const report = SOCIAL_PLAN.map((p) => fmtDate(p.date) + " " + p.time + " — " + p.topic + " [" + p.langs.join("/").toUpperCase() + ", " + p.format + "] · FB " + STEP[st[p.id]?.fb || 0] + " · LinkedIn " + STEP[st[p.id]?.li || 0] + (st[p.id]?.note ? " · " + st[p.id]?.note : "")).join("\n");
  return (
    <div className="space-y-4">
      <H1 sub={tr("לוח פרסום ל-Facebook (דף ספירים) ול-LinkedIn (הפרופיל שלך) — אותו לוח זמנים. כל שורה פותחת את סטודיו הפוסטים מוכן, ואז מסמנים: מתוזמן 🕒 → פורסם ✅.")}>🗓️ {tr("תוכנית פרסום")}</H1>
      <div className="grid sm:grid-cols-3 gap-3">
        <Card><div className="text-xs text-slate-500">{tr("פורסמו")}</div><div className="text-2xl font-bold" dir="ltr" style={{ textAlign: "right" }}>{done + " / " + total}</div><div className="h-2 bg-slate-100 rounded mt-2"><div className="h-2 bg-emerald-500 rounded" style={{ width: Math.round((done / total) * 100) + "%" }} /></div></Card>
        <Card><div className="text-xs text-slate-500">{tr("מתוזמנים או פורסמו")}</div><div className="text-2xl font-bold" dir="ltr" style={{ textAlign: "right" }}>{sched + " / " + total}</div></Card>
        <Card className="text-sm space-y-1">{PLATFORMS.map((pl) => <div key={pl.key}><a href={pl.url} target="_blank" rel="noreferrer" className="text-brand-600 underline">{pl.icon} {pl.name}</a> <span className="text-xs text-slate-500" dir="ltr">· {pl.where}</span></div>)}</Card>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-slate-500"><th className="text-start p-2">{tr("תאריך")}</th><th className="text-start p-2">{tr("נושא")}</th><th className="text-start p-2">{tr("נוצר")}</th><th className="text-center p-2">📘 Facebook</th><th className="text-center p-2">💼 LinkedIn</th><th className="text-start p-2">{tr("הערה / קישור")}</th></tr></thead>
          <tbody>{SOCIAL_PLAN.map((p) => { const s = st[p.id] || {}; const late = p.date < today && (s.fb || 0) < 2; return (
            <tr key={p.id} className={"border-t align-top " + (p.date === today ? "bg-amber-50" : "")}>
              <td className="p-2 whitespace-nowrap"><div className={"font-medium " + (late ? "text-red-600" : "")}>{DAYS[String(new Date(p.date).getDay())]} {fmtDate(p.date)}</div><div className="text-xs text-slate-500">{p.time}</div></td>
              <td className="p-2"><div className="font-medium">{p.topic}</div><div className="flex flex-wrap gap-1 mt-1"><Badge>{p.langs.join(" + ").toUpperCase()}</Badge><Badge tone="blue">{p.format === "post" ? tr("פוסט") : p.format === "reel" ? tr("ריל") : tr("פוסט + ריל")}</Badge><Link href={studioUrl(p)} className="text-xs text-brand-600 underline">✍️ {tr("פתח בסטודיו")}</Link></div></td>
              <td className="p-2"><input type="checkbox" className="w-5 h-5" checked={!!s.made} onChange={(e) => patch(p.id, { made: e.target.checked })} /></td>
              <td className="p-2 text-center"><button className="text-xl w-10 h-10 rounded-lg border hover:bg-slate-50" title={tr("לחיצה: מתוזמן → פורסם")} onClick={() => cycle(p.id, "fb")}>{STEP[s.fb || 0]}</button></td>
              <td className="p-2 text-center"><button className="text-xl w-10 h-10 rounded-lg border hover:bg-slate-50" title={tr("לחיצה: מתוזמן → פורסם")} onClick={() => cycle(p.id, "li")}>{STEP[s.li || 0]}</button></td>
              <td className="p-2 min-w-48"><input className={inputCls + " text-xs"} dir="auto" placeholder={tr("קישור לפוסט / הערה")} defaultValue={s.note || ""} onBlur={(e) => patch(p.id, { note: e.target.value })} /></td>
            </tr>); })}</tbody>
        </table>
        <div className="text-[11px] text-slate-400 mt-2">{tr("לחיצה על הכפתור: — → 🕒 מתוזמן → ✅ פורסם. הסימונים נשמרים במחשב הזה.")}</div>
      </Card>
      <ExportBar title={tr("תוכנית פרסום") + " — Sapirim"} text={report} filename="social_plan.txt" />
    </div>
  );
}
