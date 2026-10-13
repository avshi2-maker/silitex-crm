"use client";
// IntegrityPanel.tsx (src/components/market/IntegrityPanel.tsx) · updated 13.10.2026 07:00 (Asia/Jerusalem) — "ironclad" panel on /market: Yr-1 plan tons split into catalogue-confirmed vs pending (website-only SKUs), the SKUs to confirm, and the catalogues to request from Silitex. Honest by construction: computed from data, not typed.
import { useState } from "react";
import { Card, Badge, btnGhost } from "@/components/ui";
import { useLang } from "@/i18n";
import type { Lead } from "@/lib/types";
import { checkLeads, MISSING_CATALOGUES } from "@/lib/integrity";
export default function IntegrityPanel({ leads }: { leads: Lead[] }) {
  const { t: tr } = useLang(); const [open, setOpen] = useState(false);
  const c = checkLeads(leads); const tot = c.backedTons + c.pendingTons; const pct = tot ? Math.round((c.backedTons / tot) * 100) : 0;
  return (
    <Card className="text-sm space-y-2 border-slate-300">
      <div className="flex flex-wrap items-center gap-2"><b>🛡️ {tr("בדיקת יושרה — התוכנית מול הקטלוגים")}</b><Badge tone="green">{c.backedTons} t · ${c.backedUsd.toLocaleString()} {tr("מגובה בקטלוגים 2026")}</Badge><Badge tone="amber">{c.pendingTons} t · ${c.pendingUsd.toLocaleString()} {tr("ממתין לאישור קטלוג")}</Badge><Badge tone="slate">{pct}%</Badge><button className={btnGhost + " text-xs"} onClick={() => setOpen(!open)}>{open ? tr("סגור") : tr("פרט")}</button></div>
      <div className="text-xs text-slate-600">{tr("כל הנפחים הם הערכות שולחן (לא אושרו ע\"י לקוח). 'ממתין' = ה-SKU הראשי מופיע באתר silitex.it אבל לא ב-5 הקטלוגים שהתקבלו — לא פער, חוסר קטלוג. לא מציגים ל-Silitex טון שאין מאחוריו מוצר מאושר.")}</div>
      {open && (<div className="space-y-2">
        <table className="w-full text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-1.5 text-start">{tr("לקוח")}</th><th className="p-1.5 text-start">t</th><th className="p-1.5 text-start">$</th><th className="p-1.5 text-start">{tr("מצב")}</th><th className="p-1.5 text-start">SKU</th></tr></thead>
          <tbody>{c.rows.map((r) => <tr key={r.id} className="border-t align-top"><td className="p-1.5 font-medium">{r.name}</td><td className="p-1.5">{r.tons}</td><td className="p-1.5">{r.usd.toLocaleString()}</td><td className="p-1.5">{r.status === "full" ? <Badge tone="green">✅</Badge> : r.status === "core" ? <Badge tone="blue">✅ {tr("ראשי")}</Badge> : <Badge tone="amber">🟡</Badge>}</td><td className="p-1.5" dir="ltr">{r.tokens.map((x) => <span key={x.t} className={"inline-block me-1 mb-0.5 px-1 rounded " + (x.p === "catalogue" ? "bg-emerald-50 text-emerald-800" : x.p === "website" ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-800")}>{x.t}</span>)}</td></tr>)}</tbody></table>
        <div><b>{tr("SKU לאישור מול Silitex (באתר, לא בקטלוגים):")}</b> <span dir="ltr">{c.websiteOnly.join(" · ")}</span></div>
        <div><b>{tr("קטלוגים לבקש מפדריקה:")}</b><ul className="list-disc ms-5">{MISSING_CATALOGUES.map((m) => <li key={m}>{m}</li>)}</ul></div>
      </div>)}
    </Card>
  );
}
