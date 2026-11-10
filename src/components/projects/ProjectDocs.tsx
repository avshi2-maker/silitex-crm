"use client";
// ProjectDocs.tsx (src/components/projects/ProjectDocs.tsx) · created 10.11.2026 13:10 (Asia/Jerusalem) — v1.9.8 📁 quote · PO sample · PO product · Sapirim invoice
// Each number is saved next to the project number; a new / changed number = new version (v+1) + history line + the matching stage.
import { useState } from "react";
import { Card, inputCls, btnPrimary } from "@/components/ui";
import { stageIdx } from "@/config/projects";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Project } from "@/lib/types";

type Key = "quote_ref" | "po_sample" | "po_product" | "invoice";
const SLOTS: { k: Key; d: "quote_at" | "po_sample_at" | "po_product_at" | "invoice_at"; he: string; hint: string; stage: string }[] = [
  { k: "quote_ref", d: "quote_at", he: "הצעת מחיר", hint: "רק אחרי מחירון Silitex — אין מחירים לפני", stage: "offer" },
  { k: "po_sample", d: "po_sample_at", he: "PO דוגמה", hint: "מספר ההזמנה של הלקוח לדוגמה", stage: "po_sample" },
  { k: "po_product", d: "po_product_at", he: "PO מוצר", hint: "מספר ההזמנה של הלקוח למוצר", stage: "po" },
  { k: "invoice", d: "invoice_at", he: "חשבונית ספירים", hint: "חשבונית מקומית — מספר הפרויקט בשדה אסמכתא", stage: "invoice" },
];
export default function ProjectDocs({ p, onSave }: { p: Project; onSave: (patch: Partial<Project>) => Promise<unknown> }) {
  const { t: tr } = useLang();
  const [v, setV] = useState<Record<string, string>>(() => Object.fromEntries(SLOTS.flatMap((s) => [[s.k, p[s.k] || ""], [s.d, (p[s.d] || "").slice(0, 10)]])));
  const [busy, setBusy] = useState("");
  const save = async (s: (typeof SLOTS)[number]) => {
    setBusy(s.k); const patch: Partial<Project> = { [s.k]: v[s.k].trim(), [s.d]: v[s.d] || (v[s.k].trim() ? new Date().toISOString().slice(0, 10) : "") };
    if (v[s.k].trim() && stageIdx(s.stage) > stageIdx(p.stage)) patch.stage = s.stage;
    try { await onSave(patch); } catch { /* toast */ } setBusy("");
  };
  return (
    <Card className="space-y-3">
      <h3 className="font-bold">{tr("מסמכים — מוטבעים במספר הפרויקט")}</h3>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {SLOTS.map((s) => { const saved = p[s.k]; const dirty = (v[s.k] || "") !== (saved || "") || (v[s.d] || "") !== (p[s.d] || "").slice(0, 10); return (
          <div key={s.k} className={"border rounded-xl p-3 space-y-2 " + (saved ? "border-emerald-200 bg-emerald-50/40" : "border-dashed")}>
            <div className="flex justify-between gap-2"><b>{tr(s.he)}</b><span className="text-xs font-mono text-sky-800" dir="ltr">{saved ? saved + " · #" + p.id : "#" + p.id}</span></div>
            <div className="text-xs text-slate-500">{tr(s.hint)}</div>
            <input className={inputCls} dir="ltr" value={v[s.k]} onChange={(e) => setV({ ...v, [s.k]: e.target.value })} placeholder={tr("מספר")} aria-label={tr(s.he)} />
            <input className={inputCls} type="date" value={v[s.d]} onChange={(e) => setV({ ...v, [s.d]: e.target.value })} aria-label={tr("תאריך")} />
            <div className="flex items-center gap-2"><button type="button" className={btnPrimary} disabled={!dirty || busy === s.k} onClick={() => save(s)}>{busy === s.k ? "…" : tr("שמור")}</button>
              <span className="text-xs text-slate-500">{saved ? "✓ " + (p[s.d] ? fmtDate(p[s.d]) : "") : tr("טרם התקבל")}</span></div>
          </div>); })}
      </div>
    </Card>
  );
}
