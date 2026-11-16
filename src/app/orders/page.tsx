"use client";
// page.tsx (src/app/orders/page.tsx) · created 16.11.2026 17:25 (Asia/Jerusalem) — v1.13.0 📦 Orders tab: every sample / product order with its own number (ORD-S / ORD-P),
// status report (open · waiting for the customer's signature · waiting for Silitex · 🏦 to pay · on the way · to invoice), filters, search, ⏰ no movement 3 days, ➕ new order from a project
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, H1, Badge, Stat, inputCls, btnPrimary } from "@/components/ui";
import { useOrders } from "@/lib/use-orders";
import { useProjects } from "@/lib/use-projects";
import { orderStage, stageNo, stagesOf, ORDER_ENDED, ORDER_STALL_DAYS } from "@/config/orders";
import { ENDED } from "@/config/projects";
import { orderTotal, fmtEur, kindHe } from "@/lib/orders";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Order } from "@/lib/types";

const idle = (o: Order) => Math.floor((Date.now() - new Date(o.updated_at).getTime()) / 864e5);
const late = (o: Order) => !ORDER_ENDED.includes(o.stage) && idle(o) >= ORDER_STALL_DAYS;
const FILTERS: { id: string; he: string; ok: (o: Order) => boolean }[] = [
  { id: "open", he: "פתוחות", ok: (o) => !ORDER_ENDED.includes(o.stage) },
  { id: "sample", he: "🧪 דוגמאות", ok: (o) => o.kind === "sample" && !ORDER_ENDED.includes(o.stage) },
  { id: "product", he: "📦 מוצרים", ok: (o) => o.kind === "product" && !ORDER_ENDED.includes(o.stage) },
  { id: "late", he: "⏰ ללא תנועה", ok: late },
  { id: "closed", he: "✓ סגורות", ok: (o) => ORDER_ENDED.includes(o.stage) },
  { id: "all", he: "הכל", ok: () => true },
];

