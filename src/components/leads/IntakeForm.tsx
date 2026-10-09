"use client";
// IntakeForm.tsx (src/components/leads/IntakeForm.tsx) · updated 09.10.2026 19:30 (Asia/Jerusalem) — fact-finding form: core identity (mandatory) + 8 config-driven sections (config/intake.ts) stored in lead.intake
import { useState } from "react";
import { inputCls, btnPrimary, Badge } from "@/components/ui";
import { INTAKE, type IntakeField } from "@/config/intake";
import { intakeOf, intakePct } from "@/lib/intake";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Lead } from "@/lib/types";
export default function IntakeForm({ lead, onSave }: { lead: Lead; onSave: (l: Lead) => void }) {
  const { t: tr } = useLang();
  const [f, setF] = useState<Lead>({ ...lead, intake: { ...intakeOf(lead) } });
  const [open, setOpen] = useState<number>(3); const [err, setErr] = useState("");
  const set = (k: keyof Lead, v: string) => setF({ ...f, [k]: v });
  const setI = (id: string, v: string) => setF({ ...f, intake: { ...(f.intake || {}), [id]: v } });
  const core = (k: keyof Lead, label: string, type = "text", req = false) => (<label className="text-xs text-slate-500">{label}{req && " *"}<input type={type} className={inputCls + " mt-1"} value={(f[k] as string) || ""} onChange={(e) => set(k, e.target.value)} /></label>);
  const save = () => { if (!f.name || !f.contact_name || !f.contact_phone) return setErr(tr("חובה: חברה, שם איש קשר, נייד")); setErr(""); onSave(f); };
  const pct = intakePct(f);
  return (
    <div>
      <div className="flex items-center justify-between mb-2"><h3 className="font-bold">{tr("טופס קליטה — בירור טכני")}</h3><Badge tone={pct >= 80 ? "green" : pct >= 40 ? "amber" : "red"}>{tr("שלמות")} {pct}%</Badge></div>
      <div className="grid md:grid-cols-3 gap-2">
        {core("name", tr("חברה"), "text", true)}{core("industry", tr("תעשייה"))}{core("sub_industry", tr("תת-תעשייה / תיאור"))}
        {core("contact_name", tr("שם איש קשר"), "text", true)}{core("contact_role", tr("תפקיד"))}{core("department", tr("מחלקה"))}
        {core("contact_phone", tr("נייד"), "tel", true)}{core("contact_email", tr("אימייל"), "email")}{core("next_action_at", tr("פעולה הבאה (תאריך)"), "date")}
        <label className="text-xs text-slate-500 md:col-span-3">{tr("צורך / יישום")}<textarea className={inputCls + " mt-1"} rows={2} value={f.use_case} onChange={(e) => set("use_case", e.target.value)} /></label>
      </div>
      <div className="mt-3 space-y-1">
        {INTAKE.map((s) => { const filled = s.fields.filter((x) => (f.intake?.[x.id] || "").trim()).length; return (
          <div key={s.n} className="border rounded-lg">
            <button type="button" className="w-full flex items-center justify-between px-3 py-2 text-sm" onClick={() => setOpen(open === s.n ? 0 : s.n)}><span>{s.icon} {s.n}. {tr(s.he)}</span><span className="text-xs text-slate-400">{filled}/{s.fields.length} {open === s.n ? "▲" : "▼"}</span></button>
            {open === s.n && <div className="grid md:grid-cols-2 gap-2 px-3 pb-3">{s.fields.map((x) => <Field key={x.id} f={x} value={f.intake?.[x.id] || ""} onChange={(v) => setI(x.id, v)} />)}</div>}
          </div>); })}
      </div>
      <label className="text-xs text-slate-500 block mt-3">{tr("הערות (ספק נוכחי, כמויות, מחירים, דרישות רגולציה)")}<textarea className={inputCls + " mt-1"} rows={2} value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} /></label>
      <div className="flex justify-between items-center mt-2 text-xs"><span className="text-red-600">{err}</span><span className="text-slate-500">{tr("פעולה הבאה: ")}{fmtDate(f.next_action_at)}</span><button className={btnPrimary} onClick={save}>{tr("שמור טופס")}</button></div>
    </div>
  );
}
function Field({ f, value, onChange }: { f: IntakeField; value: string; onChange: (v: string) => void }) {
  const { t: tr } = useLang();
  const label = <span>{tr(f.he)}{f.req && " *"}{f.hint && <span className="text-slate-400" title={tr(f.hint)}> ⓘ</span>}</span>;
  if (f.type === "select") { const opts = f.options || []; const all = value && !opts.includes(value) ? [...opts, value] : opts; return <label className="text-xs text-slate-500">{label}<select className={inputCls + " mt-1"} value={value} onChange={(e) => onChange(e.target.value)}>{all.map((o) => <option key={o} value={o}>{o || "—"}</option>)}</select></label>; }
  if (f.type === "multi") { const sel = value.split(",").map((x) => x.trim()).filter(Boolean); const toggle = (o: string) => onChange((sel.includes(o) ? sel.filter((x) => x !== o) : [...sel, o]).join(", ")); return <div className="text-xs text-slate-500 md:col-span-2">{label}<div className="flex flex-wrap gap-1 mt-1">{(f.options || []).map((o) => <button type="button" key={o} onClick={() => toggle(o)} className={"px-2 py-0.5 rounded-full border text-xs " + (sel.includes(o) ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{o}</button>)}</div></div>; }
  return <label className="text-xs text-slate-500">{label}<input type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} className={inputCls + " mt-1"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={f.hint} /></label>;
}
