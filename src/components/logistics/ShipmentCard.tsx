"use client";
// ShipmentCard.tsx (src/components/logistics/ShipmentCard.tsx) · updated 10.10.2026 05:30 (Asia/Jerusalem) — one shipment: status, 7-section checklist (editable), documents, request text + CSV + AI cover email (EN/IT)
import { useState } from "react";
import { Card, Badge, inputCls, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import ExportBar from "@/components/ExportBar";
import { SHIPPING, SHIP_DOCS, SHIP_STATUS, type ShipField } from "@/config/shipping";
import { requestText, requestCsv, pct, linesText } from "@/lib/shipping";
import { shippingContext, shippingPrompt } from "@/prompts/shipping";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Shipment } from "@/lib/types";
const WHO: Record<ShipField["who"], string> = { sapirim: "Sapirim", silitex: "Silitex", forwarder: "Forwarder", customer: "Customer" };
const TONE: Record<ShipField["who"], string> = { sapirim: "green", silitex: "amber", forwarder: "blue", customer: "purple" };
type Props = { s: Shipment; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void; onUpdate: (patch: Partial<Shipment>) => void; onDelete: () => void };
export default function ShipmentCard({ s, spend, addSpend, onUpdate, onDelete }: Props) {
  const { t: tr } = useLang();
  const [open, setOpen] = useState(0); const [mail, setMail] = useState<"en" | "it">("en"); const [arm, setArm] = useState(false);
  const setV = (id: string, v: string) => onUpdate({ values: { ...s.values, [id]: v } });
  const text = requestText(s); const done = pct(s);
  const dl = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([requestCsv(s)], { type: "text/csv;charset=utf-8" })); a.download = s.ref + "_shipment_data_request.csv"; a.click(); };
  const st = SHIP_STATUS.find((x) => x.key === s.status);
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><span className="font-bold text-lg">{s.ref}</span> · {s.mode === "air" ? "✈️" : "🚢"} {s.lead_name} · <span className="text-xs text-slate-500">{fmtDate(s.created_at)}</span></div>
        <div className="flex items-center gap-2"><Badge tone={done >= 80 ? "green" : done >= 40 ? "amber" : "red"}>{tr("שלמות")} {done}%</Badge><select className={inputCls + " w-48"} value={s.status} onChange={(e) => onUpdate({ status: e.target.value })}>{SHIP_STATUS.map((x) => <option key={x.key} value={x.key}>{tr(x.he)}</option>)}</select><Badge tone={st?.tone}>{tr(st?.he || s.status)}</Badge>
          {!arm ? <button className={btnGhost} onClick={() => { setArm(true); setTimeout(() => setArm(false), 4000); }}>🗑️</button> : <button className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white" onClick={onDelete}>{tr("כן, מחק")}</button>}</div>
      </div>
      <pre className="text-xs whitespace-pre-wrap bg-slate-50 border rounded-lg p-2" dir="ltr">{linesText(s.lines)}</pre>
      <div className="grid md:grid-cols-[1fr_260px] gap-3 items-start">
        <div className="space-y-1">
          {SHIPPING.map((sec) => { const filled = sec.fields.filter((f) => (s.values[f.id] || "").trim()).length; return (
            <div key={sec.n} className="border rounded-lg">
              <button type="button" className="w-full flex items-center justify-between px-3 py-2 text-sm" onClick={() => setOpen(open === sec.n ? 0 : sec.n)}><span>{sec.n}. {tr(sec.he)} <span className="text-slate-400 text-xs">· {sec.en}</span></span><span className="text-xs text-slate-400">{filled}/{sec.fields.length} {open === sec.n ? "▲" : "▼"}</span></button>
              {open === sec.n && <div className="px-3 pb-3 space-y-2">{sec.fields.map((f) => (<div key={f.id} className="grid md:grid-cols-[260px_1fr] gap-1 items-start text-xs">
                <div><div className="font-medium">{f.en}{f.req === "M" ? " *" : f.req === "C" ? " (c)" : ""}</div><div className="text-slate-400" dir="ltr">{f.it}</div><Badge tone={TONE[f.who]}>{WHO[f.who]}</Badge> <span className="text-slate-400" title={f.purpose}>ⓘ {f.purpose}</span>{f.note && <div className="text-amber-700">↳ {f.note}</div>}</div>
                {f.options ? <select className={inputCls} value={s.values[f.id] || ""} onChange={(e) => setV(f.id, e.target.value)}><option value="">—</option>{(s.values[f.id] && !f.options.includes(s.values[f.id]) ? [...f.options, s.values[f.id]] : f.options).map((o) => <option key={o}>{o}</option>)}</select> : <input className={inputCls} value={s.values[f.id] || ""} onChange={(e) => setV(f.id, e.target.value)} dir="ltr" />}
              </div>))}</div>}
            </div>); })}
        </div>
        <Card className="bg-slate-50">
          <div className="font-bold text-sm mb-2">{tr("מסמכים")} ({SHIP_DOCS.filter((d) => s.docs[d.key]).length}/{SHIP_DOCS.length})</div>
          {SHIP_DOCS.map((d) => (<label key={d.key} className="flex items-center gap-2 text-xs py-0.5"><input type="checkbox" checked={!!s.docs[d.key]} onChange={(e) => onUpdate({ docs: { ...s.docs, [d.key]: e.target.checked } })} /><span>{tr(d.he)}</span><Badge tone={TONE[d.who]}>{WHO[d.who]}</Badge></label>))}
          <label className="text-xs text-slate-500 block mt-2">ETA<input type="date" className={inputCls + " mt-1"} value={s.eta || ""} onChange={(e) => onUpdate({ eta: e.target.value })} /></label>
          <label className="text-xs text-slate-500 block mt-2">{tr("הערות")}<textarea className={inputCls + " mt-1"} rows={2} value={s.notes || ""} onChange={(e) => onUpdate({ notes: e.target.value })} /></label>
        </Card>
      </div>
      <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium">{tr("בקשת הנתונים (EN/IT) — לשליחה ל-Silitex / למשלח")}</span><button className={btnGhost} onClick={dl}>📥 CSV</button></div>
      <ExportBar title={"Shipment data request " + s.ref + " — Silitex → Israel"} text={text} filename={s.ref + "_shipment_data_request"} />
      <div className="flex items-center gap-2 text-sm"><span>{tr("מכתב נלווה:")}</span>{(["en", "it"] as const).map((l) => <button key={l} className={btnGhost + (mail === l ? " ring-2 ring-brand-500" : "")} onClick={() => setMail(l)}>{l.toUpperCase()}</button>)}</div>
      <AiPanel title={"Cover email (" + mail.toUpperCase() + ") — " + s.ref} buttonLabel={tr("נסח מכתב ל-Silitex")} sessionTokens={spend.tokens} sessionCost={spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} buildPrompt={() => ({ context: shippingContext(s), prompt: shippingPrompt(mail) + (mail === "it" ? " IMPORTANTE: rispondi in italiano." : " IMPORTANT: write in English.") })} />
    </Card>
  );
}
