"use client";
// ProjectTeam.tsx (src/components/projects/ProjectTeam.tsx) · created 10.11.2026 13:15 (Asia/Jerusalem) — v1.9.8 📁 project team
// Silitex people (TO / CC) for every mail of this project. Add anyone from the Hub contacts (lab, logistics, accounts — as they join in the
// coming months) or a new name + e-mail; new people for good go into the Hub (📬 → + Contact).
import { useState } from "react";
import Link from "next/link";
import { Card, Badge, inputCls, btnGhost } from "@/components/ui";
import { useLang } from "@/i18n";
import type { Project, ProjectMember, SilitexContact } from "@/lib/types";

type Props = { p: Project; contacts: SilitexContact[]; onSave: (team: ProjectMember[]) => Promise<unknown> };
export default function ProjectTeam({ p, contacts, onSave }: Props) {
  const { t: tr } = useLang(); const [pick, setPick] = useState(""); const [nm, setNm] = useState(""); const [em, setEm] = useState("");
  const team = p.team || []; const have = new Set(team.map((m) => m.email.toLowerCase()));
  const free = contacts.filter((c) => c.email && !have.has(c.email.toLowerCase()) && !/^info@/i.test(c.email));
  const set = (t: ProjectMember[]) => { onSave(t).catch(() => {}); };
  const add = (m: ProjectMember) => { if (!m.email || have.has(m.email.toLowerCase())) return; set([...team, m]); setPick(""); setNm(""); setEm(""); };
  const fromContact = () => { const c = contacts.find((x) => x.id === pick); if (c) add({ name: c.name, email: c.email, org: (c.dept === "partner" ? "Sapirim" : "Silitex") + (c.role ? " · " + c.role : ""), role: team.some((m) => m.role === "to") ? "cc" : "to" }); };
  return (
    <Card className="space-y-2">
      <div className="flex items-center gap-2"><h3 className="font-bold flex-1">{tr("צוות הפרויקט")}</h3><Link href="/hub" className="text-xs underline text-slate-500">📬 {tr("אנשי קשר ב-Hub")}</Link></div>
      <div className="flex justify-between items-center text-sm border-t pt-2"><div><b>{tr("אבשי ספיר")}</b><div className="text-xs text-slate-500">{tr("ספירים · מנהל פרויקט")}</div></div><Badge tone="slate">FROM</Badge></div>
      <div className="flex justify-between items-center text-sm border-t pt-2"><div><b>{p.lead_name}</b><div className="text-xs text-slate-500">{tr("לקוח · רואה את אותו מספר")}</div></div><Badge tone="amber">{tr("לקוח")}</Badge></div>
      {team.map((m) => (
        <div key={m.email} className="flex justify-between items-center gap-2 text-sm border-t pt-2">
          <div className="min-w-0"><b>{m.name}</b><div className="text-xs text-slate-500">{m.org}</div><div className="text-xs text-sky-800 truncate" dir="ltr">{m.email}</div></div>
          <div className="flex items-center gap-1">
            <button type="button" className={btnGhost + " min-h-[40px] font-mono"} onClick={() => set(team.map((x) => (x.email === m.email ? { ...x, role: x.role === "to" ? "cc" : "to" } : x)))} title={tr("החלף TO / CC")}>{m.role.toUpperCase()}</button>
            <button type="button" className={btnGhost + " min-h-[40px]"} onClick={() => set(team.filter((x) => x.email !== m.email))} aria-label={tr("הסר")}>✕</button>
          </div>
        </div>))}
      <div className="border-t pt-2 space-y-2">
        <div className="flex gap-2"><select className={inputCls} value={pick} onChange={(e) => setPick(e.target.value)} aria-label={tr("הוסף מאנשי הקשר")}>
          <option value="">{tr("+ איש קשר מה-Hub…")}</option>{free.map((c) => <option key={c.id} value={c.id}>{c.name}{c.role ? " — " + c.role : ""}</option>)}</select>
          <button type="button" className={btnGhost} disabled={!pick} onClick={fromContact}>{tr("הוסף")}</button></div>
        <div className="flex gap-2"><input className={inputCls} value={nm} onChange={(e) => setNm(e.target.value)} placeholder={tr("שם (חדש)")} /><input className={inputCls} dir="ltr" value={em} onChange={(e) => setEm(e.target.value)} placeholder="name@silitex.it" />
          <button type="button" className={btnGhost} disabled={!nm.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.trim())} onClick={() => add({ name: nm.trim(), email: em.trim(), org: em.includes("silitex") ? "Silitex" : "", role: "cc" })}>{tr("הוסף")}</button></div>
      </div>
    </Card>
  );
}
