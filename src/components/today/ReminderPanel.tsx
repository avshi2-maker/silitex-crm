"use client";
// ReminderPanel.tsx (src/components/today/ReminderPanel.tsx) · created 08.11.2026 07:10 (Asia/Jerusalem) — v1.6.0
// ✉ Under a 🔔 follow-up task on "My day": AI writes a friendly, professional reminder (language of our last mail) →
// edit → Outlook draft (you press Send) → task closed + next 🔔 opened automatically. Or postpone (date) / close without reminder.
import { useEffect, useState } from "react";
import { btnPrimary, btnGhost, inputCls } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { useStore } from "@/lib/store";
import { waitingCustomers, reminderContext, REMINDER_PROMPT, followKind, followDays, type Waiting } from "@/lib/followup";
import { splitMail } from "@/lib/mail-text";
import { outlookDraft } from "@/lib/outlook-draft";
import { addDays, todayIso, fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Task, Usage } from "@/lib/types";

export default function ReminderPanel({ task, onClose }: { task: Task; onClose: () => void }) {
  const { t: tr } = useLang();
  const { state, addSpend, completeTask, addTask, setTaskDue } = useStore();
  const lead = state.leads.find((l) => l.id === task.lead_id);
  const [w, setW] = useState<Waiting | null | undefined>(undefined);
  const [text, setText] = useState(""); const [usage, setUsage] = useState<Usage | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [next, setNext] = useState(true); const [due, setDue] = useState(addDays(todayIso(), 3));
  useEffect(() => { if (!lead) return setW(null); fetch("/api/hub/ingest", { cache: "no-store" }).then((r) => r.json()).then((j) => setW(waitingCustomers([lead], j.threads || [], j.msgs || [])[0] || null)).catch(() => setW(null)); }, [lead]);
  const n = 1 + state.activities.filter((a) => a.lead_id === task.lead_id && a.text.includes("🔔 " + tr("תזכורת"))).length;
  if (!lead) return null;
  const gen = async () => {
    if (!w) return; setBusy(true); setErr("");
    try {
      const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context: reminderContext(w, n), prompt: REMINDER_PROMPT, lang: "any", maxTokens: 700 }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "error");
      setText(String(j.text || "").replace(/\*\*/g, "").trim()); setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd);
    } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
    setBusy(false);
  };
  const draft = async () => {
    if (!w) return; const win = window.open("", "_blank"); if (!win) return setErr(tr("הדפדפן חסם חלון — אפשר חלונות קופצים לאתר"));
    try {
      const m = splitMail(text, "Re: " + w.thread.subject); await outlookDraft({ to: w.to, subject: m.subject, html: m.html }, win);
      completeTask(task.id, { note: "🔔 " + tr("תזכורת") + " #" + n + " — " + tr("טיוטה נוצרה ב-Outlook") + " (" + w.to + ")", kind: "email" });
      if (next) addTask({ lead_id: lead.id, lead_name: lead.name, title: "🔔 " + tr("מעקב") + " #" + (n + 1) + ": «" + w.thread.subject.slice(0, 90) + "»", due: addDays(todayIso(), followDays()), cadence: "once", kind: followKind() });
      onClose();
    } catch (e) { try { win.close(); } catch { /* */ } setErr(e instanceof Error ? e.message : "error"); }
  };
  const box = "mt-2 border-t pt-2 space-y-2";
  if (w === undefined) return <div className={box + " text-sm text-slate-500"}>⏳ {tr("בודק את ההתכתבות ב-Hub…")}</div>;
  if (w === null) return (
    <div className={box}><div className="text-sm text-emerald-700">✅ {tr("אין מייל שלנו שממתין — הלקוח כבר ענה (או שאין התכתבות ב-Hub).")}</div>
      <div className="flex gap-2"><button className={btnPrimary} onClick={() => { completeTask(task.id, { note: tr("נסגר — הלקוח ענה"), kind: "email" }); onClose(); }}>✓ {tr("סגור משימה")}</button><button className={btnGhost} onClick={onClose}>{tr("ביטול")}</button></div></div>);
  return (
    <div className={box}>
      <div className="text-xs text-slate-600" dir="auto">✉️ {w.thread.subject} · {tr("נשלח")} {fmtDate(w.lastOut.at.slice(0, 10))} · <span dir="ltr">{w.days}</span> {tr("ימים בלי תשובה")} · <span dir="ltr">{w.to}</span> · {tr("תזכורת")} #{n}</div>
      <div className="flex flex-wrap gap-2 items-center">
        <button className={btnPrimary} disabled={busy} onClick={gen}>{busy ? tr("כותב…") : "✨ " + (text ? tr("כתוב מחדש") : tr("צור תזכורת ידידותית"))}</button>
        <label className="text-xs text-slate-500 flex items-center gap-1">📅 {tr("דחה ל-")}<input type="date" className={inputCls + " !w-auto !py-1"} value={due} onChange={(e) => setDue(e.target.value)} /></label><button className={btnGhost + " text-xs"} onClick={() => { setTaskDue(task.id, due); onClose(); }}>{tr("דחה")}</button>
        <button className={btnGhost + " text-xs"} onClick={() => { completeTask(task.id, { note: tr("נסגר בלי תזכורת"), kind: "email" }); onClose(); }}>🚫 {tr("בלי תזכורת")}</button>
      </div>
      <TokenMeter usage={usage} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} busy={busy} />
      {err && <div className="text-sm text-red-600">{err}</div>}
      {text && <>
        <textarea className={inputCls + " leading-6"} rows={9} dir="auto" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex flex-wrap items-center gap-3"><button className={btnPrimary} onClick={draft}>📧 {tr("טיוטה ב-Outlook")}</button><label className="text-xs flex items-center gap-1"><input type="checkbox" checked={next} onChange={(e) => setNext(e.target.checked)} />{tr("לפתוח מעקב נוסף בעוד")} {followDays()} {tr("ימים")}</label></div>
        <ExportBar title={"Reminder — " + lead.name} text={text} />
      </>}
    </div>
  );
}
