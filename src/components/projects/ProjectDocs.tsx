"use client";
// ProjectDocs.tsx (src/components/projects/ProjectDocs.tsx) · updated 10.11.2026 13:55 (Asia/Jerusalem) — v1.10.0 📷 photo / PDF of the PO / invoice → AI reads number + date → boxes filled (you press שמור) + file kept on the project · created 13:10 — v1.9.8
// Each number is saved next to the project number; a new / changed number = new version (v+1) + history line + the matching stage.
import { useState } from "react";
import { Card, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { stageIdx } from "@/config/projects";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { uploadAndRead } from "@/lib/project-upload";
import { useLang } from "@/i18n";
import type { Project, Usage } from "@/lib/types";

type Key = "quote_ref" | "po_sample" | "po_product" | "invoice";
const SLOTS: { k: Key; d: "quote_at" | "po_sample_at" | "po_product_at" | "invoice_at"; he: string; hint: string; stage: string }[] = [
  { k: "quote_ref", d: "quote_at", he: "הצעת מחיר", hint: "רק אחרי מחירון Silitex — אין מחירים לפני", stage: "offer" },
  { k: "po_sample", d: "po_sample_at", he: "PO דוגמה", hint: "מספר ההזמנה של הלקוח לדוגמה", stage: "po_sample" },
  { k: "po_product", d: "po_product_at", he: "PO מוצר", hint: "מספר ההזמנה של הלקוח למוצר", stage: "po" },
  { k: "invoice", d: "invoice_at", he: "חשבונית ספירים", hint: "חשבונית מקומית — מספר הפרויקט בשדה אסמכתא", stage: "invoice" },
];
type Props = { p: Project; onSave: (patch: Partial<Project>) => Promise<unknown>; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void; onFile: () => void };
export default function ProjectDocs({ p, onSave, spend, addSpend, onFile }: Props) {
  const { t: tr } = useLang();
  const [v, setV] = useState<Record<string, string>>(() => Object.fromEntries(SLOTS.flatMap((s) => [[s.k, p[s.k] || ""], [s.d, (p[s.d] || "").slice(0, 10)]])));
  const [busy, setBusy] = useState(""); const [reading, setReading] = useState(""); const [err, setErr] = useState(""); const [usage, setUsage] = useState<Usage | null>(null); const [read, setRead] = useState("");
  const save = async (s: (typeof SLOTS)[number]) => {
    setBusy(s.k); const patch: Partial<Project> = { [s.k]: v[s.k].trim(), [s.d]: v[s.d] || (v[s.k].trim() ? new Date().toISOString().slice(0, 10) : "") };
    if (v[s.k].trim() && stageIdx(s.stage) > stageIdx(p.stage)) patch.stage = s.stage;
    try { await onSave(patch); } catch { /* toast */ } setBusy("");
  };
  const photo = async (s: (typeof SLOTS)[number], f?: File | null) => {
    if (!f) return; setReading(s.k); setErr("");
    try {
      const r = await uploadAndRead(p.id, s.k, f); setUsage(r.usage); addSpend(r.usage.input_tokens + r.usage.output_tokens, r.usage.cost_usd); setRead(tr(s.he) + " · " + f.name + "\n" + (r.file.text || "—"));
      setV((cur) => ({ ...cur, [s.k]: r.data.number || cur[s.k], [s.d]: /^\d{4}-\d{2}-\d{2}$/.test(r.data.date || "") ? r.data.date : cur[s.d] })); onFile();
    } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
    setReading("");
  };
  const files = p.files || [];
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
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={btnPrimary} disabled={!dirty || busy === s.k} onClick={() => save(s)}>{busy === s.k ? "…" : tr("שמור")}</button>
              <label className={btnGhost + " cursor-pointer min-h-[40px] inline-flex items-center"}>{reading === s.k ? "⏳ " + tr("קורא…") : "📷 " + tr("צילום / PDF")}<input type="file" accept="image/*,application/pdf" className="hidden" disabled={!!reading} onChange={(e) => { photo(s, e.target.files?.[0]); e.target.value = ""; }} /></label>
              <span className="text-xs text-slate-500">{saved ? "✓ " + (p[s.d] ? fmtDate(p[s.d]) : "") : tr("טרם התקבל")}</span>
            </div>
          </div>); })}
      </div>
      {err && <div className="text-sm text-red-600">{err}</div>}
      {(usage || reading) && <TokenMeter usage={usage} sessionTokens={spend.tokens} sessionCost={spend.cost} busy={!!reading} />}
      {read && <div className="text-xs bg-sky-50 border border-sky-200 rounded-lg p-2 space-y-1"><div><b>🤖 {tr("נקרא מהקובץ — בדוק ולחץ שמור")}</b></div><pre className="whitespace-pre-wrap font-[inherit]" dir="auto">{read}</pre><ExportBar title={"#" + p.id + " — " + tr("קובץ שנקרא")} text={read} /></div>}
      {files.length > 0 && <div className="border-t pt-2 space-y-1"><div className="text-xs font-semibold text-slate-500">📎 {tr("קבצים בפרויקט")} ({files.length})</div>
        <ul className="text-sm space-y-1">{[...files].reverse().map((f, i) => <li key={i} className="flex flex-wrap gap-2 items-center"><span className="text-xs text-slate-500">{fmtDateTime(f.at)}</span><b>{tr(SLOTS.find((s) => s.k === f.kind)?.he || "מסמך")}</b><a href={f.url} target="_blank" rel="noreferrer" className="underline text-sky-800 truncate max-w-xs" dir="auto">{f.name}</a></li>)}</ul></div>}
    </Card>
  );
}
