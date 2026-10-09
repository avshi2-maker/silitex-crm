"use client";
// page.tsx (src/app/leads/[id]/page.tsx) · updated 09.10.2026 10:30 (Asia/Jerusalem) — lead file: intake form, stage, timeline, AI pitch
import { use, useState } from "react";
import { useStore, STAGES } from "@/lib/store";
import { PRODUCTS, industriesOf, INDUSTRIES } from "@/lib/data";
import { Card, H1, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import PlanCard from "@/components/PlanCard";
import { fmtDateTime, fmtDate, todayIso } from "@/lib/format";
import { pitchContext, pitchPrompt } from "@/prompts/pitch";
import type { Lead, Stage } from "@/lib/types";
import { useLang } from "@/i18n";
export default function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { t: tr } = useLang();
  const { id } = use(params);
  const { state, ready, upsertLead, setStage, addActivity, addTask, addSpend } = useStore();
  const [note, setNote] = useState("");
  if (!ready) return null;
  const lead = state.leads.find((l) => l.id === id);
  if (!lead) return <p>{tr("לקוח לא נמצא.")}</p>;
  const acts = state.activities.filter((a) => a.lead_id === id);
  const tasks = state.tasks.filter((t) => t.lead_id === id && !t.done);
  const indKeys = INDUSTRIES.filter((i) => i.match.test(lead.industry + " " + lead.use_case + " " + lead.product_match)).map((i) => i.key);
  const matches = PRODUCTS.filter((p) => industriesOf(p).some((k) => indKeys.includes(k))).slice(0, 8);
  const ctx = pitchContext(lead, matches);
  return (
    <div className="space-y-4">
      <H1 sub={lead.industry + " · " + lead.tier}>{lead.name}</H1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-4 items-start">
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap gap-1 mb-3">{STAGES.map((s) => (<button key={s.key} onClick={() => setStage(id, s.key as Stage)} className={"text-xs px-2 py-1 rounded-full border " + (lead.stage === s.key ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{tr(s.he)}</button>))}</div>
            <Intake lead={lead} onSave={(l) => { upsertLead(l); addActivity(id, "intake", tr("טופס קליטה עודכן")); }} />
          </Card>
          <Card>
            <AiPanel title={tr("הצעת פנייה / פיץ' ל-") + lead.name} buttonLabel={tr("צור פיץ' עם Claude")} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} onResult={() => addActivity(id, "ai", tr("נוצר פיץ' AI"))}
              buildPrompt={() => ({ context: ctx, prompt: pitchPrompt(lead) })} />
          </Card>
          <Card>
            <h3 className="font-bold mb-2">{tr("מוצרים מותאמים (")}{matches.length})</h3>
            <div className="flex flex-wrap gap-1">{matches.map((p) => <Badge key={p.id} tone="blue">{p.product_name}</Badge>)}</div>
          </Card>
        </div>
        <div className="space-y-4">
          <PlanCard lead={lead} onTask={(title) => addTask({ lead_id: id, lead_name: lead.name, title, due: todayIso(), cadence: "once", kind: "plan" })} />
          <Card>
            <h3 className="font-bold mb-2">{tr("משימות פתוחות (")}{tasks.length})</h3>
            <ul className="text-sm space-y-1">{tasks.map((t) => <li key={t.id}>• {fmtDate(t.due)} — {t.title}</li>)}</ul>
            <button className={btnGhost + " mt-2"} onClick={() => addTask({ lead_id: id, lead_name: lead.name, title: tr("מעקב"), due: todayIso(), cadence: "once", kind: "followup" })}>{tr("+ משימה להיום")}</button>
          </Card>
          <Card>
            <h3 className="font-bold mb-2">{tr("יומן פעילות")}</h3>
            <div className="flex gap-2 mb-2"><input className={inputCls} placeholder={tr("הערה / שיחה / פגישה…")} value={note} onChange={(e) => setNote(e.target.value)} /><button className={btnPrimary} onClick={() => { if (note) { addActivity(id, "note", note); setNote(""); } }}>{tr("הוסף")}</button></div>
            <ul className="text-xs space-y-2">{acts.map((a) => (<li key={a.id} className="border-s-2 border-brand-100 ps-2"><div className="text-slate-400">{fmtDateTime(a.at)} · {a.kind}</div><div>{a.text}</div></li>))}{acts.length === 0 && <li className="text-slate-400">{tr("אין פעילות עדיין.")}</li>}</ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
function Intake({ lead, onSave }: { lead: Lead; onSave: (l: Lead) => void }) {
  const { t: tr } = useLang();
  const [f, setF] = useState<Lead>(lead);
  const set = (k: keyof Lead, v: string) => setF({ ...f, [k]: v });
  const field = (k: keyof Lead, label: string, type = "text") => (<label className="text-xs text-slate-500">{label}<input type={type} className={inputCls + " mt-1"} value={(f[k] as string) || ""} onChange={(e) => set(k, e.target.value)} /></label>);
  return (
    <div>
      <h3 className="font-bold mb-2">{tr("טופס קליטה (Intake)")}</h3>
      <div className="grid md:grid-cols-3 gap-2">
        {field("contact_name", tr("שם איש קשר"))}{field("contact_role", tr("תפקיד"))}{field("department", tr("מחלקה"))}
        {field("contact_phone", tr("טלפון"), "tel")}{field("contact_email", tr("אימייל"), "email")}{field("next_action_at", tr("פעולה הבאה (תאריך)"), "date")}
        <label className="text-xs text-slate-500 md:col-span-3">{tr("צורך / יישום")}<textarea className={inputCls + " mt-1"} rows={2} value={f.use_case} onChange={(e) => set("use_case", e.target.value)} /></label>
        <label className="text-xs text-slate-500 md:col-span-3">{tr("הערות (ספק נוכחי, כמויות, מחירים, דרישות רגולציה)")}<textarea className={inputCls + " mt-1"} rows={3} value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} /></label>
      </div>
      <div className="flex justify-between items-center mt-2 text-xs text-slate-500"><span>{tr("פעולה הבאה: ")}{fmtDate(f.next_action_at)}</span><button className={btnPrimary} onClick={() => onSave(f)}>{tr("שמור טופס")}</button></div>
    </div>
  );
}
