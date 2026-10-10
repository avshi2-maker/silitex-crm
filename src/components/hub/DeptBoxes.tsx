"use client";
// DeptBoxes.tsx (src/components/hub/DeptBoxes.tsx) · updated 10.10.2026 05:50 (Asia/Jerusalem) — Silitex department boxes: contacts (names after contract), open/waiting counts, late flag; click = filter
import { useState } from "react";
import { DEPTS, SILITEX } from "@/config/hub";
import { Badge, inputCls, btnGhost } from "@/components/ui";
import { isLate } from "@/lib/hub";
import { uid } from "@/lib/format";
import { useLang } from "@/i18n";
import type { SilitexContact, Thread } from "@/lib/types";
type Props = { contacts: SilitexContact[]; threads: Thread[]; sel: string; onSel: (k: string) => void; onSave: (c: SilitexContact) => void; onRemove: (id: string) => void };
export default function DeptBoxes({ contacts, threads, sel, onSel, onSave, onRemove }: Props) {
  const { t: tr } = useLang(); const [edit, setEdit] = useState<SilitexContact | null>(null);
  return (
    <div className="grid md:grid-cols-3 gap-2">
      {DEPTS.map((d) => { const ths = threads.filter((t) => t.dept === d.key); const open = ths.filter((t) => t.status !== "closed"); const late = ths.filter(isLate).length; const people = contacts.filter((c) => c.dept === d.key); return (
        <div key={d.key} className={"border rounded-xl p-3 bg-white cursor-pointer " + (sel === d.key ? "ring-2 ring-brand-500" : "hover:bg-slate-50")} onClick={() => onSel(sel === d.key ? "" : d.key)}>
          <div className="flex items-center justify-between"><div className="font-bold text-sm">{d.icon} {tr(d.he)}</div><div className="flex gap-1">{late > 0 && <Badge tone="red">⏰ {late}</Badge>}<Badge tone={open.length ? "blue" : "slate"}>{open.length}/{ths.length}</Badge></div></div>
          <div className="text-[11px] text-slate-400" dir="ltr">{d.en} · {d.phone}</div>
          <div className="text-xs text-slate-500 mt-1">{d.notes}</div>
          <ul className="mt-2 text-xs space-y-0.5">{people.map((c) => (<li key={c.id} className="flex items-center gap-1"><span className="font-medium">{c.name}</span><span className="text-slate-400">{c.role}</span><a className="text-brand-600" href={"mailto:" + c.email} onClick={(e) => e.stopPropagation()}>{c.email}</a>{c.mobile && <span className="text-slate-400">· {c.mobile}</span>}<button className="ms-auto text-slate-400" onClick={(e) => { e.stopPropagation(); setEdit(c); }}>✏️</button></li>))}{people.length === 0 && <li className="text-slate-400">{tr("שמות יתווספו לאחר החוזה · ")}{SILITEX.info}</li>}</ul>
          <button className={btnGhost + " mt-2 text-xs"} onClick={(e) => { e.stopPropagation(); setEdit({ id: uid("ct"), dept: d.key, name: "", role: d.en, email: SILITEX.info, phone: d.phone }); }}>{tr("+ איש קשר")}</button>
        </div>); })}
      {edit && (<div className="md:col-span-3 border border-brand-200 bg-brand-50/40 rounded-xl p-3 grid md:grid-cols-6 gap-2 text-sm">
        <input className={inputCls} placeholder={tr("שם")} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /><input className={inputCls} placeholder={tr("תפקיד")} value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} /><input className={inputCls} placeholder="email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} dir="ltr" /><input className={inputCls} placeholder={tr("טלפון")} value={edit.phone || ""} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} dir="ltr" /><input className={inputCls} placeholder={tr("נייד")} value={edit.mobile || ""} onChange={(e) => setEdit({ ...edit, mobile: e.target.value })} dir="ltr" />
        <div className="flex gap-1"><button className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-sm" onClick={() => { if (edit.name) onSave(edit); setEdit(null); }}>{tr("שמור")}</button>{contacts.some((c) => c.id === edit.id) && <button className={btnGhost} onClick={() => { onRemove(edit.id); setEdit(null); }}>🗑️</button>}<button className={btnGhost} onClick={() => setEdit(null)}>✕</button></div>
      </div>)}
    </div>
  );
}
