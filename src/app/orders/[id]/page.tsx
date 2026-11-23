"use client";
// page.tsx (src/app/orders/[id]/page.tsx) · updated 23.11.2026 11:50 (Asia/Jerusalem) — v1.24.0 ✍ editable terms card (prints on the form) · 10:55 v1.23.0 both 💾 = "Save as" window → PDF of the A4 form, right here (no new tab) · 10:35 v1.22.1 bottom 💾 = PDF form too · 10:30 v1.22.0 header button = 💾 save PDF (one click, straight to Downloads) · 10:20 v1.21.3 🖨 big "PDF form" button in the header · 16.11.2026 19:00 — v1.14.0 ✨ fill from the customer's mail · created 16.11.2026 18:00 — v1.13.0 📦 Order card: number + project + stepper · the template (customer, lines, shipping)
// SAMPLE: ① ✍ customer form + short mail (view → confirm → sign → mail back) → ② 🇮🇹 order to Silitex (locked until signed) → ③ 🚚
// PRODUCT: ① 🇮🇹 order to Silitex → ② 🏦 proforma + bank text + task → ③ 🚚 · history + export bar
import { use } from "react";
import Link from "next/link";
import { Card, H1, Badge } from "@/components/ui";
import { useOrders } from "@/lib/use-orders";
import { useProjects } from "@/lib/use-projects";
import { orderStage } from "@/config/orders";
import { kindHe, orderText } from "@/lib/orders";
import { fmtDate } from "@/lib/format";
import OrderSteps from "@/components/orders/OrderSteps";
import OrderForm from "@/components/orders/OrderForm";
import OrderFill from "@/components/orders/OrderFill";
import OrderTerms from "@/components/orders/OrderTerms";
import { useStore } from "@/lib/store";
import OrderCustomer from "@/components/orders/OrderCustomer";
import OrderSilitex from "@/components/orders/OrderSilitex";
import OrderBank from "@/components/orders/OrderBank";
import OrderShipping from "@/components/orders/OrderShipping";
import ExportBar from "@/components/ExportBar";
import { useLang } from "@/i18n";
import type { Order } from "@/lib/types";
import { useOrderPdfSave } from "@/lib/use-pdf-save";

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const { t: tr } = useLang();
  const { list, patch, reload } = useOrders({ id }); const { state, addSpend } = useStore(); const o = (list || []).find((x) => x.id === id);
  const { list: prjs } = useProjects({ id: o?.project_id || "-" }); const p = (prjs || []).find((x) => x.id === o?.project_id);
  const pdf = useOrderPdfSave(o);
  if (list === null) return <div className="text-sm text-slate-500">⏳ {tr("טוען…")}</div>;
  if (!o) return <Card><b>{tr("הזמנה לא נמצאה")}: {id}</b> · <Link href="/orders" className="underline">{tr("חזרה להזמנות")}</Link></Card>;
  const save = (x: Partial<Order>, note?: string) => patch(o.id, x, note);
  const s = orderStage(o.kind, o.stage); const v = p?.version || 1;
  const openPrint = () => window.open("/orders/" + o.id + "/print", "_blank"); const printCls = "min-h-[44px] inline-flex items-center px-4 rounded-lg bg-slate-900 text-white font-bold disabled:opacity-60";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3"><Link href="/orders" className="text-sm underline text-slate-500">→ {tr("כל ההזמנות")}</Link>
        <div className="flex-1"><H1 sub={o.lead_name}>{o.kind === "sample" ? "🧪" : "📦"} <span dir="ltr">{o.id}</span> · {tr(kindHe(o.kind))}</H1></div>
        {o.project_id && <Link href={"/projects/" + o.project_id} className="font-mono underline" dir="ltr">📁 #{o.project_id} · v{v}</Link>}
        <Badge tone={o.stage === "pay" ? "amber" : "blue"}>{s.icon} {tr(s.he)}</Badge>
        <button onClick={pdf.save} disabled={pdf.busy} className={printCls}>💾 {tr("שמור PDF")}</button>
        {pdf.msg && <span className="w-full text-sm text-slate-700">{pdf.msg}</span>}</div>
      <OrderSteps o={o} onStage={(st) => { if (st !== o.stage) save({ stage: st }).catch(() => {}); }} />
      <OrderFill o={o} spend={state.spend} addSpend={addSpend} onDone={reload} />
      <OrderForm key={o.updated_at} o={o} onSave={(x) => save(x, "💾 פרטי ההזמנה עודכנו")} />
      <OrderTerms key={"t" + o.updated_at} o={o} onSave={save} />
      {o.kind === "sample" && <OrderCustomer o={o} version={v} onSave={save} />}
      <OrderSilitex o={o} team={p?.team || []} version={v} onSave={save} />
      {o.kind === "product" && <OrderBank key={"b" + o.updated_at} o={o} onSave={save} />}
      <OrderShipping key={"s" + o.updated_at} o={o} onSave={save} />
      <Card className="space-y-2"><b>🕑 {tr("היסטוריה")}</b>
        <ul className="text-sm space-y-1">{[...(o.history || [])].reverse().map((h, i) => <li key={i}><span className="text-xs text-slate-500">{fmtDate(h.at)} {new Date(h.at).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jerusalem" })}</span> — {h.text}</li>)}</ul>
        <ExportBar title={kindHe(o.kind) + " " + o.id + " — " + o.lead_name} text={orderText(o)} filename={o.id} onSave={pdf.save} saveLabel={"💾 " + tr("שמור PDF")} onPrint={openPrint} />
      </Card>
    </div>
  );
}
