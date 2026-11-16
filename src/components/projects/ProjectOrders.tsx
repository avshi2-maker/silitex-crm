"use client";
// ProjectOrders.tsx (src/components/projects/ProjectOrders.tsx) · created 16.11.2026 18:10 (Asia/Jerusalem) — v1.13.0 📦 the project's orders on the project card + ➕ sample / product order (pre-filled from this project)
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Badge, btnGhost } from "@/components/ui";
import { useOrders } from "@/lib/use-orders";
import { orderStage } from "@/config/orders";
import { kindHe } from "@/lib/orders";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Project } from "@/lib/types";

export default function ProjectOrders({ p }: { p: Project }) {
  const { t: tr } = useLang(); const router = useRouter(); const { list, create } = useOrders({ project: p.id }); const [busy, setBusy] = useState("");
  const make = async (kind: "sample" | "product") => { setBusy(kind); try { const o = await create({ kind, project_id: p.id }); router.push("/orders/" + o.id); } catch { /* toast */ } setBusy(""); };
  return (
    <Card className="space-y-2">
      <div className="flex flex-wrap items-center gap-2"><b className="flex-1">📦 {tr("הזמנות בפרויקט")}</b>
        <button className={btnGhost + " min-h-[40px]"} disabled={!!busy} onClick={() => make("sample")}>🧪 {busy === "sample" ? "…" : tr("הזמנת דוגמה")}</button>
        <button className={btnGhost + " min-h-[40px]"} disabled={!!busy} onClick={() => make("product")}>📦 {busy === "product" ? "…" : tr("הזמנת מוצר")}</button></div>
      {list !== null && list.length === 0 && <div className="text-sm text-slate-500">{tr("אין הזמנות עדיין. דוגמה: הלקוח חותם קודם, ורק אז ההזמנה עוברת ל-Silitex.")}</div>}
      <ul className="text-sm space-y-1">{(list || []).map((o) => { const s = orderStage(o.kind, o.stage); return (
        <li key={o.id} className="flex flex-wrap items-center gap-2"><Link href={"/orders/" + o.id} className="font-mono font-bold text-brand-700 underline" dir="ltr">{o.id}</Link><span>{tr(kindHe(o.kind))}</span><Badge tone={o.stage === "pay" ? "amber" : "blue"}>{s.icon} {tr(s.he)}</Badge><span className="text-xs text-slate-500">{fmtDate(o.updated_at)}</span></li>); })}</ul>
    </Card>
  );
}
