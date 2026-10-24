"use client";
// RadarTable.tsx (src/components/radar/RadarTable.tsx) · created 24.10.2026 06:00 (Asia/Jerusalem) — 🛰️ gap-radar rows: industry · producers · silicone functions · Silitex fit · our list (✓ match + customers / ⚠ gap) · Israel note · actions (➕ add to the CRM industry list, 🧲 search now).
import Link from "next/link";
import { useLang } from "@/i18n";
import { Badge, btnGhost, btnPrimary } from "@/components/ui";
import type { RadarRow } from "@/lib/radar";

const FIT: Record<RadarRow["silitex_fit"], { icon: string; he: string; tone: string }> = { yes: { icon: "✅", he: "מתאים", tone: "green" }, partly: { icon: "🟡", he: "חלקי", tone: "amber" }, no: { icon: "❌", he: "לא שלנו", tone: "slate" } };

export default function RadarTable({ rows, inList, count, added, onAdd }: { rows: RadarRow[]; inList: (r: RadarRow) => string; count: (ind: string) => number; added: Record<string, boolean>; onAdd: (r: RadarRow) => void }) {
  const { t: tr } = useLang();
  return (
    <div className="overflow-x-auto"><table className="w-full text-xs">
      <thead className="bg-slate-50"><tr><th className="p-1 text-start">{tr("תעשייה")}</th><th className="p-1 text-start">{tr("יצרנים")}</th><th className="p-1 text-start">{tr("שימושי סיליקון")}</th><th className="p-1">{tr("התאמה ל-Silitex")}</th><th className="p-1 text-start">{tr("ברשימה שלנו")}</th><th className="p-1 text-start">{tr("בישראל")}</th><th className="p-1"></th></tr></thead>
      <tbody>{rows.map((r) => {
        const m = inList(r); const f = FIT[r.silitex_fit]; const gap = !m && r.silitex_fit !== "no"; const n = m ? count(m) : 0;
        return (
          <tr key={r.industry} className={"border-t align-top " + (gap ? "bg-amber-50/60" : r.silitex_fit === "no" ? "opacity-50" : "")}>
            <td className="p-1 font-medium" dir="ltr">{r.industry}{r.sources.length > 0 && <div className="flex gap-1 mt-0.5">{r.sources.map((u, i) => <a key={u} href={u} target="_blank" rel="noreferrer" className="text-[10px] text-brand-600 underline">{tr("מקור")} {i + 1}</a>)}</div>}</td>
            <td className="p-1"><div className="flex flex-wrap gap-0.5">{r.producers.map((p) => <Badge key={p}>{p}</Badge>)}</div></td>
            <td className="p-1 max-w-[16rem]" dir="ltr">{r.functions}</td>
            <td className="p-1 text-center whitespace-nowrap"><Badge tone={f.tone}>{f.icon} {tr(f.he)}</Badge></td>
            <td className="p-1 whitespace-nowrap">{m ? <span dir="ltr">✓ {m} <span className="text-slate-500">({n} {tr("לקוחות")})</span></span> : r.silitex_fit === "no" ? "—" : <Badge tone="amber">⚠ {tr("פער")}</Badge>}</td>
            <td className="p-1 max-w-[14rem]" dir="ltr">{r.israel}</td>
            <td className="p-1 whitespace-nowrap">
              {gap && !added[r.industry] && <button className={btnPrimary + " !py-1 !px-2 text-xs"} onClick={() => onAdd(r)}>➕ {tr("הוסף לרשימה")}</button>}
              {gap && added[r.industry] && <Badge tone="green">✓ {tr("נוסף")}</Badge>}
              {r.silitex_fit !== "no" && <Link className={btnGhost + " !py-1 !px-2 text-xs ms-1"} href={"/leads/prompt?industry=" + encodeURIComponent(m || r.industry) + "&notes=" + encodeURIComponent("Silicone functions: " + r.functions + (r.israel ? "\nIsrael: " + r.israel : ""))}>🧲 {tr("חפש")}</Link>}
            </td>
          </tr>);
      })}</tbody></table></div>
  );
}
