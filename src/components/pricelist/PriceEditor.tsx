"use client";
// PriceEditor.tsx (src/components/pricelist/PriceEditor.tsx) · created 13.11.2026 13:40 (Asia/Jerusalem) — v1.11.0 💶 one product in the Silitex price list: INCI · CAS (check digit) · RDA · packs × €/kg · TDS / MSDS links · PO ref · notes · price history · landed-cost calculator · export bar
import { useState } from "react";
import { Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import Landed from "./Landed";
import { casOk, eur, poLink, type ListRow, type Pack, type PriceRow } from "@/lib/pricelist";
import { fmtDate, todayIso } from "@/lib/format";
import { useLang } from "@/i18n";

const PACKS = ["1 kg sample", "5 kg canister", "25 kg canister", "120 kg drum", "200 kg drum", "1000 kg IBC"];
export default function PriceEditor({ row, onClose, onSave }: { row: ListRow; onClose: () => void; onSave: (r: Partial<PriceRow>) => Promise<boolean> }) {
  const { t: tr } = useLang();
  const [r, setR] = useState<PriceRow>({ ...row, packs: row.packs.map((p) => ({ ...p })) });
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof PriceRow>(k: K, v: PriceRow[K]) => setR((o) => ({ ...o, [k]: v }));
  const setPack = (i: number, patch: Partial<Pack>) => set("packs", r.packs.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const addPack = () => set("packs", [...r.packs, { label: "25 kg canister", kg: 25, eur_kg: 0, incoterm: "EXW", quoted_at: todayIso(), source: "" }]);
  const isNew = !row.product;
  const go = async () => { if (!r.product.trim()) return; setBusy(true); await onSave({ ...r, packs: r.packs.filter((p) => p.eur_kg > 0) }); setBusy(false); };
  const lbl = "text-xs text-slate-500 mb-0.5 block";
  const card = [r.product + (r.code ? " [" + r.code + "]" : ""), "INCI: " + (r.inci || "—"), "CAS: " + (r.cas || "—"), ...r.packs.map((p) => p.label + ": " + eur(p.eur_kg) + "/kg " + (p.incoterm || "") + (p.quoted_at ? " (" + fmtDate(p.quoted_at) + ")" : "")), "RDA: " + (r.rda === null ? "?" : r.rda ? "YES" : "NO"), r.tds_url && "TDS: " + r.tds_url, r.sds_url && "MSDS: " + r.sds_url, r.po_ref && "PO ref: " + r.po_ref, r.countertype && "Countertype: " + r.countertype, r.notes].filter(Boolean).join("\n");
  const po = poLink(r.po_ref);
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-start" onClick={onClose}>
      <div className="bg-white w-full max-w-xl h-full overflow-y-auto p-5 space-y-3 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start"><div><div className="text-lg font-bold">{isNew ? tr("➕ מוצר חדש במחירון") : r.product}</div><div className="text-xs text-slate-500">{r.sector}{!row.inCatalog && !isNew && <> · <Badge tone="amber">{tr("לא בקטלוג 2026")}</Badge></>}</div></div><button className={btnGhost} onClick={onClose}>✕</button></div>
        <div className="grid grid-cols-2 gap-2">
          <label><span className={lbl}>{tr("שם מוצר Silitex")}</span><input className={inputCls} dir="ltr" value={r.product} disabled={!isNew} onChange={(e) => set("product", e.target.value)} /></label>
          <label><span className={lbl}>{tr("קוד (PO###)")}</span><input className={inputCls} dir="ltr" value={r.code} onChange={(e) => set("code", e.target.value)} />{row.catCode && r.code && r.code !== row.catCode && <span className="text-[11px] text-amber-700">{tr("⚠ בקטלוג 2026: ")}{row.catCode}</span>}</label>
          <label className="col-span-2"><span className={lbl}>INCI</span><input className={inputCls} dir="ltr" value={r.inci} onChange={(e) => set("inci", e.target.value)} />{row.catInci && r.inci !== row.catInci && <span className="text-[11px] text-slate-500">{tr("בקטלוג: ")}{row.catInci}</span>}</label>
          <label><span className={lbl}>CAS</span><input className={inputCls + (r.cas && !casOk(r.cas) ? " border-red-400" : "")} dir="ltr" placeholder="63148-62-9" value={r.cas} onChange={(e) => set("cas", e.target.value)} />{r.cas && <span className={"text-[11px] " + (casOk(r.cas) ? "text-emerald-700" : "text-red-600")}>{casOk(r.cas) ? tr("✓ ספרת ביקורת תקינה") : tr("✗ ספרת ביקורת שגויה")}</span>}</label>
          <div><span className={lbl}>RDA</span><div className="flex gap-1">{([[true, tr("כן")], [false, tr("לא")], [null, "?"]] as [boolean | null, string][]).map(([v, l]) => <button key={String(v)} onClick={() => set("rda", v)} className={"flex-1 py-2 rounded-lg border text-sm " + (r.rda === v ? (v === true ? "bg-emerald-500 text-white" : v === false ? "bg-red-500 text-white" : "bg-slate-500 text-white") : "bg-white")}>{l}</button>)}</div></div>
          <label className="col-span-2"><span className={lbl}>{tr("מקביל ל- (מוצר מתחרה)")}</span><input className={inputCls} dir="ltr" value={r.countertype} onChange={(e) => set("countertype", e.target.value)} /></label>
        </div>
        <div className="border rounded-xl p-3 space-y-2">
          <div className="flex justify-between items-center"><div className="font-medium text-sm">{tr("אריזות ומחיר €/ק״ג")}</div><button className={btnGhost} onClick={addPack}>{tr("➕ אריזה")}</button></div>
          {r.packs.length === 0 && <div className="text-xs text-slate-400">{tr("אין עדיין מחיר — ➕ אריזה, או 📥 קליטת הצעת מחיר")}</div>}
          {r.packs.map((p, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px_80px_70px_110px_28px] gap-1 items-center">
              <input className={inputCls} dir="ltr" list="pl-packs" value={p.label} onChange={(e) => { const kg = Number((e.target.value.match(/[\d.]+/) || ["0"])[0]); setPack(i, { label: e.target.value, kg: kg || p.kg }); }} />
              <input className={inputCls} dir="ltr" type="number" title="kg" value={p.kg} onChange={(e) => setPack(i, { kg: Number(e.target.value) })} />
              <input className={inputCls + " font-bold"} dir="ltr" type="number" step="0.01" title="€/kg" value={p.eur_kg} onChange={(e) => setPack(i, { eur_kg: Number(e.target.value) })} />
              <input className={inputCls} dir="ltr" title="Incoterm" value={p.incoterm || ""} onChange={(e) => setPack(i, { incoterm: e.target.value })} />
              <input className={inputCls} type="date" title={tr("תאריך הצעה")} value={p.quoted_at || ""} onChange={(e) => setPack(i, { quoted_at: e.target.value })} />
              <button className="text-red-500" title={tr("הסרת אריזה")} onClick={() => set("packs", r.packs.filter((_, j) => j !== i))}>✕</button>
              {p.kg > 0 && p.eur_kg > 0 && <div className="col-span-6 text-[11px] text-slate-500">{tr("לאריזה: ")}{eur(p.kg * p.eur_kg)}{p.source ? " · " + p.source : ""}</div>}
            </div>
          ))}
          <datalist id="pl-packs">{PACKS.map((x) => <option key={x} value={x} />)}</datalist>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label><span className={lbl}>{tr("קישור TDS (דף נתונים)")}</span><input className={inputCls} dir="ltr" placeholder="https://" value={r.tds_url} onChange={(e) => set("tds_url", e.target.value)} />{!r.tds_url && row.catalogPdf && <a className="text-[11px] text-brand-600" href={row.catalogPdf} target="_blank" rel="noreferrer">{tr("📘 בינתיים: קטלוג הענף")}</a>}</label>
          <label><span className={lbl}>{tr("קישור MSDS (גיליון בטיחות)")}</span><input className={inputCls} dir="ltr" placeholder="https://" value={r.sds_url} onChange={(e) => set("sds_url", e.target.value)} /></label>
          <label className="col-span-2"><span className={lbl}>{tr("אסמכתא להזמנת רכש (PO / #SPR-0000)")}</span><input className={inputCls} dir="ltr" value={r.po_ref} onChange={(e) => set("po_ref", e.target.value)} />{po && <a className="text-[11px] text-brand-600" href={po}>{tr("📁 פתיחת כרטיס הפרויקט")}</a>}</label>
          <label className="col-span-2"><span className={lbl}>{tr("הערות")}</span><textarea className={inputCls} rows={3} value={r.notes} onChange={(e) => set("notes", e.target.value)} /></label>
        </div>
        {r.packs.some((p) => p.eur_kg > 0) && <Landed eurKg={Math.min(...r.packs.filter((p) => p.eur_kg > 0).map((p) => p.eur_kg))} />}
        {row.history.length > 0 && <div className="border rounded-xl p-3"><div className="font-medium text-sm mb-1">{tr("📈 היסטוריית מחירים")}</div>{[...row.history].reverse().map((h, i) => <div key={i} className="text-xs flex justify-between"><span>{fmtDate(h.at)} · {h.label}</span><b dir="ltr">{eur(h.eur_kg)}/kg</b></div>)}</div>}
        <div className="flex gap-2 sticky bottom-0 bg-white py-2"><button className={btnPrimary} disabled={busy || !r.product.trim()} onClick={go}>{busy ? tr("שומר…") : tr("💾 שמירה")}</button><button className={btnGhost} onClick={onClose}>{tr("ביטול")}</button></div>
        {!isNew && <ExportBar title={"Silitex " + r.product + tr(" — כרטיס מחיר")} text={card} />}
      </div>
    </div>
  );
}
