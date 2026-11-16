"use client";
// OrderBank.tsx (src/components/orders/OrderBank.tsx) · created 16.11.2026 17:50 (Asia/Jerusalem) — v1.13.0 🏦 product order: proforma amount + Silitex bank details → Hebrew text for the bank's
// message box (📋 copy) · "🏦 to pay" creates the task in My day (server) · 📎 proforma / SWIFT copy upload · "💶 paid" closes the task
import { useRef, useState } from "react";
import { Card, btnPrimary, btnGhost, inputCls } from "@/components/ui";
import { bankText, orderTotal, fmtEur } from "@/lib/orders";
import { uploadOrderFile } from "@/lib/use-orders";
import { stageNo } from "@/config/orders";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Order } from "@/lib/types";

type Props = { o: Order; onSave: (p: Partial<Order>, note?: string) => Promise<unknown> };
export default function OrderBank({ o, onSave }: Props) {
  const { t: tr } = useLang(); const [b, setB] = useState({ currency: "EUR", amount: orderTotal(o) ? fmtEur(orderTotal(o)) : "", ...o.bank }); const [busy, setBusy] = useState(""); const [copied, setCopied] = useState(false); const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null); const [kind, setKind] = useState("proforma");
  const text = bankText({ ...o, bank: b }); const n = stageNo(o.kind, o.stage);
  const run = async (k: string, p: Partial<Order>, note?: string) => { setBusy(k); try { await onSave(p, note); } catch { /* toast */ } setBusy(""); };
  const upload = async (f: File) => { setBusy("up"); setErr(""); try { const url = await uploadOrderFile(o.id, f); await onSave({ files: [...(o.files || []), { kind, url, name: f.name, at: new Date().toISOString() }] }, "📎 " + kind + " · " + f.name); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } setBusy(""); };
  const fld = (k: keyof typeof b, label: string) => <label className="text-xs text-slate-500">{tr(label)}<input className={inputCls + " mt-1"} value={b[k] || ""} onChange={(e) => setB({ ...b, [k]: e.target.value })} dir="ltr" /></label>;
  return (
    <Card className={"space-y-3 border-2 " + (o.stage === "pay" ? "border-amber-400 bg-amber-50/40" : "border-slate-200")}>
      <b className="text-lg">② 🏦 {tr("תשלום ל-Silitex")}</b>
      <div className="grid md:grid-cols-3 gap-3">{fld("amount", "סכום (מה-Proforma)")}{fld("currency", "מטבע")}{fld("proforma", "מספר Proforma")}{fld("bank", "בנק המוטב")}{fld("iban", "IBAN")}{fld("swift", "SWIFT / BIC")}</div>
      <button className={btnGhost} disabled={!!busy} onClick={() => run("save", { bank: b })}>💾 {tr("שמור פרטי תשלום")}</button>
      <div className="text-xs text-slate-500">{tr("טקסט לתיבת ההודעות בבנק:")}</div>
      <pre className="whitespace-pre-wrap font-[inherit] text-sm bg-white border rounded-lg p-3">{text}</pre>
      <div className="flex flex-wrap gap-2">
        <button className={btnPrimary + " min-h-[44px]"} onClick={() => navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}>{copied ? "✓" : "📋"} {tr("העתק לבנק")}</button>
        {n < stageNo(o.kind, "pay") && <button className={btnGhost + " min-h-[44px]"} disabled={!!busy || !b.amount} onClick={() => run("pay", { bank: b, stage: "pay" })}>🏦 {tr("להעביר תשלום → משימה ביום שלי")}</button>}
        {n < stageNo(o.kind, "paid") && <button className={btnGhost + " min-h-[44px]"} disabled={!!busy} onClick={() => run("paid", { bank: b, stage: "paid" }, "💶 שולם — אסמכתת SWIFT נשלחה ל-Silitex")}>💶 {tr("סמן: שולם")}</button>}
      </div>
      <div className="flex flex-wrap gap-2 items-center border-t pt-3">
        <select className={inputCls + " max-w-[180px]"} value={kind} onChange={(e) => setKind(e.target.value)}><option value="proforma">Proforma</option><option value="swift">SWIFT / MT103</option><option value="awb">AWB / {tr("משלוח")}</option><option value="other">{tr("אחר")}</option></select>
        <input ref={file} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        <button className={btnGhost + " min-h-[40px]"} disabled={!!busy} onClick={() => file.current?.click()}>📎 {busy === "up" ? tr("מעלה…") : tr("העלה מסמך")}</button>
        {err && <span className="text-xs text-red-700">{err}</span>}
      </div>
      {(o.files || []).filter((f) => f.kind !== "signed").map((f, i) => <div key={i} className="text-sm">📎 {f.kind} · <a href={f.url} target="_blank" rel="noreferrer" className="underline">{f.name}</a> <span className="text-xs text-slate-500">· {fmtDate(f.at)}</span></div>)}
    </Card>
  );
}
