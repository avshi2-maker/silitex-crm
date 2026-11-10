"use client";
// ProjectHead.tsx (src/components/projects/ProjectHead.tsx) · created 10.11.2026 13:00 (Asia/Jerusalem) — v1.9.8 📁 project number + short description + customer facts
import { useState } from "react";
import Link from "next/link";
import { Card, Badge, inputCls, btnGhost, btnPrimary } from "@/components/ui";
import { refLabel, stageText } from "@/lib/projects";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Project, Lead } from "@/lib/types";

type Props = { p: Project; lead?: Lead; onSave: (patch: Partial<Project>, bump?: string) => Promise<unknown> };
export default function ProjectHead({ p, lead, onSave }: Props) {
  const { t: tr } = useLang();
  const [desc, setDesc] = useState(p.description); const [note, setNote] = useState(""); const [copied, setCopied] = useState(false); const [busy, setBusy] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(refLabel(p)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {}); };
  const save = async (bump?: string) => { setBusy(true); try { await onSave({ description: desc }, bump); setNote(""); } catch { /* toast shows */ } setBusy(false); };
  const row = (k: string, v: React.ReactNode) => <div className="flex justify-between gap-3 text-sm"><span className="text-slate-500">{tr(k)}</span><span className="text-end">{v}</span></div>;
  return (
    <Card className="flex flex-wrap gap-6 justify-between">
      <div className="flex-1 min-w-[300px] space-y-2">
        <div className="text-xs text-slate-500 font-semibold">{tr("מספר פרויקט — נפתח")} {fmtDateTime(p.opened_at)} · {p.source.startsWith("auto") ? tr("אוטומטית") : tr("ידנית")}</div>
        <div className="flex flex-wrap items-center gap-2">
          <span dir="ltr" className="font-mono font-bold text-2xl bg-ink-900 text-white rounded-xl px-4 py-2">{refLabel(p)}</span>
          <button type="button" className={btnGhost + " min-h-[44px]"} onClick={copy}>{copied ? "✓ " + tr("הועתק") : tr("העתק")}</button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="bg-slate-100 rounded px-2 py-1"><b dir="ltr">{p.id}</b> {tr("מספר רץ ספירים — לא משתנה")}</span>
          <span className="bg-slate-100 rounded px-2 py-1"><b>{fmtDate(p.opened_at)}</b> {tr("תאריך פתיחה")}</span>
          <span className="bg-slate-100 rounded px-2 py-1"><b>v{p.version}</b> {tr("עולה בכל הצעה / PO / חשבונית / שינוי מפרט")}</span>
          <span className="bg-sky-50 text-sky-800 rounded px-2 py-1">👁 {tr("אותו מספר אצל הלקוח, Silitex וספירים")}</span>
        </div>
        <label className="block text-xs font-semibold text-slate-500 mt-2" htmlFor="pdesc">{tr("תיאור קצר")}</label>
        <input id="pdesc" className={inputCls + " text-base"} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={tr("למשל: ריכוך וברק לזנבות צבי — 6 קודים")} />
        <div className="flex flex-wrap gap-2 items-center">
          <button type="button" className={btnPrimary} disabled={busy || desc === p.description} onClick={() => save()}>{tr("שמור תיאור")}</button>
          <input className={inputCls + " flex-1 min-w-[200px]"} value={note} onChange={(e) => setNote(e.target.value)} placeholder={tr("שינוי מפרט / בקשה חדשה מאותו לקוח → גרסה חדשה")} />
          <button type="button" className={btnGhost + " min-h-[40px]"} disabled={busy || !note.trim()} onClick={() => save(note)}>⬆ v{p.version + 1}</button>
        </div>
        {p.request && <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-2" dir="auto"><b>{tr("הבקשה")}:</b> {p.request}</div>}
      </div>
      <div className="w-72 max-w-full space-y-2">
        {row("לקוח", <Link href={"/leads/" + p.lead_id} className="underline">{p.lead_name}</Link>)}
        {lead?.contact_name && row("איש קשר", lead.contact_name)}
        {lead?.contact_phone && row("נייד", <span dir="ltr">{lead.contact_phone}</span>)}
        {lead?.contact_email && row("מייל", <span dir="ltr" className="text-xs">{lead.contact_email}</span>)}
        {lead?.industry && row("ענף", [lead.industry, lead.sub_industry].filter(Boolean).join(" — "))}
        {row("שלב", <Badge tone={p.stage === "silitex" ? "amber" : "blue"}>{tr(stageText(p.stage))}</Badge>)}
        {row("עדכון אחרון", fmtDateTime(p.updated_at))}
      </div>
    </Card>
  );
}
