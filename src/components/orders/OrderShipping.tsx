"use client";
// OrderShipping.tsx (src/components/orders/OrderShipping.tsx) · created 16.11.2026 17:55 (Asia/Jerusalem) — v1.13.0 🚚 last steps for both kinds: tracking no. → "on the way" · received · (product) Sapirim invoice · closed
import { useState } from "react";
import { Card, btnGhost, inputCls } from "@/components/ui";
import { stageNo } from "@/config/orders";
import { useLang } from "@/i18n";
import type { Order } from "@/lib/types";

type Props = { o: Order; onSave: (p: Partial<Order>, note?: string) => Promise<unknown> };
export default function OrderShipping({ o, onSave }: Props) {
  const { t: tr } = useLang(); const [t, setT] = useState(o.tracking || ""); const [busy, setBusy] = useState(false); const n = stageNo(o.kind, o.stage);
  const run = async (p: Partial<Order>, note?: string) => { setBusy(true); try { await onSave(p, note); } catch { /* toast */ } setBusy(false); };
  return (
    <Card className="space-y-3">
      <b className="text-lg">③ 🚚 {tr("משלוח וסגירה")}</b>
      <div className="flex flex-wrap gap-2 items-end">
        <label className="text-xs text-slate-500">{tr("מספר מעקב / AWB")}<input className={inputCls + " mt-1"} value={t} onChange={(e) => setT(e.target.value)} dir="ltr" /></label>
        <button className={btnGhost + " min-h-[40px]"} disabled={busy || !t.trim()} onClick={() => run({ tracking: t.trim(), ...(n < stageNo(o.kind, "shipped") ? { stage: "shipped" } : {}) }, "🚚 נאסף · " + t.trim())}>🚚 {tr("נאסף / בדרך")}</button>
        {n < stageNo(o.kind, "received") && <button className={btnGhost + " min-h-[40px]"} disabled={busy} onClick={() => run({ stage: "received" }, o.kind === "sample" ? "📬 הדוגמה התקבלה אצל הלקוח — לבקש משוב" : "📬 התקבל")}>📬 {tr("התקבל")}</button>}
        {o.kind === "product" && n < stageNo(o.kind, "invoiced") && <button className={btnGhost + " min-h-[40px]"} disabled={busy} onClick={() => run({ stage: "invoiced" })}>🧾 {tr("חשבונית ספירים הופקה")}</button>}
        {o.stage !== "closed" && <button className={btnGhost + " min-h-[40px]"} disabled={busy} onClick={() => run({ stage: "closed" })}>🏁 {tr("סגור הזמנה")}</button>}
      </div>
    </Card>
  );
}
