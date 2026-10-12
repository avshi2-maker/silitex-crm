"use client";
// MatchMatrix.tsx (src/components/market/MatchMatrix.tsx) · updated 12.10.2026 12:25 (Asia/Jerusalem) — account deep-dive: product line × Silitex product matrix (from NotebookLM site parse) + R&D focus / buyer trigger / next action
import Link from "next/link";
import { Card, Badge, btnGhost } from "@/components/ui";
import { useLang } from "@/i18n";
import type { Lead } from "@/lib/types";
import matching from "@/data/account_matching.json";
import PurchaseHistory from "./PurchaseHistory";
import { verdictOf } from "@/lib/catalog";
type Row = { line: string; function: string; silitex: string; inci: string; benefit: string; green: string };
type Acc = { website?: string; note?: string; source?: string; rows: Row[] };
const M = matching as Record<string, Acc>;
export default function MatchMatrix({ lead }: { lead: Lead }) {
  const { t: tr } = useLang(); const acc = M[lead.id]; const rows = acc?.rows || []; const site = lead.website || acc?.website;
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div><div className="font-bold text-lg">🎯 {lead.name}</div><div className="text-xs text-slate-500">{lead.industry} · {lead.sub_industry}{site && <> · <a className="text-brand-600 underline" href={site} target="_blank" rel="noreferrer" dir="ltr">{site.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a></>}</div></div>
        <div className="flex gap-1 items-center"><Badge tone="amber">{lead.plan_stage}</Badge><Badge tone="slate">{lead.tier}</Badge><Link href={"/leads/" + lead.id} className={btnGhost + " text-xs"}>{tr("תיק לקוח")} →</Link></div>
      </div>
      <div className="grid md:grid-cols-3 gap-2 text-sm mb-3">
        <div className="p-2 rounded-lg bg-sky-50 border border-sky-200"><b>🔬 {tr("מוקד הסמכה במו\"פ")}</b><div className="text-xs mt-1">{lead.rd_focus || "—"}</div></div>
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200"><b>🤝 {tr("טריגר למעבר לרכש")}</b><div className="text-xs mt-1">{lead.buyer_trigger || "—"}</div></div>
        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200"><b>▶ {tr("הפעולה הבאה")}</b><div className="text-xs mt-1">{lead.plan_next_action || "—"}</div><div className="text-[11px] text-slate-500 mt-1">{lead.contact_role} · {lead.department}</div></div>
      </div>
      <div className="mb-3"><PurchaseHistory leadId={lead.id} /></div>
      <div className="text-xs text-slate-500 mb-1">{tr("קו מוצרים של הלקוח × מוצר Silitex מתאים")} · {rows.length ? rows.length + " " + tr("קווי מוצר") : tr("עדיין לא נותח — הרץ ניתוח אתר (NotebookLM / AI) כדי למלא")}</div>
      {rows.length > 0 && (<div className="overflow-auto"><table className="w-full text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-2 text-start">{tr("קו מוצר")}</th><th className="p-2 text-start">{tr("פונקציה")}</th><th className="p-2 text-start">Silitex</th><th className="p-2 text-start">INCI</th><th className="p-2 text-start">{tr("יתרון פורמולציה")}</th><th className="p-2 text-start">🌿 {tr("חלופה ירוקה")}</th></tr></thead>
        <tbody>{rows.map((r, i) => (<tr key={i} className="border-t align-top"><td className="p-2 font-medium">{r.line}</td><td className="p-2 text-slate-600">{r.function}</td><td className="p-2 font-medium text-brand-700">{r.silitex}{verdictOf(r.silitex) === "gap" && <Link href="/market/gaps" className="ms-1 text-red-600" title="Not in Silitex catalogue — see gaps annex">⛔</Link>}{verdictOf(r.silitex) === "unknown" && <span className="ms-1 text-amber-600" title="Name not found on silitex.it — verify">⚠️</span>}</td><td className="p-2 text-slate-500" dir="ltr">{r.inci}</td><td className="p-2">{r.benefit}</td><td className="p-2 text-emerald-800">{r.green}</td></tr>))}</tbody></table></div>)}
      <div className="text-[11px] text-slate-400 mt-2">{acc?.source || ""}{acc?.note ? " · " + acc.note : ""} · {tr("תוכן AI = טיוטה; כל SKU נבדק מול קטלוג Silitex לפני שליחה ללקוח.")} · ⛔ = {tr("פער קטלוג")} · ⚠️ = {tr("שם לא נמצא ב-silitex.it")} · <Link href="/market/gaps" className="underline">{tr("נספח פערים")}</Link></div>
    </Card>
  );
}