export default function OrdersPage() {
  const { t: tr } = useLang(); const router = useRouter();
  const { list, err, create } = useOrders(); const { list: projects } = useProjects({ lite: true });
  const [f, setF] = useState("open"); const [q, setQ] = useState(""); const [prj, setPrj] = useState(""); const [busy, setBusy] = useState("");
  const all = list || []; const open = all.filter((o) => !ORDER_ENDED.includes(o.stage));
  const rows = useMemo(() => { const fl = FILTERS.find((x) => x.id === f)!; const s = q.trim().toLowerCase(); return all.filter((o) => fl.ok(o) && (!s || [o.id, o.project_id, o.lead_name, o.customer_po, o.silitex_ref, ...o.lines.map((l) => l.product + " " + l.code)].join(" ").toLowerCase().includes(s))); }, [all, f, q]);
  const at = (o: Order, id: string) => o.stage === id;
  const openProjects = (projects || []).filter((p) => !ENDED.includes(p.stage));
  const make = async (kind: "sample" | "product") => { if (!prj) return; setBusy(kind); try { const o = await create({ kind, project_id: prj }); router.push("/orders/" + o.id); } catch { /* toast */ } setBusy(""); };
  return (
    <div className="space-y-4">
      <H1 sub={tr("כל הזמנה לדוגמה או למוצר מקבלת מספר ייחודי, מקושרת לפרויקט #SPR ועוקבת עד חשבונית ספירים. דוגמה נשלחת ל-Silitex רק אחרי שהלקוח חתם.")}>📦 {tr("הזמנות")}</H1>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Stat label={tr("הזמנות פתוחות")} value={list === null ? "…" : open.length} />
        <Stat label={"✍ " + tr("ממתין לחתימת הלקוח")} value={open.filter((o) => at(o, "customer_sent")).length} />
        <Stat label={"🇮🇹 " + tr("ממתין ל-Silitex")} value={open.filter((o) => at(o, "silitex_sent") || (o.kind === "sample" && at(o, "signed"))).length} />
        <Stat label={"🏦 " + tr("להעביר תשלום")} value={open.filter((o) => at(o, "pay") || (o.kind === "product" && at(o, "confirmed"))).length} hint={"EUR " + fmtEur(open.filter((o) => at(o, "pay")).reduce((a, o) => a + (Number(o.bank?.amount) || orderTotal(o)), 0))} />
        <Stat label={"🚚 " + tr("בדרך")} value={open.filter((o) => at(o, "shipped")).length} />
        <Stat label={"🧾 " + tr("לחשבונית ספירים")} value={open.filter((o) => o.kind === "product" && at(o, "received")).length} />
      </div>
      <Card className="space-y-2">
        <b>➕ {tr("הזמנה חדשה")}</b>
        <div className="flex flex-wrap gap-2 items-center">
          <select className={inputCls + " max-w-md"} value={prj} onChange={(e) => setPrj(e.target.value)}><option value="">{tr("בחר פרויקט פתוח…")}</option>{openProjects.map((p) => <option key={p.id} value={p.id}>#{p.id} · {p.lead_name}</option>)}</select>
          <button className={btnPrimary + " min-h-[44px]"} disabled={!prj || !!busy} onClick={() => make("sample")}>🧪 {busy === "sample" ? "…" : tr("הזמנת דוגמה")}</button>
          <button className={btnPrimary + " min-h-[44px]"} disabled={!prj || !!busy} onClick={() => make("product")}>📦 {busy === "product" ? "…" : tr("הזמנת מוצר")}</button>
        </div>
        <div className="text-xs text-slate-500">{tr("הפרטים נמשכים מכרטיס הפרויקט (תשובת Silitex: מוצר, מחיר, אריזה) ומכרטיס הלקוח. אפשר לפתוח גם מכרטיס הפרויקט.")}</div>
      </Card>
      <div className="flex flex-wrap gap-2 items-center">
        {FILTERS.map((x) => <button key={x.id} onClick={() => setF(x.id)} className={"px-3 min-h-[40px] rounded-full text-sm border " + (f === x.id ? "bg-ink-900 text-white border-ink-900" : "bg-white")}>{tr(x.he)} ({all.filter(x.ok).length})</button>)}
        <input className={inputCls + " max-w-xs ms-auto"} placeholder={tr("חיפוש: מספר, לקוח, מוצר, PO…")} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {err && <Card className="text-sm text-red-700">{err}</Card>}
      <Card className="p-0 overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead><tr className="bg-slate-50 text-xs text-slate-500 text-start"><th className="p-3 text-start">{tr("מספר הזמנה")}</th><th className="p-3 text-start">{tr("סוג")}</th><th className="p-3 text-start">{tr("פרויקט · לקוח")}</th><th className="p-3 text-start">{tr("מוצר · כמות")}</th><th className="p-3 text-start">EUR</th><th className="p-3 text-start">{tr("שלב")}</th><th className="p-3 text-start">{tr("עודכן")}</th></tr></thead>
          <tbody>{rows.map((o) => { const s = orderStage(o.kind, o.stage); return (
            <tr key={o.id} className={"border-t hover:bg-slate-50 " + (late(o) ? "bg-red-50" : o.stage === "pay" ? "bg-amber-50" : "")}>
              <td className="p-3"><Link href={"/orders/" + o.id} className="font-mono font-bold text-brand-700 hover:underline" dir="ltr">{o.id}</Link></td>
              <td className="p-3"><Badge tone={o.kind === "sample" ? "blue" : "green"}>{o.kind === "sample" ? "🧪" : "📦"} {tr(kindHe(o.kind))}</Badge></td>
              <td className="p-3">{o.project_id && <Link href={"/projects/" + o.project_id} className="font-mono underline" dir="ltr">#{o.project_id}</Link>}<div className="text-xs text-slate-500">{o.lead_name}</div></td>
              <td className="p-3" dir="ltr">{o.lines.map((l, i) => <div key={i}>{l.product || "—"} <span className="text-xs text-slate-500">· {l.qty} × {l.pack} ({l.kg} kg)</span></div>)}</td>
              <td className="p-3" dir="ltr">{orderTotal(o) ? fmtEur(orderTotal(o)) : o.kind === "sample" ? tr("ללא חיוב") : "—"}</td>
              <td className="p-3"><Badge tone={o.stage === "pay" ? "amber" : ORDER_ENDED.includes(o.stage) ? "green" : "blue"}>{s.icon} {tr(s.he)}</Badge><div className="text-xs text-slate-500 mt-1">{stageNo(o.kind, o.stage) + 1}/{stagesOf(o.kind).length} · {tr(s.hint)}</div></td>
              <td className="p-3 text-xs">{fmtDate(o.updated_at)}{late(o) && <div><Badge tone="red">⏰ {idle(o)} {tr("ימים")}</Badge></div>}</td>
            </tr>); })}
            {list !== null && rows.length === 0 && <tr><td colSpan={7} className="p-4 text-slate-500">{tr("אין הזמנות במסנן הזה.")}</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
