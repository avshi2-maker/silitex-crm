"use client";
// page.tsx (src/app/leads/[id]/page.tsx) · updated 09.10.2026 19:05 (Asia/Jerusalem) — lead file: intake, stage, documents/offers, transcript, samples, timeline, AI pitch
import { use, useState } from "react";
import { useStore, STAGES } from "@/lib/store";
import { PRODUCTS, industriesOf, INDUSTRIES } from "@/lib/data";
import { Card, H1, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import PlanCard from "@/components/PlanCard";
import SampleCard from "@/components/SampleCard";
import DocsCard from "@/components/leads/DocsCard";
import TranscriptCard from "@/components/leads/TranscriptCard";
import { fmtDateTime, fmtDate, todayIso } from "@/lib/format";
import RowActions from "@/components/leads/RowActions";
import { useRouter } from "next/navigation";
import { pitchContext, pitchPrompt } from "@/prompts/pitch";
import type { Lead, Stage } from "@/lib/types";
import { useLang } from "@/i18n";
export default function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { t: tr } = useLang();
  const { id } = use(params);
  const { state, ready, upsertLead, setStage, addActivity, addTask, addSpend, addSample, setSampleStatus, addDoc, setDocStatus, removeLead } = useStore();
  const router = useRouter();
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
      <div className="flex items-start justify-between gap-2">
        <H1 sub={lead.industry + " · " + lead.tier + (lead.source ? " · " + tr(lead.source) : "") + (lead.contact_phone ? " · 📱 " + lead.contact_phone : "")}>{lead.name}</H1>
        <div className="text-end text-xs text-slate-500"><div>{tr("נוצר")}: {lead.created_at ? fmtDateTime(lead.created_at) : tr("מאגר")}</div><div>{tr("עודכן")}: {lead.updated_at ? fmtDateTime(lead.updated_at) : "—"}</div><div className="mt-1"><RowActions id={id} name={lead.name} hideEdit onDelete={() => { removeLead(id); router.push("/leads"); }} /></div></div>
      </div>
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
          <DocsCard lead={lead} docs={state.docs.filter((d) => d.lead_id === id)} matches={matches} onAdd={addDoc} onStatus={setDocStatus} onStage={(s) => setStage(id, s)} spend={state.spend} addSpend={addSpend} />
          <TranscriptCard lead={lead} spend={state.spend} addSpend={addSpend} onLog={(t) => addActivity(id, "transcript", t)} onTask={(title, due) => addTask({ lead_id: id, lead_name: lead.name, title, due, cadence: "once", kind: "followup" })} onStage={(s) => setStage(id, s)} />
          <Card>
            <h3 className="font-bold mb-2">{tr("מוצרים מותאמים (")}{matches.length})</h3>
            <div className="flex flex-wrap gap-1">{matches.map((p) => <Badge key={p.id} tone="blue">{p.product_name}</Badge>)}</div>
          </Card>
        </div>
        <div className="space-y-4">
          <PlanCard lead={lead} onTask={(title) => addTask({ lead_id: id, lead_name: lead.name, title, due: todayIso(), cadence: "once", kind: "plan" })} />
          <SampleCard leadId={id} leadName={lead.name} samples={state.samples.filter((x) => x.lead_id === id)} defaultSku={(lead.recommended_sku || "").split(/[&,/]/)[0].trim() || undefined} onAdd={addSample} onStatus={setSampleStatus} />
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
  const field = (k: keyof Lead, label: string, type = "text", req = false) => (<label className="text-xs text-slate-500">{label}{req && " *"}<input type={type} className={inputCls + " mt-1"} value={(f[k] as string) || ""} onChange={(e) => set(k, e.target.value)} /></label>);
  return (
    <div>
      <h3 className="font-bold mb-2">{tr("טופס קליטה (Intake)")}</h3>
      <div className="grid md:grid-cols-3 gap-2">
        {field("name", tr("חברה"), "text", true)}{field("industry", tr("תעשייה"))}{field("sub_industry", tr("תת-תעשייה / תיאור"))}
        {field("contact_name", tr("שם איש קשר"), "text", true)}{field("contact_role", tr("תפקיד"))}{field("department", tr("מחלקה"))}
        {field("contact_phone", tr("נייד"), "tel", true)}{field("contact_email", tr("אימייל"), "email")}{field("next_action_at", tr("פעולה הבאה (תאריך)"), "date")}
        <label className="text-xs text-slate-500 md:col-span-3">{tr("צורך / יישום")}<textarea className={inputCls + " mt-1"} rows={2} value={f.use_case} onChange={(e) => set("use_case", e.target.value)} /></label>
        <label className="text-xs text-slate-500 md:col-span-3">{tr("הערות (ספק נוכחי, כמויות, מחירים, דרישות רגולציה)")}<textarea className={inputCls + " mt-1"} rows={3} value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} /></label>
      </div>
      <div className="flex justify-between items-center mt-2 text-xs text-slate-500"><span>{tr("פעולה הבאה: ")}{fmtDate(f.next_action_at)}</span><button className={btnPrimary} onClick={() => { if (!f.name || !f.contact_name || !f.contact_phone) return alert(tr("חובה: חברה, שם איש קשר, נייד")); onSave(f); }}>{tr("שמור טופס")}</button></div>
    </div>
  );
}
