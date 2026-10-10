"use client";
// ThreadView.tsx (src/components/hub/ThreadView.tsx) · updated 10.10.2026 05:50 (Asia/Jerusalem) — one thread: structured fields (dept, topic, refs, due, owner, status, next), messages, AI summary → fills fields, AI reply EN/IT
import { useState } from "react";
import Link from "next/link";
import { Card, Badge, inputCls, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import ExportBar from "@/components/ExportBar";
import { DEPTS, TOPICS, TOPIC_HE, THREAD_STATUS } from "@/config/hub";
import { PRODUCTS } from "@/lib/data";
import { threadText, waitingDays } from "@/lib/hub";
import { hubContext, HUB_SUMMARY, hubReply, parseFields } from "@/prompts/hub";
import { fmtDateTime, fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Thread, HubMsg, Lead, Shipment } from "@/lib/types";
type Props = { th: Thread; msgs: HubMsg[]; leads: Lead[]; shipments: Shipment[]; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void; onUpdate: (p: Partial<Thread>) => void; onDelete: () => void; onTask?: (title: string, due: string) => void };
export default function ThreadView({ th, msgs, leads, shipments, spend, addSpend, onUpdate, onDelete, onTask }: Props) {
  const { t: tr } = useLang(); const [lang, setLang] = useState<"en" | "it">("en"); const [arm, setArm] = useState(false);
  const setRef = (k: keyof Thread["refs"], v: string) => onUpdate({ refs: { ...th.refs, [k]: v || undefined } });
  const applyFields = (text: string) => { const f = parseFields(text); if (!Object.keys(f).length) return; onUpdate({ topic: f.topic || th.topic, status: f.status || th.status, due: f.due || th.due, next: f.next || th.next, refs: { ...th.refs, po: f.po || th.refs.po, sku: f.sku || th.refs.sku, lot: f.lot || th.refs.lot, invoice: f.invoice || th.refs.invoice } }); };
  const wd = waitingDays(th); const st = THREAD_STATUS.find((s) => s.key === th.status);
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><div className="font-bold text-lg">{th.subject}</div><div className="text-xs text-slate-500">{DEPTS.find((d) => d.key === th.dept)?.icon} {tr(DEPTS.find((d) => d.key === th.dept)?.he || th.dept)} · {msgs.length} {tr("הודעות")} · {tr("אחרון")} {fmtDateTime(th.last_at)}{wd >= 2 && <Badge tone="red"> ⏰ {wd} {tr("ימים ממתין")}</Badge>}</div></div>
        <div className="flex items-center gap-1"><Badge tone={st?.tone}>{tr(st?.he || th.status)}</Badge>{!arm ? <button className={btnGhost} onClick={() => { setArm(true); setTimeout(() => setArm(false), 4000); }}>🗑️</button> : <button className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white" onClick={onDelete}>{tr("כן, מחק")}</button>}</div>
      </div>
      <div className="grid md:grid-cols-4 gap-2 text-xs">
        <label className="text-slate-500">{tr("מחלקה")}<select className={inputCls + " mt-1"} value={th.dept} onChange={(e) => onUpdate({ dept: e.target.value })}>{DEPTS.map((d) => <option key={d.key} value={d.key}>{d.icon} {tr(d.he)}</option>)}</select></label>
        <label className="text-slate-500">{tr("נושא")}<select className={inputCls + " mt-1"} value={th.topic} onChange={(e) => onUpdate({ topic: e.target.value })}>{TOPICS.map((x) => <option key={x} value={x}>{tr(TOPIC_HE[x])}</option>)}</select></label>
        <label className="text-slate-500">{tr("סטטוס")}<select className={inputCls + " mt-1"} value={th.status} onChange={(e) => onUpdate({ status: e.target.value })}>{THREAD_STATUS.map((x) => <option key={x.key} value={x.key}>{tr(x.he)}</option>)}</select></label>
        <label className="text-slate-500">{tr("בעלים")}<select className={inputCls + " mt-1"} value={th.owner} onChange={(e) => onUpdate({ owner: e.target.value as Thread["owner"] })}><option value="sapirim">Sapirim</option><option value="silitex">Silitex</option></select></label>
        <label className="text-slate-500">{tr("משלוח")}<select className={inputCls + " mt-1"} value={th.refs.shipment_id || ""} onChange={(e) => { const s = shipments.find((x) => x.id === e.target.value); onUpdate({ refs: { ...th.refs, shipment_id: s?.id, shipment_ref: s?.ref, lead_id: s?.lead_id || th.refs.lead_id, lead_name: s?.lead_name || th.refs.lead_name } }); }}><option value="">—</option>{shipments.map((s) => <option key={s.id} value={s.id}>{s.ref} · {s.lead_name}</option>)}</select></label>
        <label className="text-slate-500">{tr("לקוח")}<select className={inputCls + " mt-1"} value={th.refs.lead_id || ""} onChange={(e) => { const l = leads.find((x) => x.id === e.target.value); onUpdate({ refs: { ...th.refs, lead_id: l?.id, lead_name: l?.name } }); }}><option value="">—</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
        <label className="text-slate-500">SKU<select className={inputCls + " mt-1"} value={th.refs.sku || ""} onChange={(e) => setRef("sku", e.target.value)}><option value="">—</option>{PRODUCTS.map((p) => <option key={p.id} value={p.product_name}>{p.product_name}</option>)}</select></label>
        <label className="text-slate-500">P/O #<input className={inputCls + " mt-1"} value={th.refs.po || ""} onChange={(e) => setRef("po", e.target.value)} dir="ltr" /></label>
        <label className="text-slate-500">{tr("חשבונית #")}<input className={inputCls + " mt-1"} value={th.refs.invoice || ""} onChange={(e) => setRef("invoice", e.target.value)} dir="ltr" /></label>
        <label className="text-slate-500">{tr("אצווה / lot")}<input className={inputCls + " mt-1"} value={th.refs.lot || ""} onChange={(e) => setRef("lot", e.target.value)} dir="ltr" /></label>
        <label className="text-slate-500">{tr("תאריך יעד")} ({fmtDate(th.due)})<input type="date" className={inputCls + " mt-1"} value={th.due || ""} onChange={(e) => onUpdate({ due: e.target.value })} /></label>
        <label className="text-slate-500">{tr("פעולה הבאה")}<input className={inputCls + " mt-1"} value={th.next || ""} onChange={(e) => onUpdate({ next: e.target.value })} /></label>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">{th.refs.shipment_id && <Link href="/logistics" className="underline text-brand-600">🚢 {th.refs.shipment_ref}</Link>}{th.refs.lead_id && <Link href={"/leads/" + th.refs.lead_id} className="underline text-brand-600">🏭 {th.refs.lead_name}</Link>}{th.next && th.due && onTask && <button className={btnGhost} onClick={() => onTask(th.next || th.subject, th.due || "")}>{tr("+ משימה ביומן")}</button>}</div>
      <div className="space-y-2 max-h-[420px] overflow-auto">{msgs.map((m) => (<div key={m.id} className={"border rounded-lg p-2 text-sm " + (m.direction === "out" ? "bg-brand-50/40 border-brand-100" : "bg-white")} dir="ltr"><div className="text-xs text-slate-500">{m.direction === "out" ? "→ " : "← "}{m.from}{m.to ? " → " + m.to : ""} · {fmtDateTime(m.at)} · {m.source}</div><pre className="whitespace-pre-wrap font-[inherit] mt-1">{m.body}</pre></div>))}{msgs.length === 0 && <div className="text-xs text-slate-400">{tr("אין הודעות — הדבק מייל למטה.")}</div>}</div>
      <AiPanel title={tr("סיכום שרשור — ") + th.subject} buttonLabel={tr("סכם ומלא שדות")} sessionTokens={spend.tokens} sessionCost={spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} onResult={applyFields} buildPrompt={() => ({ context: hubContext(th, msgs), prompt: HUB_SUMMARY + " IMPORTANT: write in English." })} />
      <div className="flex items-center gap-2 text-sm"><span>{tr("תשובה הבאה:")}</span>{(["en", "it"] as const).map((l) => <button key={l} className={btnGhost + (lang === l ? " ring-2 ring-brand-500" : "")} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</div>
      <AiPanel title={"Reply (" + lang.toUpperCase() + ") — " + th.subject} buttonLabel={tr("נסח תשובה")} sessionTokens={spend.tokens} sessionCost={spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} buildPrompt={() => ({ context: hubContext(th, msgs), prompt: hubReply(lang) + (lang === "it" ? " IMPORTANTE: rispondi in italiano." : " IMPORTANT: write in English.") })} />
      <ExportBar title={"Silitex thread — " + th.subject} text={threadText(th, msgs)} />
    </Card>
  );
}
