"use client";
// OrderTerms.tsx (src/components/orders/OrderTerms.tsx) · created 23.11.2026 11:50 (Asia/Jerusalem) — v1.24.0 ✍ the order's terms, editable per order: one line = one numbered item on the A4 form · ↺ back to the default text (src/config/orders.ts)
import { useState } from "react";
import { Card, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { defaultTerms } from "@/config/orders";
import type { Order } from "@/lib/types";

type Props = { o: Order; onSave: (p: Partial<Order>, note?: string) => Promise<unknown> };
export default function OrderTerms({ o, onSave }: Props) {
  const start = (o.terms ?? defaultTerms(o.kind)).join("\n");
  const [txt, setTxt] = useState(start); const [busy, setBusy] = useState(false); const [ok, setOk] = useState(false);
  const items = txt.split("\n").map((s) => s.trim()).filter(Boolean);
  const save = async () => { setBusy(true); setOk(false); try { await onSave({ terms: items }, "✍ תנאי ההזמנה עודכנו"); setOk(true); } catch { /* toast */ } setBusy(false); };
  const reset = () => { setTxt(defaultTerms(o.kind).join("\n")); setOk(false); };
  const title = o.kind === "sample" ? "תנאי הדוגמה" : "תנאי ההזמנה";
  return (
    <Card className="space-y-2">
      <b>✍ {title} — כפי שיודפסו בטופס</b>
      <div className="text-xs text-slate-500">כל שורה = סעיף ממוספר בטופס ה-PDF. שורה ריקה לא תודפס.</div>
      <textarea className={inputCls + " min-h-[140px] leading-relaxed"} dir="rtl" value={txt} onChange={(e) => { setTxt(e.target.value); setOk(false); }} />
      <div className="flex flex-wrap items-center gap-2">
        <button className={btnPrimary + " min-h-[44px]"} disabled={busy} onClick={save}>💾 {busy ? "…" : "שמור תנאים"}</button>
        <button className={btnGhost + " min-h-[44px]"} onClick={reset}>↺ טקסט ברירת המחדל</button>
        <span className="text-xs text-slate-600">{ok ? "✓ נשמר — יופיע ב-PDF הבא" : items.length + " סעיפים"}</span>
      </div>
    </Card>
  );
}
