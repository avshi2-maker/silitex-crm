"use client";
// DoneForm.tsx (src/components/today/DoneForm.tsx) · updated 17.10.2026 08:05 (Asia/Jerusalem) — one action closes a task: what happened (call / mail / WhatsApp / visit), note → lead log, optional stage move, next step + date → new task
import { useState } from "react";
import { STAGES } from "@/lib/store";
import { inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { addDays, todayIso, fmtDate } from "@/lib/format";
import type { Stage } from "@/lib/types";
import { useLang } from "@/i18n";
const KINDS = [["call", "📞 שיחה"], ["email", "✉️ מייל"], ["whatsapp", "💬 WhatsApp"], ["visit", "🤝 פגישה"], ["note", "📝 אחר"]] as const;
const JUMPS = [1, 3, 7, 14, 30];
type Props = { stage?: Stage; hasLead: boolean; onSave: (o: { note: string; kind: string; stage?: Stage; nextTitle?: string; nextDue?: string }) => void; onCancel: () => void };
export default function DoneForm({ stage, hasLead, onSave, onCancel }: Props) {
  const { t: tr } = useLang();
  const [kind, setKind] = useState("call"); const [note, setNote] = useState(""); const [st, setSt] = useState<Stage | "">(stage || "");
  const [nextTitle, setNextTitle] = useState(""); const [nextDue, setNextDue] = useState("");
  const chip = (on: boolean) => "text-xs px-2 py-1 rounded-full border " + (on ? "bg-brand-500 text-white border-brand-500" : "bg-white hover:bg-slate-50");
  return (
    <div className="mt-2 border-t pt-2 space-y-2">
      <div className="flex flex-wrap gap-1">{KINDS.map(([k, l]) => <button key={k} className={chip(kind === k)} onClick={() => setKind(k)}>{tr(l)}</button>)}</div>
      <textarea rows={2} className={inputCls} placeholder={tr("מה היה? (נרשם בתיק הלקוח ובדוח השבועי)")} value={note} onChange={(e) => setNote(e.target.value)} />
      {hasLead && <label className="text-xs text-slate-500 flex flex-wrap items-center gap-2">{tr("שלב")}<select className={inputCls + " w-48"} value={st} onChange={(e) => setSt(e.target.value as Stage)}>{STAGES.map((s) => <option key={s.key} value={s.key}>{tr(s.he)}</option>)}</select></label>}
      <div className="grid md:grid-cols-[1fr_auto] gap-2 items-end">
        <label className="text-xs text-slate-500">{tr("הצעד הבא (לא חובה)")}<input className={inputCls + " mt-1"} placeholder={tr("למשל: לשלוח TDS · לחזור אחרי בדיקת מעבדה")} value={nextTitle} onChange={(e) => setNextTitle(e.target.value)} /></label>
        <div className="flex flex-wrap items-center gap-1">{JUMPS.map((d) => { const v = addDays(todayIso(), d); return <button key={d} className={chip(nextDue === v)} onClick={() => setNextDue(v)}>+{d}{tr(" ימים")}</button>; })}<input type="date" className={inputCls + " w-40"} value={nextDue} onChange={(e) => setNextDue(e.target.value)} /></div>
      </div>
      {nextDue && <div className="text-xs text-slate-500">{tr("משימה חדשה ב-")}{fmtDate(nextDue)}{nextTitle ? "" : tr(" — כתוב מה הצעד")}</div>}
      <div className="flex gap-2"><button className={btnPrimary} disabled={!!nextDue && !nextTitle.trim()} onClick={() => onSave({ note, kind, stage: st || undefined, nextTitle, nextDue: nextDue || undefined })}>✓ {tr("בוצע — שמור")}</button><button className={btnGhost} onClick={onCancel}>{tr("ביטול")}</button></div>
    </div>
  );
}
