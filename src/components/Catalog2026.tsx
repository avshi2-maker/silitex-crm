"use client";
// Catalog2026.tsx (src/components/Catalog2026.tsx) · updated 13.10.2026 06:10 (Asia/Jerusalem) — the five Silitex sector catalogues (PDF, received from Federica 13/10/2026) parsed into data/catalog_2026.json: 292 rows, filter by sector / section / text, open the PDF, export.
import { useMemo, useState } from "react";
import { Card, Badge, inputCls, btnGhost } from "@/components/ui";
import { useLang } from "@/i18n";
import ExportBar from "@/components/ExportBar";
import { CAT26, SECTORS, PDFS } from "@/lib/catalog";
const SECTOR_HE: Record<string, string> = { Cosmetics: "קוסמטיקה", Detergency: "דטרגנטים וטיפוח בית/רכב", "Food & Agri": "מזון, משקאות וחקלאות", "Paint & Coating": "צבעים, ציפויים ובנייה", "Water Treatment": "טיפול במים" };
export default function Catalog2026() {
  const { t: tr } = useLang();
  const [q, setQ] = useState(""); const [sector, setSector] = useState(""); const [section, setSection] = useState("");
  const sections = useMemo(() => Array.from(new Set(CAT26.filter((r) => !sector || r.sector === sector).map((r) => r.section))), [sector]);
  const list = useMemo(() => CAT26.filter((r) => (!sector || r.sector === sector) && (!section || r.section === section) && (!q || Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase()))), [q, sector, section]);
  const uniq = new Set(CAT26.map((r) => r.product.toUpperCase())).size;
  const text = list.map((r) => [r.product + (r.code ? " [" + r.code + "]" : ""), r.sector + " · " + r.section, r.inci && "INCI/active: " + r.inci, r.active_pct && "Active: " + r.active_pct + "%", r.description, r.application && "Use: " + r.application, r.dosage && "Dosage: " + r.dosage, r.compliance && "Compliance: " + r.compliance, r.notes].filter(Boolean).join("\n")).join("\n\n");
  return (
    <Card className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <b>📕 {tr("קטלוגים סקטוריאליים 2026 (מפדריקה, 13/10/2026)")}</b>
        <Badge tone="green">{uniq} {tr("מוצרים")}</Badge><Badge tone="blue">{CAT26.length} {tr("שורות")}</Badge><Badge tone="slate">5 PDF</Badge>
        <span className="text-xs text-slate-500">{tr("מקור האמת — מחליף את סריקת האתר (האתר לא מעודכן, לדברי Silitex)")}</span>
      </div>
      <div className="flex flex-wrap gap-1">{SECTORS.map((s) => <button key={s} onClick={() => { setSector(sector === s ? "" : s); setSection(""); }} className={"px-2 py-1 rounded-lg border text-xs " + (sector === s ? "bg-brand-500 text-white" : "bg-white")}>{tr(SECTOR_HE[s] || s)} ({CAT26.filter((r) => r.sector === s).length})</button>)}{sector && PDFS[sector] && <a href={PDFS[sector]} target="_blank" rel="noreferrer" className={btnGhost + " text-xs"}>📄 PDF</a>}</div>
      <div className="grid md:grid-cols-3 gap-2">
        <input className={inputCls + " md:col-span-2"} placeholder={tr("חיפוש: שם, INCI, יישום, קוד…")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls} value={section} onChange={(e) => setSection(e.target.value)}><option value="">{tr("כל המדורים")}</option>{sections.map((s) => <option key={s} value={s}>{s}</option>)}</select>
      </div>
      <div className="overflow-auto max-h-[65vh]"><table className="w-full text-xs"><thead className="bg-slate-50 text-slate-500 sticky top-0"><tr><th className="p-2 text-start">{tr("מוצר")}</th><th className="p-2 text-start">{tr("מדור")}</th><th className="p-2 text-start">INCI / {tr("חומר פעיל")}</th><th className="p-2 text-start">%</th><th className="p-2 text-start">{tr("תיאור")}</th><th className="p-2 text-start">{tr("יישום")}</th><th className="p-2 text-start">{tr("מינון / אישורים")}</th></tr></thead>
        <tbody>{list.map((r) => (<tr key={r.id} className="border-t align-top"><td className="p-2 font-medium whitespace-nowrap" dir="ltr">{r.product}{r.code && <div className="text-[10px] text-slate-400">{r.code}</div>}<div className="text-[10px] text-slate-400">{tr(SECTOR_HE[r.sector] || r.sector)}</div></td><td className="p-2 text-slate-500">{r.section}</td><td className="p-2" dir="ltr">{r.inci}</td><td className="p-2">{r.active_pct}</td><td className="p-2">{r.description}</td><td className="p-2">{r.application}</td><td className="p-2 text-slate-600">{[r.dosage, r.compliance, r.notes].filter(Boolean).join(" · ")}</td></tr>))}</tbody></table></div>
      <div className="text-[11px] text-slate-400">{list.length} / {CAT26.length} · {tr("חילוץ אוטומטי מ-PDF — ערכים שלא ברורים בטבלה המקורית מסומנים בהערות.")}</div>
      <ExportBar title={"Silitex catalogue 2026" + (sector ? " — " + sector : "")} text={text} filename={"silitex_catalog_2026" + (sector ? "_" + sector.replace(/\W+/g, "_") : "")} />
    </Card>
  );
}
