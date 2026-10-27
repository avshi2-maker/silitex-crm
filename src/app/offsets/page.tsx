"use client";
// page.tsx (src/app/offsets/page.tsx) · updated 27.10.2026 07:10 (Asia/Jerusalem) — v1.1.0 per-code ✓ INCI (producer page) / ⚠; fake codes removed (count + list per row) · updated 26.10.2026 11:15 (Asia/Jerusalem) — v0.99.0 truth rule: ⚠ unverified / ? unknown on every non-verified producer cell (incl. Dow), banner, export says so · 15.10.2026 14:30 — + ⚡ quick match on top — global producers cross-reference matrix (37 categories × 24 producers)
import { useMemo, useState } from "react";
import { OFFSETS, FOOD_GRADE } from "@/lib/data";
import { Card, H1, Badge, inputCls } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import ReachNote from "@/components/ReachNote";
import GapNote from "@/components/GapNote";
import { useLang } from "@/i18n";
import QuickMatch from "@/components/QuickMatch";
import { Unknown, TrustBanner, CellCodes } from "@/components/TrustTag";
import { isVerifiedCode, isUnknown, splitCell, checkOf, INCI_CHECK_META, type Removed } from "@/lib/offsets-trust";
const DOW = "Dow / DOWSIL / XIAMETER";
const cellTxt = (p: string, v?: string) => isUnknown(v) ? "?" : splitCell(v).map((c) => { const k = checkOf(p, c); return c + (isVerifiedCode(p, c) ? (k?.inci ? " [✓ INCI: " + k.inci + "]" : "") : " (unverified)"); }).join(" / ");
export default function OffsetsPage() {
  const { t: tr } = useLang();
  const [q, setQ] = useState(""); const [prod, setProd] = useState([...OFFSETS.producers.slice(0, 4), "NuSil (Avantor NuSil Technology)"]);
  const rows = useMemo(() => OFFSETS.rows.filter((r) => !q || (r.family + r.inci + r.silitex_product + r.dow_corning + Object.values(r.offsets).join(" ")).toLowerCase().includes(q.toLowerCase())), [q]);
  const toggle = (p: string) => setProd((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  const exportText = rows.map((r) => r.category_id + " " + r.family + " | Silitex: " + r.silitex_product.split(" - ")[0] + " | Dow: " + cellTxt(DOW, r.dow_corning) + " | " + prod.map((p) => p + ": " + cellTxt(p, r.offsets[p])).join(", ")).join("\n") + "\n\n" + "Silitex + NuSil columns verified; ✓ = code checked on the producer's page (" + INCI_CHECK_META.date + "); all other codes unverified (market table).";
  return (
    <div className="space-y-4">
      <H1 sub={tr("איזה מוצר Silitex מחליף את מה שהלקוח קונה היום מ-Dow / Wacker / Momentive / Evonik…")}>{tr("מקבילות עולמיות — ")}{OFFSETS.rows.length}{tr(" קטגוריות")} <span className="text-xs text-slate-400 font-normal">v6 · {OFFSETS.updated}</span></H1>
      <QuickMatch autoFocus />
      <TrustBanner text={tr("עמודת Silitex מאומתת (אתר + קטלוגים 2026) · עמודת NuSil מאומתת מול מסמכי CareSil · ✓ מאומת = הקוד נבדק אחד-אחד בדף היצרן, עם INCI אמיתי וקישור למקור · כל השאר מטבלת שוק — ⚠ לא מאומת. ? = לא ידוע. קודים שלא קיימים במציאות הוסרו מהטבלה.")} />
      <ReachNote />
      <Card className="space-y-2">
        <input className={inputCls} placeholder={tr("חיפוש: שם מוצר של מתחרה (למשל SAG 30, SILFOAM, Xiameter)…")} value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex flex-wrap gap-1">{OFFSETS.producers.map((p) => (<button key={p} onClick={() => toggle(p)} className={"text-xs px-2 py-1 rounded-full border " + (prod.includes(p) ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{p}</button>))}</div>
      </Card>
      <GapNote q={q} rows={rows.length} />
      <Card className="overflow-x-auto p-0">
        <table className="text-xs w-full">
          <thead className="bg-slate-50"><tr><th className="p-2 text-start">{tr("קט'")}</th><th className="p-2 text-start">{tr("משפחה / INCI")}</th><th className="p-2 text-start">Silitex</th><th className="p-2 text-start">Dow Corning / DOWSIL / XIAMETER</th>{prod.map((p) => <th key={p} className="p-2 text-start">{p}</th>)}<th className="p-2">{tr("אישורים")}</th></tr></thead>
          <tbody>{rows.map((r) => (<tr key={r.category_id} className="border-t align-top hover:bg-slate-50"><td className="p-2 text-slate-500">{r.category_id}</td><td className="p-2"><div className="font-medium">{r.family}</div><div className="text-slate-500">{r.inci}</div>{((r as unknown as { removed?: Removed[] }).removed || []).length > 0 && <details className="mt-1 text-[10px] text-slate-400"><summary className="cursor-pointer">{tr("הוסרו ")}{(r as unknown as { removed: Removed[] }).removed.length}{tr(" קודים (לא קיימים / משפחה שגויה)")}</summary>{(r as unknown as { removed: Removed[] }).removed.map((x) => <div key={x.producer + x.code} dir="ltr">{x.status === "fake" ? "✗" : "↪"} {x.code} ({x.producer.split(" ")[0]}){x.inci ? " = " + x.inci : ""} — {x.note}</div>)}</details>}</td><td className="p-2 font-medium text-brand-700">{r.silitex_product.split(" - ")[0]}</td><td className="p-2">{isUnknown(r.dow_corning) ? <Unknown /> : <CellCodes producer={DOW} cell={r.dow_corning} />}</td>{prod.map((p) => <td key={p} className="p-2">{isUnknown(r.offsets[p]) ? <Unknown /> : <CellCodes producer={p} cell={r.offsets[p]} />}</td>)}<td className="p-2 space-x-1 whitespace-nowrap">{/yes/i.test(r.kosher) && <Badge tone="purple">{tr("כשר")}</Badge>}{/yes/i.test(r.fda) && <Badge tone="green">FDA</Badge>}</td></tr>))}</tbody>
        </table>
      </Card>
      <ExportBar title={tr("Silitex — טבלת מקבילות")} text={exportText} />
      <Card>
        <h3 className="font-bold mb-2">{tr("קו מזון כשר / FDA")}</h3>
        <table className="text-xs w-full"><thead className="bg-slate-50"><tr><th className="p-2 text-start">{tr("מוצר")}</th><th className="p-2 text-start">{tr("הרכב")}</th><th className="p-2 text-start">{tr("כשרות")}</th><th className="p-2 text-start">FDA</th><th className="p-2 text-start">{tr("יישום")}</th><th className="p-2 text-start">{tr("מינון")}</th></tr></thead>
        <tbody>{FOOD_GRADE.map((f) => (<tr key={f.trade_name} className="border-t"><td className="p-2 font-medium">{f.trade_name}</td><td className="p-2">{f.composition}</td><td className="p-2">{f.kosher}</td><td className="p-2">{f.fda}</td><td className="p-2">{f.application}</td><td className="p-2 whitespace-nowrap">{f.dosage}</td></tr>))}</tbody></table>
      </Card>
    </div>
  );
}
