"use client";
// DeptBoxes.tsx (src/components/hub/DeptBoxes.tsx) · updated 10.10.2026 07:30 (Asia/Jerusalem) — Silitex department boxes: contacts (modal add/edit), open/waiting counts, late flag; click = filter
import { useState } from "react";
import { DEPTS, SILITEX } from "@/config/hub";
import { Badge, btnGhost } from "@/components/ui";
import ContactModal from "./ContactModal";
import { isLate } from "@/lib/hub";
import { uid } from "@/lib/format";
import { useLang } from "@/i18n";
import type { SilitexContact, Thread } from "@/lib/types";
type Props = { contacts: SilitexContact[]; leadsWithEmail?: number; threads: Thread[]; sel: string; onSel: (k: string) => void; onSave: (c: SilitexContact) => void; onRemove: (id: string) => void };
export default function DeptBoxes({ contacts, leadsWithEmail = 0, threads, sel, onSel, onSave, onRemove }: Props) {
  const { t: tr } = useLang(); const [edit, setEdit] = useState<SilitexContact | null>(null);
  return (
    <div className="grid md:grid-cols-3 gap-2">
      {DEPTS.map((d) => { const ths = threads.filter((t) => t.dept === d.key); const open = ths.filter((t) => t.status !== "closed"); const late = ths.filter(isLate).length; const people = contacts.filter((c) => c.dept === d.key); return (
        <div key={d.key} className={"border rounded-xl p-3 bg-white cursor-pointer " + (sel === d.key ? "ring-2 ring-brand-500" : "hover:bg-slate-50")} onClick={() => onSel(sel === d.key ? "" : d.key)}>
          <div className="flex items-center justify-between"><div className="font-bold text-sm">{d.icon} {tr(d.he)}</div><div className="flex gap-1">{late > 0 && <Badge tone="red">⏰ {late}</Badge>}<Badge tone={open.length ? "blue" : "slate"}>{open.length}/{ths.length}</Badge></div></div>
          <div className="text-[11px] text-slate-400" dir="ltr">{d.en}{d.phone && " · " + d.phone}</div>
          <div className="text-xs text-slate-500 mt-1">{d.notes}</div>
          <ul className="mt-2 text-xs space-y-0.5">{people.map((c) => (<li key={c.id} className="flex items-start gap-1 border-t pt-1"><div className="min-w-0 flex-1"><div className="truncate"><span className="font-medium">{c.name}</span> <span className="text-slate-400">{c.role}</span></div><div className="flex flex-wrap gap-x-2 text-[11px]" dir="ltr"><a className="text-brand-600 truncate" href={"mailto:" + c.email} onClick={(e) => e.stopPropagation()}>{c.email}</a>{c.mobile && <a className="text-emerald-700" href={"https://wa.me/" + c.mobile.replace(/\D/g, "")} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>📱 {c.mobile}</a>}{c.linkedin && <a className="text-sky-700" href={c.linkedin} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>in</a>}</div></div><button className="text-slate-400 shrink-0" onClick={(e) => { e.stopPropagation(); setEdit(c); }}>✏️</button></li>))}{people.length === 0 && d.key !== "il" && <li className="text-slate-400">{tr("שמות יתווספו לאחר החוזה · ")}{SILITEX.info}</li>}{d.key === "il" && <li className="text-slate-400">{leadsWithEmail}{tr(" לקוחות פוטנציאליים עם אימייל · מסונכרן אוטומטית")}</li>}</ul>
          {d.key !== "il" && <button className={btnGhost + " mt-2 text-xs"} onClick={(e) => { e.stopPropagation(); setEdit({ id: uid("ct"), dept: d.key, name: "", role: d.en, email: SILITEX.info, phone: d.phone }); }}>{tr("+ איש קשר")}</button>}
        </div>); })}
      {edit && <ContactModal initial={edit} exists={contacts.some((c) => c.id === edit.id)} deptLabel={tr(DEPTS.find((d) => d.key === edit.dept)?.he || "")} onSave={onSave} onRemove={onRemove} onClose={() => setEdit(null)} />}
    </div>
  );
}
