"use client";
// SampleCard.tsx (src/components/SampleCard.tsx) · updated 09.10.2026 12:30 (Asia/Jerusalem) — sample tracker per lead: request → shipped → in lab → passed/failed
import { useState } from "react";
import { Card, Badge, inputCls, btnPrimary } from "./ui";
import { useLang } from "@/i18n";
import { fmtDate, todayIso, addDays } from "@/lib/format";
import { PRODUCTS } from "@/lib/data";
import type { Sample, SampleStatus } from "@/lib/types";
const STATUS: { k: SampleStatus; he: string; tone: string }[] = [{ k: "requested", he: "התבקשה", tone: "slate" }, { k: "shipped", he: "נשלחה", tone: "blue" }, { k: "in_lab", he: "במעבדה", tone: "amber" }, { k: "passed", he: "עברה ✓", tone: "green" }, { k: "failed", he: "נכשלה", tone: "red" }];
type Props = { leadId: string; leadName: string; samples: Sample[]; defaultSku?: string; onAdd: (s: Omit<Sample, "id">) => void; onStatus: (id: string, st: SampleStatus, result?: string) => void };
export default function SampleCard({ leadId, leadName, samples, defaultSku, onAdd, onStatus }: Props) {
  const { t: tr } = useLang();
  const [sku, setSku] = useState(defaultSku || PRODUCTS[0].product_name); const [kg, setKg] = useState("2");
  return (
    <Card>
      <h3 className="font-bold mb-2">{tr("דגימות")} ({samples.length})</h3>
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
