"use client";
// page.tsx (src/app/logistics/page.tsx) · updated 10.10.2026 05:30 (Asia/Jerusalem) — logistics: shipment data-request generator (Italy → Israel) + shipments log. Checklist in config/shipping.ts.
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, H1, Badge, btnPrimary } from "@/components/ui";
import ShipmentForm from "@/components/logistics/ShipmentForm";
import ShipmentCard from "@/components/logistics/ShipmentCard";
import { SHIPPING, SHIP_FIELDS, IMPORTER, SHIP_STATUS } from "@/config/shipping";
import { pct } from "@/lib/shipping";
import { useLang } from "@/i18n";
export default function LogisticsPage() {
  const { t: tr } = useLang();
  const { state, ready, addSpend, addShipment, updateShipment, removeShipment } = useStore();
  const [showNew, setShowNew] = useState(false); const [sel, setSel] = useState("");
  if (!ready) return null;
  const list = state.shipments; const cur = list.find((x) => x.id === sel) || list[0];
  const mandatory = SHIP_FIELDS.filter((f) => f.req === "M").length;
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2"><H1 sub={tr("מחולל בקשת נתוני משלוח (איטליה → ישראל): ") + SHIPPING.length + tr(" מקטעים · ") + SHIP_FIELDS.length + tr(" שדות (") + mandatory + tr(" חובה) · ADR / IMDG / IATA · EUR.1 · ISPM-15 · מסמכי מכס")}>{tr("לוגיסטיקה ומשלוחים")}</H1><button className={btnPrimary} onClick={() => setShowNew((v) => !v)}>{tr("+ משלוח חדש")}</button></div>
      <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">{tr("לפני שימוש: כתובת Silitex, EORI, איש קשר יצוא וטלפון חירום הם שדות ריקים עד שסיליטקס מאשרת. קודי HS הם הצעה — עמיל המכס קובע. היתר רעלים: לבדוק לפי SKU.")}</div>
      {showNew && <ShipmentForm leads={state.leads} existing={list} onCreate={(s) => { const created = addShipment(s); setSel(created.id); setShowNew(false); }} onCancel={() => setShowNew(false)} />}
      {list.length === 0 && !showNew && (<Card className="text-sm text-slate-500">{tr("אין משלוחים עדיין. צור משלוח חדש — הטופס ממולא מראש בפרטי Sapirim (יבואן, ח.פ. ")}{IMPORTER.vat}{tr(") ובנתוני הלקוח מטופס הקליטה, ומייצר בקשת נתונים באנגלית ואיטלקית למחלקת היצוא של Silitex ולמשלח.")}</Card>)}
      {list.length > 1 && (<Card className="p-2 flex flex-wrap gap-1">{list.map((x) => { const st = SHIP_STATUS.find((y) => y.key === x.status); return (<button key={x.id} onClick={() => setSel(x.id)} className={"text-xs px-2 py-1 rounded-lg border " + (cur?.id === x.id ? "border-brand-500 bg-brand-50" : "bg-white")}>{x.ref} · {x.lead_name} <Badge tone={st?.tone}>{pct(x)}%</Badge></button>); })}</Card>)}
      {cur && <ShipmentCard key={cur.id} s={cur} spend={state.spend} addSpend={addSpend} onUpdate={(patch) => updateShipment(cur.id, patch)} onDelete={() => { removeShipment(cur.id); setSel(""); }} />}
    </div>
  );
}
