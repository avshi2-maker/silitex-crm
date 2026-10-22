"use client";
// ContactModal.tsx (src/components/hub/ContactModal.tsx) · updated 22.10.2026 07:30 (Asia/Jerusalem) — e-mail / mobile / phone fields validated: green ✓ valid, red + hint invalid, amber when already used by another customer / contact (lib/validate.ts + ValidInput) · 10.10.2026 07:05 (Asia/Jerusalem) — add/edit Silitex contact; paste-signature auto-fill
import { useState } from "react";
import { inputCls, btnGhost, btnPrimary } from "@/components/ui";
import { parseSignature } from "@/lib/parse-signature";
import { useLang } from "@/i18n";
import type { SilitexContact } from "@/lib/types";
import type { PoolItem } from "@/lib/validate";
import ValidInput from "@/components/ValidInput";
type Props = { initial: SilitexContact; exists: boolean; deptLabel: string; onSave: (c: SilitexContact) => void; onRemove: (id: string) => void; onClose: () => void; pool?: PoolItem[] };
export default function ContactModal({ initial, exists, deptLabel, onSave, onRemove, onClose, pool }: Props) {
  const { t: tr } = useLang(); const [c, setC] = useState<SilitexContact>(initial); const [sig, setSig] = useState("");
  const set = (k: keyof SilitexContact) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setC({ ...c, [k]: e.target.value });
  const fill = () => { const p = parseSignature(sig); setC({ ...c, ...Object.fromEntries(Object.entries(p).filter(([, v]) => v)) }); };
  const F = (k: keyof SilitexContact, label: string, ltr?: boolean) => (<label key={String(k)} className="text-xs text-slate-500">{label}<input className={inputCls + " mt-0.5"} value={(c[k] as string) || ""} onChange={set(k)} dir={ltr ? "ltr" : undefined} /></label>);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-4 space-y-3 max-h-[92vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><div className="font-bold">{exists ? tr("עריכת איש קשר") : tr("איש קשר חדש")} · {deptLabel}</div><button className={btnGhost} onClick={onClose}>✕</button></div>
        <div className="border rounded-xl p-2 bg-slate-50">
          <div className="text-xs text-slate-500 mb-1">{tr("הדבק חתימת מייל — השדות יתמלאו אוטומטית")}</div>
          <textarea className={inputCls + " h-24 font-mono text-xs"} dir="ltr" value={sig} onChange={(e) => setSig(e.target.value)} placeholder={"Dr. Federica Biti\nExport Sales Manager\nMob: +39 ...\nTel. +39 ... e-mail: ...@silitex.it"} />
          <button className={btnGhost + " mt-1 text-xs"} disabled={!sig.trim()} onClick={fill}>✨ {tr("מלא מהחתימה")}</button>
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {F("name", tr("שם"))}{F("role", tr("תפקיד"))}
          <ValidInput kind="email" label="Email" value={c.email || ""} onChange={(v) => setC({ ...c, email: v })} pool={pool} selfKey={"ct:" + c.id} /><ValidInput kind="mobile" label={tr("נייד")} value={c.mobile || ""} onChange={(v) => setC({ ...c, mobile: v })} pool={pool} selfKey={"ct:" + c.id} />
          <ValidInput kind="phone" label={tr("טלפון")} value={c.phone || ""} onChange={(v) => setC({ ...c, phone: v })} pool={pool} selfKey={"ct:" + c.id} />{F("linkedin", "LinkedIn", true)}
          <label className="text-xs text-slate-500 md:col-span-2">{tr("כתובת")}<input className={inputCls + " mt-0.5"} value={c.address || ""} onChange={set("address")} dir="ltr" /></label>
          <label className="text-xs text-slate-500 md:col-span-2">{tr("הערות")}<textarea className={inputCls + " mt-0.5 h-16"} value={c.notes || ""} onChange={set("notes")} /></label>
        </div>
        <div className="flex gap-2 justify-between">
          <div className="flex gap-2"><button className={btnPrimary} disabled={!c.name.trim()} onClick={() => { onSave({ ...c, name: c.name.trim() }); onClose(); }}>{tr("שמור")}</button><button className={btnGhost} onClick={onClose}>{tr("ביטול")}</button></div>
          {exists && <button className={btnGhost + " text-red-600"} onClick={() => { if (confirm(tr("למחוק את איש הקשר?"))) { onRemove(c.id); onClose(); } }}>🗑️ {tr("מחק")}</button>}
        </div>
      </div>
    </div>
  );
}
