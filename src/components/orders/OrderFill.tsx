"use client";
// OrderFill.tsx (src/components/orders/OrderFill.tsx) · created 16.11.2026 19:00 (Asia/Jerusalem) — v1.14.0 ✨ fill the order from the customer's request: one click reads the customer's latest
// mails on the project (already in the CRM), or paste a WhatsApp / forwarded text → product, qty, kg, pack, delivery, contact, PO filled · token + cost meter · export bar
import { useState } from "react";
import { Card, btnPrimary, btnGhost, inputCls } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { useLang } from "@/i18n";
import type { Order, Usage } from "@/lib/types";

type Parsed = { summary?: string; lines?: { product?: string; code?: string; qty?: number; kg?: number; pack?: string }[]; delivery_address?: string; contact?: string; phone?: string; customer_po?: string; notes?: string };
type Props = { o: Order; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void; onDone: () => void };
export default function OrderFill({ o, spend, addSpend, onDone }: Props) {
  const { t: tr } = useLang(); const [text, setText] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const [res, setRes] = useState<{ parsed: Parsed; usage: Usage; source: string } | null>(null); const [paste, setPaste] = useState(false);
  const run = async (withText: boolean) => {
    setBusy(true); setErr("");
    try { const r = await fetch("/api/orders/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: o.id, text: withText ? text : "" }) }); const j = await r.json();
      if (!r.ok) throw new Error(j.error || "error " + r.status); setRes(j); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); onDone(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); } setBusy(false);
  };
  const p = res?.parsed; const out = p ? [p.summary, ...(p.lines || []).map((l) => "• " + [l.product, l.code].filter(Boolean).join(" ") + " — " + (l.qty || 0) + " × " + (l.pack || "") + " (" + (l.kg || 0) + " kg)"), p.delivery_address && "משלוח: " + p.delivery_address, p.contact && "איש קשר: " + p.contact + (p.phone ? " · " + p.phone : ""), p.customer_po && "PO: " + p.customer_po, p.notes && "הערות: " + p.notes].filter(Boolean).join("\n") : "";
  return (
    <Card className="space-y-3 border-2 border-violet-300">
      <div className="flex flex-wrap items-center gap-2">
        <b className="flex-1">✨ {tr("מלא מבקשת הלקוח")}</b>
        <button className={btnPrimary + " min-h-[44px]"} disabled={busy || !o.project_id} onClick={() => run(false)}>✨ {busy ? tr("קורא…") : tr("קרא את המיילים של הלקוח")}</button>
        <button className={btnGhost + " min-h-[44px]"} onClick={() => setPaste(!paste)}>📋 {tr("הדבק טקסט")}</button>
      </div>
      <div className="text-xs text-slate-500">{tr("ממלא רק שדות ריקים ואת שורת ברירת המחדל — לא דורס מה שהקלדת. בודקים ושומרים.")}</div>
      {paste && <div className="space-y-2"><textarea className={inputCls + " min-h-[120px]"} value={text} onChange={(e) => setText(e.target.value)} placeholder={tr("הדבק כאן מייל / WhatsApp של הלקוח…")} dir="auto" /><button className={btnPrimary} disabled={busy || !text.trim()} onClick={() => run(true)}>✨ {tr("מלא מהטקסט")}</button></div>}
      {err && <div className="text-sm text-red-700">{err}</div>}
      <TokenMeter usage={res?.usage} sessionTokens={spend.tokens} sessionCost={spend.cost} busy={busy} />
      {res && <><div className="text-xs text-slate-500">{tr("מקור")}: {res.source}</div><pre className="whitespace-pre-wrap font-[inherit] text-sm bg-violet-50 border rounded-lg p-3" dir="auto">{out}</pre><ExportBar title={"✨ " + o.id + " — " + o.lead_name} text={out} filename={o.id + "_request"} /></>}
    </Card>
  );
}
