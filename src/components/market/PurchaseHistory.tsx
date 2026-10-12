"use client";
// PurchaseHistory.tsx (src/components/market/PurchaseHistory.tsx) · updated 12.10.2026 10:50 (Asia/Jerusalem) — 🕰️ what this account bought from Sapirim (5–20 yrs ago) → auto-matched Silitex offset; data in src/data/purchase_history.json (filled from Avshi's lists)
import { Card, Badge } from "@/components/ui";
import { matchOffset } from "@/lib/offset-match";
import { useLang } from "@/i18n";
import history from "@/data/purchase_history.json";
export type Purchase = { product: string; qty_per_year?: string; years?: string; contact?: string; notes?: string; silitex?: string };
const H = history as Record<string, Purchase[]>;
export const purchasesOf = (leadId: string): Purchase[] => (leadId.startsWith("_") ? [] : H[leadId] || []);
export const purchaseContext = (leadId: string) => purchasesOf(leadId).map((p) => { const m = p.silitex || matchOffset(p.product)?.silitex || "?"; return "- bought from Sapirim: " + p.product + (p.qty_per_year ? " · " + p.qty_per_year : "") + (p.years ? " · " + p.years : "") + " → Silitex offset: " + m + (p.notes ? " (" + p.notes + ")" : ""); }).join("\n");
export default function PurchaseHistory({ leadId, compact }: { leadId: string; compact?: boolean }) {
  const { t: tr } = useLang(); const rows = purchasesOf(leadId);
  if (!rows.length) return null;
  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <div className="flex items-center justify-between mb-1"><div className="font-bold">🕰️ {tr("קנו מ-Sapirim בעבר")} <Badge tone="amber">{rows.length}</Badge></div><span className="text-[11px] text-slate-500">{tr("הקלף החזק מול Silitex: אותן כימיות, אותם מפעלים")}</span></div>
      <table className="w-full text-xs"><thead className="text-slate-500"><tr><th className="p-1 text-start">{tr("מוצר שנמכר")}</th>{!compact && <th className="p-1 text-start">{tr("כמות / שנה")}</th>}<th className="p-1 text-start">{tr("שנים")}</th><th className="p-1 text-start">Silitex</th>{!compact && <th className="p-1 text-start">{tr("הערות")}</th>}</tr></thead>
        <tbody>{rows.map((p, i) => { const m = p.silitex ? { silitex: p.silitex, via: "manual", score: 1 } : matchOffset(p.product); return (
          <tr key={i} className="border-t align-top"><td className="p-1 font-medium" dir="ltr">{p.product}</td>{!compact && <td className="p-1">{p.qty_per_year || ""}</td>}<td className="p-1">{p.years || ""}</td><td className="p-1">{m ? <span className="text-brand-700 font-medium">{m.silitex}<span className="text-[10px] text-slate-400"> {m.via === "manual" ? "" : "· " + tr("אוטומטי") + " " + Math.round(Math.min(m.score, 1) * 100) + "%"}</span></span> : <Badge tone="red">{tr("אין התאמה — לבדוק")}</Badge>}</td>{!compact && <td className="p-1 text-slate-500">{[p.contact, p.notes].filter(Boolean).join(" · ")}</td>}</tr>); })}</tbody></table>
    </Card>
  );
}
