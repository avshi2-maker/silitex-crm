"use client";
// OfferPanel.tsx (src/components/leads/OfferPanel.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — price offer: lines (SKU, kg, EUR/kg) + terms → AI drafts the offer → log with amount + validity
import { useState } from "react";
import AiPanel from "@/components/AiPanel";
import { btnPrimary, btnGhost, inputCls } from "@/components/ui";
import { PRODUCTS } from "@/lib/data";
import { OFFER_DEFAULTS, INCOTERMS } from "@/config/sales";
import { offerContext, offerTotal, OFFER_PROMPT, type OfferInput, type OfferLine } from "@/prompts/offer";
import { todayIso, addDays, fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Doc, Lead, Product } from "@/lib/types";
type Props = { lead: Lead; matches: Product[]; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void; onSent: (d: Omit<Doc, "id">) => void };
export default function OfferPanel({ lead, matches, spend, addSpend, onSent }: Props) {
  const { t: tr } = useLang();
  const first = (lead.recommended_sku || "").split(/[&,/]/)[0].trim() || matches[0]?.product_name || PRODUCTS[0].product_name;
  const [o, setO] = useState<OfferInput>({ lines: [{ sku: first, kg: 1000, eur_kg: 5 }], incoterm: OFFER_DEFAULTS.incoterm, payment: OFFER_DEFAULTS.payment, valid_until: addDays(todayIso(), OFFER_DEFAULTS.validity_days), notes: "" });
  const [body, setBody] = useState("");
  const setLine = (i: number, k: keyof OfferLine, v: string) => setO({ ...o, lines: o.lines.map((l, j) => (j === i ? { ...l, [k]: k === "sku" ? v : Number(v) || 0 } : l)) });
  const total = offerTotal(o);
  const send = (via: string) => onSent({ lead_id: lead.id, lead_name: lead.name, kind: "offer", title: tr("הצעת מחיר ") + o.lines.map((l) => l.sku + " " + l.kg + "kg").join(" + "), sent_at: todayIso(), via, status: "sent", amount_eur: Math.round(total), valid_until: o.valid_until, body });
  return (
    <div className="border border-brand-100 bg-brand-50/40 rounded-xl p-3 space-y-2">
      <div className="text-sm font-medium">{tr("הצעת מחיר — שורות")}</div>
      {o.lines.map((l, i) => (<div key={i} className="grid grid-cols-[1fr_90px_90px_90px_auto] gap-1 items-center text-sm">
        <select className={inputCls} value={l.sku} onChange={(e) => setLine(i, "sku", e.target.value)}>{PRODUCTS.map((p) => <option key={p.id} value={p.product_name}>{p.product_name}</option>)}</select>
        <input className={inputCls} value={l.kg} onChange={(e) => setLine(i, "kg", e.target.value)} title="kg" /><input className={inputCls} value={l.eur_kg} onChange={(e) => setLine(i, "eur_kg", e.target.value)} title="EUR/kg" />
        <span className="text-end">€{(l.kg * l.eur_kg).toLocaleString("en-US")}</span><button className="text-slate-400" onClick={() => setO({ ...o, lines: o.lines.filter((_, j) => j !== i) })}>✕</button>
      </div>))}
      <div className="flex flex-wrap gap-2 items-center"><button className={btnGhost} onClick={() => setO({ ...o, lines: [...o.lines, { sku: PRODUCTS[0].product_name, kg: 200, eur_kg: 5 }] })}>{tr("+ שורה")}</button><span className="text-xs text-slate-500">kg · EUR/kg</span><b className="ms-auto">€{total.toLocaleString("en-US")}</b></div>
      <div className="grid md:grid-cols-3 gap-2 text-sm">
        <label className="text-xs text-slate-500">{tr("תנאי אספקה")}<select className={inputCls + " mt-1"} value={o.incoterm} onChange={(e) => setO({ ...o, incoterm: e.target.value })}>{INCOTERMS.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label className="text-xs text-slate-500">{tr("תשלום")}<input className={inputCls + " mt-1"} value={o.payment} onChange={(e) => setO({ ...o, payment: e.target.value })} /></label>
        <label className="text-xs text-slate-500">{tr("תוקף עד")} ({fmtDate(o.valid_until)})<input type="date" className={inputCls + " mt-1"} value={o.valid_until} onChange={(e) => setO({ ...o, valid_until: e.target.value })} /></label>
        <label className="text-xs text-slate-500 md:col-span-3">{tr("הערות (כולל/לא כולל, אריזה, מינימום)")}<input className={inputCls + " mt-1"} value={o.notes} onChange={(e) => setO({ ...o, notes: e.target.value })} /></label>
      </div>
      <AiPanel title={"Price offer — " + lead.name + " — €" + total.toLocaleString("en-US")} buttonLabel={tr("נסח הצעת מחיר")} sessionTokens={spend.tokens} sessionCost={spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} onResult={setBody} buildPrompt={() => ({ context: offerContext(lead, o), prompt: OFFER_PROMPT })} />
      <div className="flex gap-2"><button className={btnPrimary} disabled={!o.lines.length} onClick={() => send("email")}>{tr("✓ נשלח במייל")}</button><button className={btnPrimary} disabled={!o.lines.length} onClick={() => send("whatsapp")}>{tr("✓ נשלח ב-WhatsApp")}</button><span className="text-xs text-slate-500 self-center">{tr("→ שלב 'הצעת מחיר' + משימת מעקב בעוד 3 ימים")}</span></div>
    </div>
  );
}
