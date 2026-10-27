"use client";
// ReviewEditor.tsx (src/components/salesmeet/ReviewEditor.tsx) · created 27.10.2026 05:00 (Asia/Jerusalem) — v1.0.0
// 🤝 Review what the AI read before anything touches the CRM: summary, per-customer decision / next step / ticks, tasks with dates. Everything editable.
import { inputCls, Badge } from "@/components/ui";
import ComboInput from "@/components/ComboInput";
import type { SmSummary, SmCustomer, SmTask } from "@/lib/sales-meeting-types";
import type { Lead } from "@/lib/types";
type Props = { s: SmSummary; setS: (s: SmSummary) => void; leads: Lead[] };
const TK: { k: "pini" | "tds" | "sample"; he: string }[] = [{ k: "pini", he: "לקוח של פיני" }, { k: "tds", he: "TDS" }, { k: "sample", he: "דוגמה" }];
export default function ReviewEditor({ s, setS, leads }: Props) {
  const names = leads.map((l) => l.name);
  const idOf = (name: string) => leads.find((l) => l.name === name)?.id || "";
  const nameOf = (id?: string) => leads.find((l) => l.id === id)?.name || "";
  const setC = (i: number, p: Partial<SmCustomer>) => setS({ ...s, customers: s.customers.map((c, j) => (j === i ? { ...c, ...p } : c)) });
  const setT = (i: number, p: Partial<SmTask>) => setS({ ...s, tasks: s.tasks.map((t, j) => (j === i ? { ...t, ...p } : t)) });
  const lbl = "text-xs text-slate-500";
  return (
    <div className="space-y-3">
      {s.unreadable.length > 0 && <div className="rounded-xl border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900">🟨 <b>לא הצלחתי לקרוא בוודאות — בדוק ותקן למטה:</b><ul className="list-disc ms-5">{s.unreadable.map((u, i) => <li key={i}>{u}</li>)}</ul></div>}
      <label className={lbl + " block"}>כותרת<input className={inputCls + " mt-1"} value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} /></label>
      <label className={lbl + " block"}>סיכום<textarea rows={3} className={inputCls + " mt-1"} value={s.summary} onChange={(e) => setS({ ...s, summary: e.target.value })} /></label>
      <label className={lbl + " block"}>נקודות עיקריות (שורה לכל נקודה)<textarea rows={Math.max(3, s.points.length)} className={inputCls + " mt-1"} value={s.points.join("\n")} onChange={(e) => setS({ ...s, points: e.target.value.split("\n") })} /></label>
      <div className="space-y-2"><b className="text-sm">לקוחות שהוזכרו ({s.customers.length})</b>
        {s.customers.map((c, i) => (
          <div key={i} className="border rounded-xl p-2 space-y-2 bg-white">
            <div className="grid md:grid-cols-2 gap-2">
              <ComboInput label={"כרטיס לקוח ב-CRM (נכתב: " + c.name + ")"} value={nameOf(c.lead_id)} options={names} onChange={(v) => setC(i, { lead_id: idOf(v) })} placeholder="בחר לקוח — או השאר ריק" />
              <div className="flex items-end gap-2 flex-wrap">{TK.map((t) => <label key={t.k} className="text-xs flex items-center gap-1 border rounded-lg px-2 py-1.5"><select className="bg-transparent" value={c[t.k] || ""} onChange={(e) => setC(i, { [t.k]: e.target.value } as Partial<SmCustomer>)}><option value="">—</option><option value="yes">כן</option><option value="no">לא</option></select>{t.he}</label>)}{!c.lead_id && <Badge tone="amber">לא מקושר</Badge>}</div>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <label className={lbl}>מה הוחלט<input className={inputCls + " mt-1"} value={c.decision} onChange={(e) => setC(i, { decision: e.target.value })} /></label>
              <label className={lbl}>הצעד הבא<input className={inputCls + " mt-1"} value={c.next_step} onChange={(e) => setC(i, { next_step: e.target.value })} /></label>
            </div>
            <button className="text-xs text-red-600" onClick={() => setS({ ...s, customers: s.customers.filter((_, j) => j !== i) })}>✕ הסר</button>
          </div>))}
        <button className="text-xs text-brand-600" onClick={() => setS({ ...s, customers: [...s.customers, { name: "", decision: "", next_step: "" }] })}>+ לקוח</button>
      </div>
      <div className="space-y-2"><b className="text-sm">משימות ({s.tasks.length}) → "היום שלי"</b>
        {s.tasks.map((t, i) => (
          <div key={i} className="grid md:grid-cols-[1fr_220px_150px_auto] gap-2 items-end">
            <label className={lbl}>משימה<input className={inputCls + " mt-1"} value={t.title} onChange={(e) => setT(i, { title: e.target.value })} /></label>
            <ComboInput label="לקוח" value={nameOf(t.lead_id) || t.lead_name || ""} options={names} onChange={(v) => setT(i, { lead_id: idOf(v), lead_name: v })} />
            <label className={lbl}>תאריך<input type="date" className={inputCls + " mt-1"} value={t.due} onChange={(e) => setT(i, { due: e.target.value })} /></label>
            <button className="text-xs text-red-600 pb-2" onClick={() => setS({ ...s, tasks: s.tasks.filter((_, j) => j !== i) })}>✕</button>
          </div>))}
        <button className="text-xs text-brand-600" onClick={() => setS({ ...s, tasks: [...s.tasks, { title: "", due: "" }] })}>+ משימה</button>
      </div>
      {s.open_questions.length > 0 && <div className="text-sm"><b>שאלות פתוחות:</b><ul className="list-disc ms-5">{s.open_questions.map((q, i) => <li key={i}>{q}</li>)}</ul></div>}
    </div>
  );
}
