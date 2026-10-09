"use client";
// TdsPanel.tsx (src/components/leads/TdsPanel.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — pick SKUs → AI cover note (export bar sends it) → log as sent
import { useState } from "react";
import AiPanel from "@/components/AiPanel";
import { btnPrimary, inputCls } from "@/components/ui";
import { PRODUCTS } from "@/lib/data";
import { datasheetContext, datasheetPrompt } from "@/prompts/datasheet";
import { todayIso } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Doc, Lead, Product } from "@/lib/types";
type Props = { kind: "tds" | "msds"; lead: Lead; matches: Product[]; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void; onSent: (d: Omit<Doc, "id">) => void };
export default function TdsPanel({ kind, lead, matches, spend, addSpend, onSent }: Props) {
  const { t: tr } = useLang();
  const [sel, setSel] = useState<string[]>(matches.slice(0, 3).map((p) => p.product_name));
  const [extra, setExtra] = useState(""); const [body, setBody] = useState("");
  const toggle = (n: string) => setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  const chosen = PRODUCTS.filter((p) => sel.includes(p.product_name));
  const label = kind === "tds" ? "TDS" : "MSDS";
  const send = (via: string) => onSent({ lead_id: lead.id, lead_name: lead.name, kind, title: label + " × " + chosen.length + ": " + chosen.map((p) => p.product_name).join(", "), sent_at: todayIso(), via, status: "sent", body });
  return (
    <div className="border border-brand-100 bg-brand-50/40 rounded-xl p-3 space-y-2">
      <div className="text-sm font-medium">{tr("חבילת ")}{label} — {tr("בחר מוצרים")} ({chosen.length})</div>
      <div className="flex flex-wrap gap-1">{matches.map((p) => <button key={p.id} onClick={() => toggle(p.product_name)} className={"text-xs px-2 py-1 rounded-full border " + (sel.includes(p.product_name) ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{p.product_name}</button>)}</div>
      <div className="flex gap-2"><select className={inputCls} value={extra} onChange={(e) => { if (e.target.value) toggle(e.target.value); setExtra(""); }}><option value="">{tr("+ מוצר נוסף מהקטלוג…")}</option>{PRODUCTS.filter((p) => !sel.includes(p.product_name)).map((p) => <option key={p.id} value={p.product_name}>{p.product_name}</option>)}</select></div>
      <AiPanel title={label + " pack — " + lead.name} buttonLabel={tr("נסח מכתב נלווה")} sessionTokens={spend.tokens} sessionCost={spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} onResult={setBody} buildPrompt={() => ({ context: datasheetContext(lead, chosen), prompt: datasheetPrompt(kind) })} />
      <div className="text-xs text-slate-500">{tr("צרף את קובצי ה-PDF מתיקיית ")}public/assets · {tr("לאחר השליחה סמן:")}</div>
      <div className="flex gap-2"><button className={btnPrimary} disabled={!chosen.length} onClick={() => send("email")}>{tr("✓ נשלח במייל")}</button><button className={btnPrimary} disabled={!chosen.length} onClick={() => send("whatsapp")}>{tr("✓ נשלח ב-WhatsApp")}</button></div>
    </div>
  );
}
