"use client";
// page.tsx (src/app/orders/[id]/print/page.tsx) · updated 23.11.2026 10:30 (Asia/Jerusalem) — v1.22.0 💾 one-click PDF download (no Save as) · auto on ?dl=1 · 10:10 v1.21.2 PDF file name = order no. + customer · 09:55 v1.21.1 one A4 portrait page (forced @page, tighter spacing, 3-col signature block) · created 16.11.2026 18:05 — v1.13.0 ✍ the customer's A4 form (Hebrew, RTL): order no. + project ref + date, from / to,
// products, delivery, sample terms, signature block (name · role · signature · stamp · date). 🖨 print / save as PDF → attach to the short mail → customer signs and mails it back.
import { use, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { downloadOnePagePdf } from "@/lib/pdf-download";
import { useOrders } from "@/lib/use-orders";
import { kindHe, lineTotal, orderTotal, fmtEur } from "@/lib/orders";
import { SAMPLE_TERMS } from "@/config/orders";
import { OWNER } from "@/config/app";
import { fmtDate } from "@/lib/format";

export default function OrderPrint({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { list } = useOrders({ id }); const o = (list || []).find((x) => x.id === id);
  const sheet = useRef<HTMLDivElement>(null); const [dl, setDl] = useState<"" | "busy" | "done" | "err">(""); const auto = useSearchParams().get("dl") === "1"; const fired = useRef(false);
  const fileName = o ? [o.id, (o.customer?.company || o.lead_name || "").trim()].filter(Boolean).join("_") : "";
  // the print-window file name = the page title → "ORD-S-0001_Sabonitzeit.pdf" instead of "Silitex CRM · Israel.pdf"
  useEffect(() => { if (!fileName) return; const prev = document.title; document.title = fileName; return () => { document.title = prev; }; }, [fileName]);
  const download = async () => { if (!sheet.current || !fileName) return; setDl("busy"); try { await downloadOnePagePdf(sheet.current, fileName); setDl("done"); } catch { setDl("err"); } };
  useEffect(() => { if (auto && o && !fired.current) { fired.current = true; const t = setTimeout(download, 600); return () => clearTimeout(t); } }, [auto, o]); // eslint-disable-line react-hooks/exhaustive-deps
  if (list === null) return <div className="p-6 text-sm">⏳</div>;
  if (!o) return <div className="p-6 text-sm">לא נמצא: {id}</div>;
  const product = o.kind === "product"; const c = o.customer || {};
  const box = "border border-slate-300 rounded-lg p-3 print:p-2";
  const sig = (label: string) => <div><div className="h-8 border-b border-slate-500" /><div className="text-[11px] text-slate-600 mt-0.5">{label}</div></div>;
  const dlCls = "min-h-[44px] px-5 rounded-lg bg-pink-600 text-white font-bold disabled:opacity-60"; const prCls = "min-h-[44px] px-4 rounded-lg border border-slate-300 bg-white";
  const pageCss = "@page{size:A4 portrait;margin:10mm}@media print{html,body{background:#fff}}";
  return (
    <div dir="rtl" lang="he" className="max-w-[800px] mx-auto">
      <style>{pageCss}</style>
      <div className="flex flex-wrap items-center gap-2 p-4 print:hidden">
        <button onClick={download} disabled={dl === "busy"} className={dlCls}>{dl === "busy" ? "⏳ מכין PDF…" : "💾 שמור PDF"}</button>
        <button onClick={() => window.print()} className={prCls}>🖨 הדפס</button>
        <span className="text-xs text-slate-600">{dl === "done" ? "✓ נשמר בתיקיית ההורדות (Downloads): " + fileName + ".pdf — צרף אותו למייל ללקוח." : dl === "err" ? "⚠ השמירה נכשלה — נסה שוב או השתמש בהדפס." : "הקובץ יורד ישר לתיקיית ההורדות (Downloads)."}</span></div>
      <div ref={sheet} className="bg-white text-[13px] leading-relaxed text-slate-900 p-8 print:p-0 print:text-[12px] print:leading-snug space-y-4 print:space-y-2.5">
      <header className="flex items-start justify-between gap-4 border-b-2 border-slate-900 pb-3 print:pb-2">
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
      {!product && <section className={box}><b>תנאי הדוגמה</b><ol className="list-decimal ps-5 space-y-1 print:space-y-0 mt-1">{SAMPLE_TERMS.map((t, i) => <li key={i}>{t}</li>)}</ol></section>}
      {product && o.payment_terms && <section className={box}><b>תנאי תשלום</b><div>{o.payment_terms}</div></section>}
      <section className="border-2 border-slate-900 rounded-lg p-4 space-y-4 print:p-3 print:space-y-2 break-inside-avoid">
        <b>אישור הלקוח — אני מאשר/ת את פרטי ההזמנה</b>
        <div className="grid grid-cols-3 gap-x-6 gap-y-3">{sig("שם מלא")}{sig("תפקיד")}{sig("חתימה")}{sig("חותמת החברה")}{sig("תאריך")}</div>
        <div className="text-xs text-slate-600">נא להחזיר את הטופס החתום (סריקה / צילום) למייל {OWNER.email} או בוואטסאפ {OWNER.phone}. מספר ההזמנה {o.id} מופיע בכל ההתכתבות.</div>
      </section>
      </div>
    </div>
  );
}
