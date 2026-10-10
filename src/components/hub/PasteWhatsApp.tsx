"use client";
// PasteWhatsApp.tsx (src/components/hub/PasteWhatsApp.tsx) · updated 10.10.2026 09:50 (Asia/Jerusalem) — paste a WhatsApp chat export → parsed messages → auto-matched prospect / Silitex contact → one Hub thread (then AI summary/reply as any thread)
import { useMemo, useState } from "react";
import { Card, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { DEPTS } from "@/config/hub";
import { parseWhatsApp, senderList, isUs, matchLeadBySenders, matchContactBySenders } from "@/lib/whatsapp";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Lead, SilitexContact, Thread, HubMsg } from "@/lib/types";
type Props = { leads: Lead[]; contacts: SilitexContact[]; presetLeadId?: string; onSave: (t: Omit<Thread, "id">, msgs: Omit<HubMsg, "id" | "thread_id">[]) => void };
export default function PasteWhatsApp({ leads, contacts, presetLeadId, onSave }: Props) {
  const { t: tr } = useLang(); const [open, setOpen] = useState(!!presetLeadId); const [raw, setRaw] = useState(""); const [party, setParty] = useState(""); const [me, setMe] = useState(""); const [done, setDone] = useState("");
  const msgs = useMemo(() => parseWhatsApp(raw), [raw]); const senders = useMemo(() => senderList(msgs), [msgs]);
  const auto = useMemo(() => { if (!msgs.length) return ""; const l = matchLeadBySenders(senders, raw, leads); if (l) return "lead:" + l.id; const c = matchContactBySenders(senders, contacts); return c ? "ct:" + c.id : ""; }, [msgs, senders, raw, leads, contacts]);
  const sel = party || (presetLeadId ? "lead:" + presetLeadId : auto); const meSel = me || senders.find(isUs) || "";
  const save = () => {
    if (!msgs.length || !sel) return;
    const [kind, id] = sel.split(":"); const lead = kind === "lead" ? leads.find((l) => l.id === id) : undefined; const ct = kind === "ct" ? contacts.find((c) => c.id === id) : undefined;
    const who = lead ? (lead.contact_name || lead.name.split(" (")[0]) : ct?.name || "?"; const first = msgs[0].at, last = msgs[msgs.length - 1].at; const lastIn = msgs[msgs.length - 1].sender !== meSel;
    const t: Omit<Thread, "id"> = { dept: lead ? "il" : ct?.dept || "customer", contact_id: ct?.id, subject: "WhatsApp · " + who + " · " + fmtDate(first) + (first.slice(0, 10) !== last.slice(0, 10) ? "–" + fmtDate(last) : ""), topic: "whatsapp", refs: lead ? { lead_id: lead.id, lead_name: lead.name } : {}, owner: lastIn ? "sapirim" : "silitex", status: lastIn ? "waiting_us" : "waiting_silitex", created_at: first, last_at: last };
    const out = msgs.map((m) => ({ at: m.at, from: m.sender, to: m.sender === meSel ? who : "Avshi Sapir", direction: (m.sender === meSel ? "out" : "in") as HubMsg["direction"], body: m.text, source: "whatsapp" as const }));
    onSave(t, out); setDone(tr("נשמר: ") + msgs.length + tr(" הודעות → ") + who); setRaw(""); setParty(""); setMe("");
  };
  return (
    <Card>
      <div className="flex items-center justify-between"><div className="font-bold">📱 {tr("ייבוא שיחת WhatsApp")}</div><button className={btnGhost} onClick={() => setOpen(!open)}>{open ? "▲" : "▼"}</button></div>
      {open && (<div className="mt-2 space-y-2 text-sm">
        <div className="text-xs text-slate-500">{tr("בוואטסאפ: פתח את השיחה → ⋮ → עוד → ייצוא צ'אט → ללא מדיה → שתף לעצמך/מייל, והדבק כאן את הטקסט. המערכת מזהה את איש הקשר לפי שם/טלפון מרשימת הלקוחות ואנשי הקשר.")}</div>
        <textarea className={inputCls + " h-32 font-mono text-xs"} dir="ltr" placeholder={"10/10/2026, 09:35 - Avshi Sapir: ...\n10/10/2026, 09:36 - Dani Cohen: ..."} value={raw} onChange={(e) => { setRaw(e.target.value); setDone(""); }} />
        {msgs.length > 0 && (<div className="border rounded-xl p-2 bg-slate-50 space-y-2">
          <div className="flex flex-wrap gap-2 items-center"><Badge tone="blue">{msgs.length} {tr("הודעות")}</Badge><span className="text-xs text-slate-500">{fmtDate(msgs[0].at)} → {fmtDate(msgs[msgs.length - 1].at)}</span>{senders.map((s) => <Badge key={s} tone={isUs(s) ? "green" : "slate"}>{s}</Badge>)}</div>
          <div className="grid md:grid-cols-2 gap-2">
            <label className="text-xs text-slate-500">{tr("שייך ל-")}<select className={inputCls + " mt-0.5"} value={sel} onChange={(e) => setParty(e.target.value)}><option value="">—</option><optgroup label={tr("לקוחות פוטנציאליים")}>{leads.map((l) => <option key={l.id} value={"lead:" + l.id}>{l.name}{l.contact_name ? " · " + l.contact_name : ""}</option>)}</optgroup><optgroup label="Silitex">{contacts.map((c) => <option key={c.id} value={"ct:" + c.id}>{c.name} · {DEPTS.find((d) => d.key === c.dept)?.en}</option>)}</optgroup></select>{auto && !party && <span className="text-emerald-700"> ✓ {tr("זוהה אוטומטית")}</span>}</label>
            <label className="text-xs text-slate-500">{tr("אני (השולח שלנו)")}<select className={inputCls + " mt-0.5"} value={meSel} onChange={(e) => setMe(e.target.value)}><option value="">—</option>{senders.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
          </div>
          <div className="max-h-40 overflow-auto text-xs space-y-1 bg-white border rounded-lg p-2" dir="auto">{msgs.slice(0, 50).map((m, i) => <div key={i} className={m.sender === meSel ? "text-emerald-800" : ""}><span className="text-slate-400">{m.at.slice(11, 16)}</span> <b>{m.sender}:</b> {m.text.slice(0, 160)}</div>)}{msgs.length > 50 && <div className="text-slate-400">… +{msgs.length - 50}</div>}</div>
          <button className={btnPrimary} disabled={!sel || !meSel} onClick={save}>{tr("שמור כשרשור")}</button>{!meSel && <span className="text-xs text-amber-700 ms-2">{tr("בחר מי מהשולחים זה אתה")}</span>}
        </div>)}
        {raw.trim() && msgs.length === 0 && <div className="text-xs text-red-600">{tr("לא זוהו הודעות — ודא שזה ייצוא צ'אט של WhatsApp (שורות שמתחילות בתאריך ושעה).")}</div>}
        {done && <div className="text-xs text-emerald-700">{done}</div>}
      </div>)}
    </Card>
  );
}
