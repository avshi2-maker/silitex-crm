"use client";
// AgentGuard.tsx (src/components/agent/AgentGuard.tsx) · created 16.11.2026 20:05 (Asia/Jerusalem) — v1.14.1 🛡 agent guard panel: ⏸ pause / ▶ resume · daily $ cap · max mails per sender per day ·
// spent today vs cap · last run (read · cards · blocked · actions removed · stopped reason)
import { useState } from "react";
import { Card, Badge, btnGhost, inputCls } from "@/components/ui";
import { useLang } from "@/i18n";

export type GuardState = { paused: boolean; daily_usd: number; per_sender_day: number; last_run: string | null };
export type LastRun = { read?: number; cards?: number; blocked?: number; dropped?: number; cost?: number; stopped?: string } | null;
type Props = { state: GuardState | null; spent: number; last: LastRun; onChange: (s: Partial<GuardState>) => Promise<void> };
export default function AgentGuard({ state, spent, last, onChange }: Props) {
  const { t: tr } = useLang(); const [cap, setCap] = useState(""); const [per, setPer] = useState(""); const [busy, setBusy] = useState(false);
  if (!state) return null;
  const pct = Math.min(100, Math.round((spent / Math.max(0.01, state.daily_usd)) * 100));
  const go = async (s: Partial<GuardState>) => { setBusy(true); try { await onChange(s); setCap(""); setPer(""); } finally { setBusy(false); } };
  return (
    <Card className={"space-y-2 " + (state.paused ? "border-2 border-amber-400 bg-amber-50" : "")}>
      <div className="flex flex-wrap items-center gap-2">
        <b className="flex-1">🛡 {tr("הגנות הסוכן")}</b>
        {state.paused ? <Badge tone="amber">⏸ {tr("מושהה")}</Badge> : <Badge tone="green">● {tr("פעיל")}</Badge>}
        <button className={btnGhost + " min-h-[40px]"} disabled={busy} onClick={() => go({ paused: !state.paused })}>{state.paused ? "▶ " + tr("הפעל") : "⏸ " + tr("השהה")}</button>
      </div>
      <div className="text-sm">{tr("עלות היום")}: <b dir="ltr">${spent.toFixed(3)}</b> / <span dir="ltr">${state.daily_usd.toFixed(2)}</span><div className="h-2 bg-slate-100 rounded mt-1"><div className={"h-2 rounded " + (pct >= 90 ? "bg-red-500" : "bg-emerald-500")} style={{ width: pct + "%" }} /></div></div>
      <div className="flex flex-wrap gap-2 items-end text-xs">
        <label className="text-slate-500">{tr("תקרה יומית $")}<input className={inputCls + " mt-1 w-24"} type="number" step="0.5" min="0.5" max="20" placeholder={String(state.daily_usd)} value={cap} onChange={(e) => setCap(e.target.value)} dir="ltr" /></label>
        <label className="text-slate-500">{tr("מקס׳ מיילים לשולח ביום")}<input className={inputCls + " mt-1 w-24"} type="number" min="1" max="50" placeholder={String(state.per_sender_day)} value={per} onChange={(e) => setPer(e.target.value)} dir="ltr" /></label>
        <button className={btnGhost + " min-h-[40px]"} disabled={busy || (!cap && !per)} onClick={() => go({ ...(cap ? { daily_usd: Number(cap) } : {}), ...(per ? { per_sender_day: Number(per) } : {}) })}>💾 {tr("שמור")}</button>
      </div>
      {last && <div className="text-xs text-slate-600">{tr("ריצה אחרונה")}: {state.last_run ? new Date(state.last_run).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"} · {tr("נקראו")} {last.read ?? 0} · {tr("כרטיסים")} {last.cards ?? 0} · 🛡 {tr("נחסמו")} {last.blocked ?? 0} · {tr("פעולות הוסרו")} {last.dropped ?? 0}{last.stopped ? " · " + last.stopped : ""}</div>}
      <div className="text-xs text-slate-500">{tr("נחסם לפני AI (בלי עלות): no-reply, דיוור, מייל ענק, הצפה משולח אחד. אחרי AI: מייל נשמר כ\"נתונים\" בלבד, פעולות רק לאנשים מוכרים, קישורים מוסרים, שולח לא מוכר לא פותח הזמנה. שום דבר לא נשלח בלי הלחיצה שלך.")}</div>
    </Card>
  );
}
