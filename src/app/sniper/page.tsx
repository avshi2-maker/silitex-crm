"use client";
// page.tsx (src/app/sniper/page.tsx) · updated 09.10.2026 10:30 (Asia/Jerusalem) — Offset Sniper: paste competitor purchase list → Silitex equivalents → quote draft
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { snipeAll } from "@/lib/sniper";
import { Card, H1, Badge, inputCls } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import ExportBar from "@/components/ExportBar";
import { sniperContext, SNIPER_PROMPT } from "@/prompts/sniper";
import { useLang } from "@/i18n";
const SAMPLE = "Dow Corning Antifoam A\nXIAMETER AFE-1520\nMomentive SAG 30\nWacker SILRES BS 1701\nDC 193\nEvonik ABIL Quat 3272";
export default function SniperPage() {
  const { t: tr } = useLang();
  const { state, ready, addSpend } = useStore();
  const [text, setText] = useState(""); const [customer, setCustomer] = useState("");
  const rows = useMemo(() => snipeAll(text), [text]);
  if (!ready) return null;
  const found = rows.filter((r) => r.hits.length).length;
  const exportText = rows.map((r) => r.line + " → " + (r.hits[0]?.product || "—")).join("\n");
  return (
    <div className="space-y-4">
      <H1 sub={tr("הדבק את רשימת הרכש הנוכחית של הלקוח (Dow / Wacker / Momentive…) → מקבילות Silitex + טיוטת הצעת החלפה")}>Offset Sniper</H1>
      <Card className="space-y-2">
        <input className={inputCls} placeholder={tr("שם לקוח (אופציונלי)")} value={customer} onChange={(e) => setCustomer(e.target.value)} />
        <textarea className={inputCls} rows={6} placeholder={tr("שורה לכל מוצר מתחרה, למשל:\n") + SAMPLE} value={text} onChange={(e) => setText(e.target.value)} />
        <button className="text-xs text-brand-500" onClick={() => setText(SAMPLE)}>{tr("טען דוגמה")}</button>
      </Card>
      {rows.length > 0 && (
        <Card className="p-0 overflow-x-auto">
          <div className="p-3 text-sm text-slate-500">{found} / {rows.length}{tr(" שורות אותרו")}</div>
          <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-2 text-start">{tr("מוצר נוכחי")}</th><th className="p-2 text-start">{tr("מקבילת Silitex")}</th><th className="p-2 text-start">{tr("חלופות")}</th><th className="p-2 text-start">{tr("דרך")}</th></tr></thead>
            <tbody>{rows.map((r, i) => (<tr key={i} className="border-t"><td className="p-2 font-medium">{r.line}</td><td className="p-2">{r.hits[0] ? <Badge tone="green">{r.hits[0].product}</Badge> : <Badge tone="red">{tr("לא נמצא")}</Badge>}</td><td className="p-2 space-x-1">{r.hits.slice(1).map((h) => <Badge key={h.product}>{h.product}</Badge>)}</td><td className="p-2 text-xs text-slate-500">{r.hits[0]?.via}</td></tr>))}</tbody></table>
          <div className="p-3"><ExportBar title={tr("מקבילות Silitex — ") + (customer || tr("לקוח"))} text={exportText} /></div>
        </Card>
      )}
      {rows.length > 0 && (<Card><AiPanel title={tr("הצעת החלפה — ") + (customer || tr("לקוח"))} buttonLabel={tr("צור טיוטת הצעה")} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} buildPrompt={() => ({ context: sniperContext(customer, rows), prompt: SNIPER_PROMPT })} /></Card>)}
    </div>
  );
}
