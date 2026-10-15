"use client";
// SampleCard.tsx (src/components/SampleCard.tsx) · updated 15.10.2026 14:50 (Asia/Jerusalem) — sample tracker per lead: request → shipped → in lab → passed/failed · + 📧 request from Silitex (SampleRequest email → logs "requested")
import { useState } from "react";
import { Card, Badge, inputCls, btnPrimary } from "./ui";
import { useLang } from "@/i18n";
import { fmtDate, todayIso, addDays } from "@/lib/format";
import { PRODUCTS } from "@/lib/data";
import type { Lead, Sample, SampleStatus, SilitexContact } from "@/lib/types";
import SampleRequest from "@/components/leads/SampleRequest";
import { CAT26 } from "@/lib/catalog";
const SKUS = Array.from(new Set([...CAT26.map((r) => r.product), ...PRODUCTS.map((p) => p.product_name)])).sort();
const STATUS: { k: SampleStatus; he: string; tone: string }[] = [{ k: "requested", he: "התבקשה", tone: "slate" }, { k: "shipped", he: "נשלחה", tone: "blue" }, { k: "in_lab", he: "במעבדה", tone: "amber" }, { k: "passed", he: "עברה ✓", tone: "green" }, { k: "failed", he: "נכשלה", tone: "red" }];
type Props = { leadId: string; leadName: string; samples: Sample[]; defaultSku?: string; onAdd: (s: Omit<Sample, "id">) => void; onStatus: (id: string, st: SampleStatus, result?: string) => void; lead?: Lead; contacts?: SilitexContact[] };
export default function SampleCard({ leadId, leadName, samples, defaultSku, onAdd, onStatus, lead, contacts = [] }: Props) {
  const { t: tr } = useLang();
  const [sku, setSku] = useState(defaultSku || PRODUCTS[0].product_name); const [kg, setKg] = useState("2"); const [req, setReq] = useState(false);
  return (
    <Card>
      <div className="flex items-center justify-between gap-2 mb-2"><h3 className="font-bold">{tr("דגימות")} ({samples.length})</h3>{lead && <button className={btnPrimary + " text-xs px-3 py-1"} onClick={() => setReq(true)}>📧 {tr("בקש דגימה מ-Silitex")}</button>}</div>
      {req && lead && <SampleRequest lead={lead} contacts={contacts} sku={sku} skus={SKUS} onClose={() => setReq(false)} onLogged={(s, k) => onAdd({ lead_id: leadId, lead_name: leadName, sku: s, kg: k, sent_at: todayIso(), status: "requested", followup_at: addDays(todayIso(), 7) })} />}
      <ul className="text-sm space-y-2 mb-3">
        {samples.map((s) => (<li key={s.id} className="border rounded-lg p-2">
          <div className="flex justify-between gap-2"><span className="font-medium">{s.sku} · {s.kg} kg</span><Badge tone={STATUS.find((x) => x.k === s.status)?.tone}>{tr(STATUS.find((x) => x.k === s.status)?.he || s.status)}</Badge></div>
          <div className="text-xs text-slate-500">{tr("נשלחה")} {fmtDate(s.sent_at)} · {tr("מעקב")} {fmtDate(s.followup_at)}{s.result ? " · " + s.result : ""}</div>
          <div className="flex gap-1 mt-1">{STATUS.filter((x) => x.k !== s.status).map((x) => (<button key={x.k} className="text-xs px-2 py-0.5 border rounded-full bg-white hover:bg-slate-50" onClick={() => onStatus(s.id, x.k, x.k === "passed" ? "OK" : undefined)}>{tr(x.he)}</button>))}</div>
        </li>))}
        {samples.length === 0 && <li className="text-slate-400 text-xs">{tr("אין דגימות עדיין.")}</li>}
      </ul>
      <div className="flex gap-2">
        <select className={inputCls} value={sku} onChange={(e) => setSku(e.target.value)}>{PRODUCTS.map((p) => <option key={p.id} value={p.product_name}>{p.product_name}</option>)}</select>
        <input className={inputCls + " w-20"} value={kg} onChange={(e) => setKg(e.target.value)} />
        <button className={btnPrimary + " whitespace-nowrap"} onClick={() => onAdd({ lead_id: leadId, lead_name: leadName, sku, kg: Number(kg) || 1, sent_at: todayIso(), status: "shipped", followup_at: addDays(todayIso(), 7) })}>{tr("+ דגימה")}</button>
      </div>
    </Card>
  );
}
