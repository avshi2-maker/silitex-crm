"use client";
// PeopleCard.tsx (src/components/leads/PeopleCard.tsx) · created 26.10.2026 06:50 (Asia/Jerusalem) — v0.96.0
// 👥 People at this company: as many as needed (owner, R&D, purchasing, plant …). Paste an e-mail signature → fields fill.
// Every e-mail here is picked up by the Outlook sync for this customer; every mobile by the WhatsApp matching. ⭐ = make main contact.
import { useState } from "react";
import { Card, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import ValidInput from "@/components/ValidInput";
import { parseSignature } from "@/lib/parse-signature";
import { peopleOf, withPeople, type Person } from "@/lib/people";
import { uid } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Lead } from "@/lib/types";
import type { PoolItem } from "@/lib/validate";

type Props = { lead: Lead; pool?: PoolItem[]; onSave: (l: Lead) => void; onLog?: (t: string) => void };
const EMPTY = (): Person => ({ id: uid("pp"), name: "", role: "", mobile: "", email: "", notes: "" });

export default function PeopleCard({ lead, pool, onSave, onLog }: Props) {
  const { t: tr } = useLang(); const list = peopleOf(lead);
  const [ed, setEd] = useState<Person | null>(null); const [sig, setSig] = useState("");
  const set = (k: keyof Person, v: string) => ed && setEd({ ...ed, [k]: v });
  const fill = () => { if (!ed) return; const p = parseSignature(sig); setEd({ ...ed, name: p.name || ed.name, role: p.role || ed.role, mobile: p.mobile || p.phone || ed.mobile, email: p.email || ed.email }); };
  const save = () => {
    if (!ed || !ed.name.trim()) return; const p = { ...ed, name: ed.name.trim(), email: (ed.email || "").trim().toLowerCase() };
    const exists = list.some((x) => x.id === p.id); onSave(withPeople(lead, exists ? list.map((x) => (x.id === p.id ? p : x)) : [...list, p]));
    if (!exists) onLog?.(tr("איש קשר נוסף") + ": " + p.name + (p.role ? " · " + p.role : ""));
    setEd(null); setSig("");
  };
  const remove = (id: string) => { if (window.confirm(tr("להסיר את איש הקשר?"))) onSave(withPeople(lead, list.filter((x) => x.id !== id))); };
  const makeMain = (p: Person) => {
    const old: Person | null = lead.contact_name || lead.contact_phone || lead.contact_email ? { id: uid("pp"), name: lead.contact_name || "—", role: lead.contact_role, mobile: lead.contact_phone, email: lead.contact_email } : null;
    const rest = list.filter((x) => x.id !== p.id); const next = withPeople({ ...lead, contact_name: p.name, contact_role: p.role || lead.contact_role, contact_phone: p.mobile || "", contact_email: p.email || "" }, old ? [...rest, old] : rest);
    onSave(next);
  };
  const self = "lead:" + lead.id; const row = "flex items-start gap-2 border-t pt-2 text-sm";
  return (
    <Card>
      <div className="flex items-center justify-between"><h3 className="font-bold">👥 {tr("אנשי קשר בחברה")} ({list.length + (lead.contact_name ? 1 : 0)})</h3><button className={btnGhost + " text-xs"} onClick={() => setEd(EMPTY())}>+ {tr("איש קשר")}</button></div>
      <div className="text-[11px] text-slate-500 mb-1">{tr("כל המיילים והוואטסאפ עם האנשים כאן נכנסים אוטומטית לכרטיס הלקוח.")}</div>
      {lead.contact_name && <div className={row}><span title={tr("איש קשר ראשי")}>⭐</span><div className="min-w-0 flex-1"><b>{lead.contact_name}</b> <span className="text-slate-500">{lead.contact_role}</span><div className="text-xs" dir="ltr">{[lead.contact_phone, lead.contact_email].filter(Boolean).join(" · ")}</div></div></div>}
      {list.map((p) => (
        <div key={p.id} className={row}>
          <button className="text-slate-300 hover:text-amber-500" title={tr("הפוך לאיש קשר ראשי")} onClick={() => makeMain(p)}>☆</button>
          <div className="min-w-0 flex-1"><b>{p.name}</b> <span className="text-slate-500">{p.role}</span><div className="text-xs" dir="ltr">{[p.mobile, p.email].filter(Boolean).join(" · ")}</div>{p.notes && <div className="text-xs text-slate-500">{p.notes}</div>}</div>
          {p.mobile && <a className="text-xs text-emerald-700" target="_blank" rel="noreferrer" href={"https://wa.me/" + p.mobile.replace(/\D/g, "").replace(/^0/, "972")}>💬</a>}
          <button className="text-xs text-slate-500" onClick={() => setEd(p)}>✏️</button><button className="text-xs text-red-500" onClick={() => remove(p.id)}>✕</button>
        </div>))}
      {ed && (
        <div className="mt-2 border-2 border-brand-100 rounded-xl p-2 space-y-2 bg-white">
          <textarea className={inputCls + " h-16 font-mono text-xs"} dir="ltr" value={sig} onChange={(e) => setSig(e.target.value)} placeholder={tr("הדבק חתימת מייל — השדות יתמלאו אוטומטית")} />
          <button className={btnGhost + " text-xs"} disabled={!sig.trim()} onClick={fill}>✨ {tr("מלא מהחתימה")}</button>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-500">{tr("שם")} *<input className={inputCls + " mt-1"} value={ed.name} onChange={(e) => set("name", e.target.value)} /></label>
            <label className="text-xs text-slate-500">{tr("תפקיד")}<input className={inputCls + " mt-1"} value={ed.role || ""} onChange={(e) => set("role", e.target.value)} /></label>
            <ValidInput kind="mobile" label={tr("נייד")} value={ed.mobile || ""} onChange={(v) => set("mobile", v)} pool={pool} selfKey={self} />
            <ValidInput kind="email" label="Email" value={ed.email || ""} onChange={(v) => set("email", v)} pool={pool} selfKey={self} />
          </div>
          <label className="text-xs text-slate-500 block">{tr("הערות")}<input className={inputCls + " mt-1"} value={ed.notes || ""} onChange={(e) => set("notes", e.target.value)} /></label>
          <div className="flex gap-2"><button className={btnPrimary} disabled={!ed.name.trim()} onClick={save}>{tr("שמור")}</button><button className={btnGhost} onClick={() => { setEd(null); setSig(""); }}>{tr("ביטול")}</button></div>
        </div>)}
    </Card>
  );
}
