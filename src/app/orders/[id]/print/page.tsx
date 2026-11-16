"use client";
// page.tsx (src/app/orders/[id]/print/page.tsx) · created 16.11.2026 18:05 (Asia/Jerusalem) — v1.13.0 ✍ the customer's A4 form (Hebrew, RTL): order no. + project ref + date, from / to,
// products, delivery, sample terms, signature block (name · role · signature · stamp · date). 🖨 print / save as PDF → attach to the short mail → customer signs and mails it back.
import { use } from "react";
import { useOrders } from "@/lib/use-orders";
import { kindHe, lineTotal, orderTotal, fmtEur } from "@/lib/orders";
import { SAMPLE_TERMS } from "@/config/orders";
import { OWNER } from "@/config/app";
import { fmtDate } from "@/lib/format";

export default function OrderPrint({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { list } = useOrders({ id }); const o = (list || []).find((x) => x.id === id);
  if (list === null) return <div className="p-6 text-sm">⏳</div>;
  if (!o) return <div className="p-6 text-sm">לא נמצא: {id}</div>;
  const product = o.kind === "product"; const c = o.customer || {};
  const box = "border border-slate-300 rounded-lg p-3";
  const sig = (label: string) => <div><div className="h-10 border-b border-slate-500" /><div className="text-xs text-slate-600 mt-1">{label}</div></div>;
  return (
    <div dir="rtl" lang="he" className="max-w-[800px] mx-auto bg-white text-[13px] leading-relaxed text-slate-900 p-8 print:p-0 space-y-4">
      <div className="flex gap-2 print:hidden"><button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-slate-900 text-white">🖨 הדפס / שמור כ-PDF</button><span className="text-xs text-slate-500 self-center">בחלון ההדפסה בחר &quot;שמור כ-PDF&quot; וצרף למייל ללקוח.</span></div>
      <header className="flex items-start justify-between gap-4 border-b-2 border-slate-900 pb-3">
        <div><h1 className="text-xl font-extrabold">{kindHe(o.kind)} — לאישור וחתימה</h1><div className="text-slate-600">ספירים — Silitex ישראל</div></div>
        <div className="text-left" dir="ltr"><div className="font-mono font-bold text-lg">{o.id}</div>{o.project_id && <div className="font-mono">#{o.project_id}</div>}<div>{fmtDate(new Date())}</div></div>
      </header>
      <section className="grid grid-cols-2 gap-3">
        <div className={box}><b>מאת</b><div>{OWNER.name} · אבשלום ספיר - ספירים</div><div>{OWNER.brand}</div><div dir="ltr" className="text-right">{OWNER.phone} · {OWNER.email}</div></div>
        <div className={box}><b>אל</b><div>{c.company || o.lead_name}</div><div>{[c.contact, c.role].filter(Boolean).join(" · ")}</div><div dir="ltr" className="text-right">{[c.phone, c.email].filter(Boolean).join(" · ")}</div><div>{c.address}</div></div>
      </section>
      <table className="w-full border-collapse">
        <thead><tr className="bg-slate-100 text-xs"><th className="border p-2 text-start">מוצר</th><th className="border p-2 text-start">קוד</th><th className="border p-2 text-start">אריזה</th><th className="border p-2 text-start">כמות</th><th className="border p-2 text-start">ק״ג</th>{product && <th className="border p-2 text-start">EUR / ק״ג</th>}{product && <th className="border p-2 text-start">סה״כ EUR</th>}</tr></thead>
        <tbody>{o.lines.map((l, i) => <tr key={i}><td className="border p-2" dir="ltr">{l.product}</td><td className="border p-2" dir="ltr">{l.code}</td><td className="border p-2" dir="ltr">{l.pack}</td><td className="border p-2">{l.qty}</td><td className="border p-2">{l.kg}</td>{product && <td className="border p-2" dir="ltr">{l.price ? fmtEur(l.price) : ""}</td>}{product && <td className="border p-2" dir="ltr">{fmtEur(lineTotal(l))}</td>}</tr>)}</tbody>
        {product && <tfoot><tr><td colSpan={6} className="border p-2 font-bold">סה״כ ({o.incoterm})</td><td className="border p-2 font-bold" dir="ltr">{fmtEur(orderTotal(o))}</td></tr></tfoot>}
      </table>
      <section className={box}><b>משלוח</b><div>כתובת למשלוח: {o.shipping?.address || c.address || "________________________"}</div><div>איש קשר לקבלה: {c.contact || "________________"} · {c.phone || "____________"}</div>{product && o.customer_po && <div>PO של הלקוח: {o.customer_po}</div>}</section>
      {!product && <section className={box}><b>תנאי הדוגמה</b><ol className="list-decimal ps-5 space-y-1 mt-1">{SAMPLE_TERMS.map((t, i) => <li key={i}>{t}</li>)}</ol></section>}
      {product && o.payment_terms && <section className={box}><b>תנאי תשלום</b><div>{o.payment_terms}</div></section>}
      <section className="border-2 border-slate-900 rounded-lg p-4 space-y-4">
        <b>אישור הלקוח — אני מאשר/ת את פרטי ההזמנה</b>
        <div className="grid grid-cols-2 gap-6">{sig("שם מלא")}{sig("תפקיד")}{sig("חתימה")}{sig("חותמת החברה")}{sig("תאריך")}</div>
        <div className="text-xs text-slate-600">נא להחזיר את הטופס החתום (סריקה / צילום) למייל {OWNER.email} או בוואטסאפ {OWNER.phone}. מספר ההזמנה {o.id} מופיע בכל ההתכתבות.</div>
      </section>
    </div>
  );
}
