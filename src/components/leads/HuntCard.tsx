"use client";
// HuntCard.tsx (src/components/leads/HuntCard.tsx) · updated 22.10.2026 07:30 (Asia/Jerusalem) — e-mail / mobile / phone fields validated: green ✓ valid, red + hint invalid, amber when already used by another customer / contact (lib/validate.ts + ValidInput) · created 21.10.2026 11:10 (Asia/Jerusalem) — 🔎 smart Google search on every lead: 1-click searches built from Google operators (site:, quotes, OR, after:, filetype:) → decision makers on LinkedIn, is the company real, fresh news, current supplier, SDS / tech docs, contact page. Found someone? Save name / role / phone / LinkedIn straight into the lead + activity log. Free — no API.
import { useState } from "react";
import { Card, btnPrimary, inputCls } from "@/components/ui";
import { leadQueries, g } from "@/lib/google-tricks";
import type { Lead } from "@/lib/types";
import { useLang } from "@/i18n";
import ValidInput from "@/components/ValidInput";
export default function HuntCard({ lead, onSave, onLog }: { lead: Lead; onSave: (l: Lead) => void; onLog: (text: string) => void }) {
  const { t: tr } = useLang();
  const [open, setOpen] = useState(false); const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [url, setUrl] = useState(""); const [done, setDone] = useState("");
  const qs = leadQueries(lead);
  const save = () => {
    if (!name.trim()) return;
    const line = "👤 " + name.trim() + (phone.trim() ? " · " + phone.trim() : "") + (url.trim() ? " · " + url.trim() : "");
    onSave({ ...lead, contact_name: lead.contact_name || name.trim(), contact_phone: lead.contact_phone || phone.trim() || undefined, notes: [lead.notes, line].filter(Boolean).join("\n") });
    onLog(tr("איש קשר נמצא בחיפוש") + ": " + line); setDone(name.trim()); setName(""); setPhone(""); setUrl("");
  };
  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between"><h3 className="font-bold">🔎 {tr("חיפוש חכם בגוגל")}</h3><span className="text-[11px] text-slate-400">{tr("חינם · נפתח בלשונית חדשה")}</span></div>
      <ul className="space-y-1">{qs.map((q) => (
        <li key={q.label}><a href={g(q.q)} target="_blank" rel="noreferrer" className="flex items-start gap-2 rounded-lg border px-2 py-1.5 text-sm hover:border-brand-400 hover:bg-brand-50/40" title={q.q}>
          <span>{q.icon}</span><span className="flex-1 min-w-0"><span className="font-medium">{tr(q.label)}</span>{q.tip && <span className="block text-[11px] text-slate-500">{tr(q.tip)}</span>}</span><span className="text-slate-400">↗</span>
        </a></li>))}</ul>
      <button className="text-xs text-brand-700 underline" onClick={() => setOpen((v) => !v)}>{open ? "▲" : "▼"} {tr("מצאתי מישהו — שמור בכרטיס")}</button>
      {open && <div className="space-y-2 rounded-lg bg-slate-50 p-2">
        <input className={inputCls} placeholder={tr("שם + תפקיד (למשל: דותן יעקב — מנהל R&D)")} value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2"><ValidInput kind="phone" placeholder={tr("טלפון")} value={phone} onChange={setPhone} /><input className={inputCls} dir="ltr" placeholder="LinkedIn URL" value={url} onChange={(e) => setUrl(e.target.value)} /></div>
        <button className={btnPrimary + " w-full"} disabled={!name.trim()} onClick={save}>💾 {tr("שמור איש קשר")}</button>
      </div>}
      {done && <div className="text-xs text-emerald-700">✓ {done} {tr("נשמר בכרטיס וביומן")}</div>}
    </Card>
  );
}
