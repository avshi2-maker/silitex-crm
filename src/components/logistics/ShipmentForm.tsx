"use client";
// ShipmentForm.tsx (src/components/logistics/ShipmentForm.tsx) · updated 10.10.2026 05:30 (Asia/Jerusalem) — new shipment: consignee, mode, lead, lines → creates a Shipment with prefilled values
import { useState } from "react";
import { Card, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { PRODUCTS } from "@/lib/data";
import { prefill, nextRef } from "@/lib/shipping";
import { intakeOf } from "@/lib/intake";
import { todayIso } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Lead, Shipment, ShipLine } from "@/lib/types";
const PACKS = ["25 kg pail", "200 kg HDPE drum", "200 kg steel drum", "1000 L IBC"];
type Props = { leads: Lead[]; existing: Shipment[]; onCreate: (s: Omit<Shipment, "id">) => void; onCancel: () => void };
export default function ShipmentForm({ leads, existing, onCreate, onCancel }: Props) {
  const { t: tr } = useLang();
  const [leadId, setLeadId] = useState(""); const [consignee, setConsignee] = useState<Shipment["consignee"]>("sapirim"); const [mode, setMode] = useState<Shipment["mode"]>("sea");
  const [lines, setLines] = useState<ShipLine[]>([{ sku: PRODUCTS[0].product_name, kg: 1000, pack: PACKS[3] }]);
  const lead = leads.find((l) => l.id === leadId);
  const pickLead = (id: string) => { setLeadId(id); const l = leads.find((x) => x.id === id); if (!l) return; const i = intakeOf(l); const sku = (i.SIL_001 || l.recommended_sku || "").split(/[&,/]/)[0].trim(); const p = PRODUCTS.find((x) => x.product_name === sku); const pack = /IBC/.test(i.COM_002 || "") ? PACKS[3] : /drum/i.test(i.COM_002 || "") ? PACKS[1] : PACKS[3]; setLines([{ sku: p ? p.product_name : PRODUCTS[0].product_name, kg: 1000, pack }]); };
  const setLine = (i: number, k: keyof ShipLine, v: string) => setLines(lines.map((l, j) => (j === i ? { ...l, [k]: k === "kg" ? Number(v) || 0 : v } : l)));
  const create = () => onCreate({ ref: nextRef(existing), lead_id: lead?.id, lead_name: lead?.name || "Sapirim stock", consignee, mode, lines, values: prefill(lead, consignee, mode), docs: {}, status: "requested", created_at: todayIso() });
  return (
    <Card className="space-y-3">
      <h3 className="font-bold">{tr("משלוח חדש — בקשת נתונים ל-Silitex")}</h3>
      <div className="grid md:grid-cols-3 gap-2 text-sm">
        <label className="text-xs text-slate-500">{tr("לקוח (לא חובה — מלאי Sapirim)")}<select className={inputCls + " mt-1"} value={leadId} onChange={(e) => pickLead(e.target.value)}><option value="">— Sapirim stock —</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
        <label className="text-xs text-slate-500">{tr("נמען (Consignee)")}<select className={inputCls + " mt-1"} value={consignee} onChange={(e) => setConsignee(e.target.value as Shipment["consignee"])}><option value="sapirim">Sapirim (VAT 52866969) — {tr("מלאי מקומי")}</option><option value="customer" disabled={!lead}>{tr("הלקוח — משלוח ישיר (drop-ship)")}</option></select></label>
        <label className="text-xs text-slate-500">{tr("אופן הובלה")}<select className={inputCls + " mt-1"} value={mode} onChange={(e) => setMode(e.target.value as Shipment["mode"])}><option value="sea">🚢 Sea (Venice/Genoa → Haifa/Ashdod)</option><option value="air">✈️ Air (MXP/VCE → TLV)</option></select></label>
      </div>
      <div className="text-xs text-slate-500">{tr("שורות מטען")}</div>
      {lines.map((l, i) => (<div key={i} className="grid grid-cols-[1fr_100px_180px_auto] gap-1 text-sm">
        <select className={inputCls} value={l.sku} onChange={(e) => setLine(i, "sku", e.target.value)}>{PRODUCTS.map((p) => <option key={p.id} value={p.product_name}>{p.product_name}</option>)}</select>
        <input className={inputCls} value={l.kg} onChange={(e) => setLine(i, "kg", e.target.value)} title="kg" />
        <select className={inputCls} value={l.pack} onChange={(e) => setLine(i, "pack", e.target.value)}>{PACKS.map((p) => <option key={p}>{p}</option>)}</select>
        <button className="text-slate-400" onClick={() => setLines(lines.filter((_, j) => j !== i))}>✕</button>
      </div>))}
      <div className="flex gap-2"><button className={btnGhost} onClick={() => setLines([...lines, { sku: PRODUCTS[0].product_name, kg: 200, pack: PACKS[1] }])}>{tr("+ שורה")}</button><span className="ms-auto text-xs text-slate-500 self-center">{lines.reduce((a, l) => a + l.kg, 0).toLocaleString("en-US")} kg</span><button className={btnGhost} onClick={onCancel}>{tr("ביטול")}</button><button className={btnPrimary} disabled={!lines.length} onClick={create}>{tr("צור בקשת נתונים")}</button></div>
    </Card>
  );
}
