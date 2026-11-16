"use client";
// OrderForm.tsx (src/components/orders/OrderForm.tsx) · created 16.11.2026 17:35 (Asia/Jerusalem) — v1.13.0 📦 the order template: customer, lines (code · product · pack · qty · kg · EUR/kg), terms, shipping + documents. One 💾 save.
import { useState } from "react";
import { Card, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { lineTotal, orderTotal, fmtEur } from "@/lib/orders";
import { DEFAULT_SHIP_DOCS } from "@/config/orders";
import { useLang } from "@/i18n";
import type { Order, OrderLine } from "@/lib/types";

type Props = { o: Order; onSave: (p: Partial<Order>) => Promise<unknown> };
export default function OrderForm({ o, onSave }: Props) {
  const { t: tr } = useLang(); const product = o.kind === "product";
  const [c, setC] = useState(o.customer || {}); const [lines, setLines] = useState<OrderLine[]>(o.lines?.length ? o.lines : [{ code: "", product: "", pack: "", qty: 1, kg: 1 }]);
  const [sh, setSh] = useState(o.shipping || {}); const [po, setPo] = useState(o.customer_po || ""); const [inc, setInc] = useState(o.incoterm || ""); const [pay, setPay] = useState(o.payment_terms || "");
  const [busy, setBusy] = useState(false);
  const setLine = (i: number, k: keyof OrderLine, v: string) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: ["qty", "kg", "price"].includes(k) ? (v === "" ? undefined : Number(v)) : v } : l)));
  const save = async () => { setBusy(true); try { await onSave({ customer: c, lines: lines.filter((l) => l.product || l.code), shipping: sh, customer_po: po || null, incoterm: inc, payment_terms: pay || null }); } catch { /* toast */ } setBusy(false); };
  const f = (label: string, v: string | undefined, set: (v: string) => void, ltr = false) => <label className="text-xs text-slate-500">{tr(label)}<input className={inputCls + " mt-1"} value={v || ""} onChange={(e) => set(e.target.value)} dir={ltr ? "ltr" : "auto"} /></label>;
  return (
    <Card className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        {f("חברה", c.company, (v) => setC({ ...c, company: v }))}{f("איש קשר", c.contact, (v) => setC({ ...c, contact: v }))}{f("תפקיד", c.role, (v) => setC({ ...c, role: v }))}
        {f("מייל", c.email, (v) => setC({ ...c, email: v }), true)}{f("נייד", c.phone, (v) => setC({ ...c, phone: v }), true)}{f("כתובת הלקוח", c.address, (v) => setC({ ...c, address: v }))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="text-xs text-slate-500"><th className="text-start p-1">{tr("קוד")}</th><th className="text-start p-1">{tr("מוצר")}</th><th className="text-start p-1">{tr("אריזה")}</th><th className="text-start p-1">{tr("כמות")}</th><th className="text-start p-1">{tr("ק״ג")}</th>{product && <th className="text-start p-1">EUR / kg</th>}{product && <th className="text-start p-1">EUR</th>}<th /></tr></thead>
          <tbody>{lines.map((l, i) => (
            <tr key={i} dir="ltr">
              <td className="p-1"><input className={inputCls} value={l.code} onChange={(e) => setLine(i, "code", e.target.value)} /></td>
              <td className="p-1"><input className={inputCls} value={l.product} onChange={(e) => setLine(i, "product", e.target.value)} /></td>
              <td className="p-1"><input className={inputCls} value={l.pack} onChange={(e) => setLine(i, "pack", e.target.value)} /></td>
              <td className="p-1 w-20"><input type="number" className={inputCls} value={l.qty ?? ""} onChange={(e) => setLine(i, "qty", e.target.value)} /></td>
              <td className="p-1 w-24"><input type="number" className={inputCls} value={l.kg ?? ""} onChange={(e) => setLine(i, "kg", e.target.value)} /></td>
              {product && <td className="p-1 w-24"><input type="number" step="0.01" className={inputCls} value={l.price ?? ""} onChange={(e) => setLine(i, "price", e.target.value)} /></td>}
              {product && <td className="p-1 font-bold">{fmtEur(lineTotal(l))}</td>}
              <td className="p-1"><button className={btnGhost} aria-label={tr("הסר שורה")} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}>✕</button></td>
            </tr>))}</tbody>
        </table>
        <div className="flex items-center gap-3 mt-2"><button className={btnGhost} onClick={() => setLines((ls) => [...ls, { code: "", product: "", pack: "", qty: 1, kg: 0 }])}>➕ {tr("שורה")}</button>{product && <b className="ms-auto" dir="ltr">Total EUR {fmtEur(orderTotal({ lines }))}</b>}</div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {product && f("PO של הלקוח", po, setPo)}{f("תנאי מסירה", inc, setInc, true)}{product && f("תנאי תשלום", pay, setPay)}
        {f("נמען (Consignee)", sh.consignee, (v) => setSh({ ...sh, consignee: v }), true)}{f("כתובת למשלוח", sh.address, (v) => setSh({ ...sh, address: v }))}{f("שליח", sh.courier, (v) => setSh({ ...sh, courier: v }), true)}
        {f("מספר חשבון שליח", sh.account, (v) => setSh({ ...sh, account: v }), true)}{f("סיווג חומר מסוכן (מה-SDS)", sh.dg, (v) => setSh({ ...sh, dg: v }), true)}{f("מסמכים נדרשים", sh.docs || DEFAULT_SHIP_DOCS, (v) => setSh({ ...sh, docs: v }), true)}
      </div>
      <label className="text-xs text-slate-500 block">{tr("הערות למשלוח")}<input className={inputCls + " mt-1"} value={sh.notes || ""} onChange={(e) => setSh({ ...sh, notes: e.target.value })} dir="auto" /></label>
      <button className={btnPrimary + " min-h-[44px]"} disabled={busy} onClick={save}>💾 {busy ? "…" : tr("שמור הזמנה")}</button>
    </Card>
  );
}
