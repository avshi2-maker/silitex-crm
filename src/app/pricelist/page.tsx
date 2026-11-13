"use client";
// page.tsx (src/app/pricelist/page.tsx) · created 13.11.2026 13:35 (Asia/Jerusalem) — v1.11.0 💶 Silitex price list: every catalogue name (239) + quoted extras · INCI · CAS · packs × €/kg · RDA · TDS / MSDS · PO ref · price age · landed cost · 📥 AI quote reader · Excel + export bar
import { useEffect, useMemo, useState } from "react";
import { Card, H1, Badge, Stat, inputCls, btnGhost } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import PriceEditor from "@/components/pricelist/PriceEditor";
import PasteQuote from "@/components/pricelist/PasteQuote";
import { mergeList, emptyRow, bestPack, ageOf, AGE_TONE, AGE_HE, eur, poLink, casOk, CATALOG_NAMES, type ListRow, type PriceRow } from "@/lib/pricelist";
import { emitSave } from "@/lib/save-signal";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";

type Filter = "" | "priced" | "unpriced" | "stale" | "nocas" | "nodocs" | "extra";
export default function PriceListPage() {
  const { t: tr } = useLang();
  const [db, setDb] = useState<PriceRow[]>([]); const [missing, setMissing] = useState(false); const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(""); const [sector, setSector] = useState(""); const [f, setF] = useState<Filter>("");
  const [sel, setSel] = useState<ListRow | null>(null); const [paste, setPaste] = useState(false);
  const load = async () => { setLoading(true); try { const j = await (await fetch("/api/pricelist")).json(); setDb(j.rows || []); setMissing(!!j.missing); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);
  const all = useMemo(() => mergeList(db), [db]);
  const sectors = useMemo(() => Array.from(new Set(all.flatMap((r) => r.sector.split(" · ")).filter(Boolean))).sort(), [all]);
  const list = useMemo(() => all.filter((r) => {
    if (sector && !r.sector.includes(sector)) return false;
    if (f === "priced" && !r.packs.length) return false;
    if (f === "unpriced" && r.packs.length) return false;
    if (f === "stale" && !(r.packs.length && ["aging", "stale"].includes(ageOf(bestPack(r))))) return false;
    if (f === "nocas" && r.cas) return false;
    if (f === "nodocs" && r.tds_url && r.sds_url) return false;
    if (f === "extra" && r.inCatalog) return false;
    if (q) { const h = [r.product, r.code, r.inci, r.cas, r.countertype, r.po_ref, r.notes, r.sector].join(" ").toLowerCase(); if (!h.includes(q.toLowerCase())) return false; }
    return true;
  }), [all, q, sector, f]);
  const priced = all.filter((r) => r.packs.length).length;
  const save = async (rows: Partial<PriceRow>[]) => {
    const r = await fetch("/api/pricelist", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ rows }) });
    const j = await r.json(); if (!r.ok) { emitSave("err", j.error || ""); return false; }
    emitSave("ok"); await load(); return true;
  };
  const xlsx = async () => {
    const X = await import("xlsx");
    const rows = list.flatMap((r) => (r.packs.length ? r.packs : [null]).map((p) => ({ "Product": r.product, "Code": r.code, "Sector": r.sector, "INCI": r.inci, "CAS": r.cas, "Pack": p?.label || "", "kg": p?.kg || "", "EUR/kg": p?.eur_kg || "", "Incoterm": p?.incoterm || "", "Quoted": p?.quoted_at ? fmtDate(p.quoted_at) : "", "RDA": r.rda === null ? "?" : r.rda ? "YES" : "NO", "TDS": r.tds_url, "MSDS": r.sds_url, "PO ref": r.po_ref, "Countertype": r.countertype, "In catalogue 2026": r.inCatalog ? "yes" : "NO", "Notes": r.notes })));
    const ws = X.utils.json_to_sheet(rows); ws["!cols"] = [18, 8, 18, 40, 14, 18, 6, 8, 8, 11, 5, 30, 30, 12, 22, 8, 50].map((w) => ({ wch: w }));
    const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, "Silitex price list"); const d = new Date();
    X.writeFile(wb, "Silitex_Price_List_" + String(d.getDate()).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0") + d.getFullYear() + ".xlsx");
  };
  const text = list.filter((r) => r.packs.length).map((r) => r.product + (r.code ? " [" + r.code + "]" : "") + " — " + r.packs.map((p) => p.label + " " + eur(p.eur_kg) + "/kg " + (p.incoterm || "")).join(" · ") + (r.inci ? " · INCI: " + r.inci : "")).join("\n");
  const fBtn = (k: Filter, label: string) => <button key={k} onClick={() => setF(f === k ? "" : k)} className={"px-2.5 py-1 rounded-full border text-xs " + (f === k ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{label}</button>;
  return (
    <div className="space-y-4">
      <H1 sub={tr("כל שמות Silitex מקטלוגי 2026 · INCI · CAS · אריזות ומחיר €/ק״ג · RDA · TDS / MSDS · אסמכתא להזמנת רכש")}>{tr("💶 מחירון Silitex")}</H1>
      {missing && <Card className="border-amber-300 bg-amber-50 text-sm">{tr("⚠ טבלת המחירון עדיין לא קיימת ב-Supabase — צריך להריץ את supabase/price_list.sql פעם אחת. עד אז הרשימה מוצגת מהקטלוג, בלי שמירה.")}</Card>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label={tr("מוצרים ברשימה")} value={all.length} hint={CATALOG_NAMES + tr(" מהקטלוג")} />
        <Stat label={tr("עם מחיר")} value={priced} hint={Math.round((priced / Math.max(1, all.length)) * 100) + "%"} />
        <Stat label={tr("עם CAS")} value={all.filter((r) => r.cas).length} />
        <Stat label={tr("עם TDS + MSDS")} value={all.filter((r) => r.tds_url && r.sds_url).length} />
      </div>
      <Card className="space-y-2">
        <div className="grid md:grid-cols-[1fr_200px_auto_auto_auto] gap-2">
          <input className={inputCls} placeholder={tr("חיפוש: שם, קוד PO, INCI, CAS, מקביל, אסמכתא…")} value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={inputCls} value={sector} onChange={(e) => setSector(e.target.value)}><option value="">{tr("כל הענפים")}</option>{sectors.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <button className={btnGhost} onClick={() => setPaste(!paste)}>{tr("📥 קליטת הצעת מחיר (AI)")}</button>
          <button className={btnGhost} onClick={() => setSel({ ...emptyRow(""), inCatalog: false, catCode: "", catInci: "", catalogPdf: "", inDb: false })}>{tr("➕ מוצר חדש")}</button>
          <button className={btnGhost} onClick={xlsx}>{tr("⬇ Excel")}</button>
        </div>
        <div className="flex flex-wrap gap-1.5">{fBtn("priced", tr("💶 עם מחיר"))}{fBtn("unpriced", tr("ללא מחיר"))}{fBtn("stale", tr("⏳ מחיר מתיישן"))}{fBtn("nocas", tr("חסר CAS"))}{fBtn("nodocs", tr("חסר TDS/MSDS"))}{fBtn("extra", tr("לא בקטלוג 2026"))}<span className="text-xs text-slate-500 self-center ms-2">{list.length} / {all.length}</span></div>
      </Card>
      {paste && <PasteQuote all={all} onApply={async (rows) => { const ok = await save(rows); if (ok) setPaste(false); return ok; }} />}
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 sticky top-0"><tr><th className="p-2 text-start">{tr("מוצר")}</th><th className="p-2 text-start">INCI</th><th className="p-2 text-start">CAS</th><th className="p-2 text-start">{tr("אריזה · €/ק״ג")}</th><th className="p-2">RDA</th><th className="p-2">TDS</th><th className="p-2">MSDS</th><th className="p-2 text-start">{tr("אסמכתא PO")}</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="p-4 text-center text-slate-400">{tr("טוען…")}</td></tr>}
            {list.map((r) => <Row key={r.id} r={r} onOpen={() => setSel(r)} />)}
          </tbody>
        </table>
      </Card>
      <ExportBar title={tr("מחירון Silitex — מוצרים עם מחיר")} text={text || tr("אין עדיין מחירים")} filename="Silitex_price_list" />
      {sel && <PriceEditor row={sel} onClose={() => setSel(null)} onSave={async (row) => { const ok = await save([row]); if (ok) setSel(null); return ok; }} />}
    </div>
  );
}

function Row({ r, onOpen }: { r: ListRow; onOpen: () => void }) {
  const { t: tr } = useLang();
  const age = ageOf(bestPack(r)); const po = poLink(r.po_ref);
  const codeClash = r.inCatalog && r.catCode && r.code && r.code !== r.catCode;
  const doc = (url: string, fallback: string) => url ? <a href={url} target="_blank" rel="noreferrer" className="text-brand-600" title={url}>📄</a> : fallback ? <a href={fallback} target="_blank" rel="noreferrer" className="text-slate-300" title={tr("אין קובץ — קטלוג הענף")}>📘</a> : <span className="text-slate-300">—</span>;
  return (
    <tr className="border-t hover:bg-brand-50/40 cursor-pointer align-top" onClick={onOpen}>
      <td className="p-2"><div className="font-semibold">{r.product}</div><div className="text-[11px] text-slate-500">{r.code}{codeClash && <span className="text-amber-700" title={tr("קוד בקטלוג: ") + r.catCode}> ⚠ {r.catCode}</span>} · {r.sector}</div>{!r.inCatalog && <Badge tone="amber">{tr("לא בקטלוג 2026")}</Badge>}{r.countertype && <div className="text-[11px] text-slate-500">{tr("מקביל ל-")}{r.countertype}</div>}</td>
      <td className="p-2 text-xs max-w-[240px]">{r.inci || <span className="text-slate-300">—</span>}</td>
      <td className="p-2 text-xs font-mono" dir="ltr">{r.cas ? <span className={casOk(r.cas) ? "" : "text-red-600"} title={casOk(r.cas) ? "" : tr("ספרת ביקורת CAS שגויה")}>{r.cas}</span> : <span className="text-slate-300">—</span>}</td>
      <td className="p-2">{r.packs.length ? <div className="space-y-0.5">{r.packs.map((p, i) => <div key={i} className="text-xs whitespace-nowrap"><b>{eur(p.eur_kg)}</b>/kg · {p.label}{p.incoterm ? " · " + p.incoterm : ""}</div>)}<Badge tone={AGE_TONE[age]}>{AGE_HE[age]}{bestPack(r)?.quoted_at ? " · " + fmtDate(bestPack(r)?.quoted_at) : ""}</Badge></div> : <span className="text-slate-300 text-xs">{tr("אין מחיר")}</span>}</td>
      <td className="p-2 text-center">{r.rda === null ? <span className="text-slate-300">?</span> : r.rda ? <Badge tone="green">{tr("כן")}</Badge> : <Badge tone="red">{tr("לא")}</Badge>}</td>
      <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>{doc(r.tds_url, r.catalogPdf)}</td>
      <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>{doc(r.sds_url, "")}</td>
      <td className="p-2 text-xs" onClick={(e) => po && e.stopPropagation()}>{r.po_ref ? (po ? <a href={po} className="text-brand-600">📁 {r.po_ref}</a> : r.po_ref) : <span className="text-slate-300">—</span>}</td>
    </tr>
  );
}
