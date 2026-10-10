"use client";
// PasteWhatsApp.tsx (src/components/hub/PasteWhatsApp.tsx) · updated 10.10.2026 10:05 (Asia/Jerusalem) — paste a WhatsApp chat export OR a single copied message (free text → pick them/me) → parsed messages → auto-matched prospect / Silitex contact → one Hub thread (then AI summary/reply as any thread)
import { useMemo, useState } from "react";
import { Card, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { DEPTS } from "@/config/hub";
import { parseWhatsApp, senderList, isUs, matchLeadBySenders, matchContactBySenders } from "@/lib/whatsapp-import";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Lead, SilitexContact, Thread, HubMsg } from "@/lib/types";
type Props = { leads: Lead[]; contacts: SilitexContact[]; threads: Thread[]; presetLeadId?: string; onSave: (t: Omit<Thread, "id">, msgs: Omit<HubMsg, "id" | "thread_id">[]) => void; onAppend: (threadId: string, msgs: Omit<HubMsg, "id" | "thread_id">[]) => void };
export default function PasteWhatsApp({ leads, contacts, threads, presetLeadId, onSave, onAppend }: Props) {
  const { t: tr } = useLang(); const [open, setOpen] = useState(!!presetLeadId); const [raw, setRaw] = useState(""); const [party, setParty] = useState(""); const [me, setMe] = useState(""); const [done, setDone] = useState(""); const [dir, setDir] = useState<"in" | "out">("in"); const [when, setWhen] = useState("");
  const msgs = useMemo(() => parseWhatsApp(raw), [raw]); const senders = useMemo(() => senderList(msgs), [msgs]);
  const auto = useMemo(() => { if (!msgs.length) return ""; const l = matchLeadBySenders(senders, raw, leads); if (l) return "lead:" + l.id; const c = matchContactBySenders(senders, contacts); return c ? "ct:" + c.id : ""; }, [msgs, senders, raw, leads, contacts]);
  const sel = party || (presetLeadId ? "lead:" + presetLeadId : auto); const meSel = me || senders.find(isUs) || "";
  const free = !msgs.length && raw.trim().length > 0; const selFree = party || (presetLeadId ? "lead:" + presetLeadId : "");
  const commit = (list: { at: string; sender: string; text: string; out: boolean }[], selKey: string) => {
    const [kind, id] = selKey.split(":"); const lead = kind === "lead" ? leads.find((l) => l.id === id) : undefined; const ct = kind === "ct" ? contacts.find((c) => c.id === id) : undefined;
    const who = lead ? (lead.contact_name || lead.name.split(" (")[0]) : ct?.name || "?"; const first = list[0].at, last = list[list.length - 1].at; const lastIn = !list[list.length - 1].out;
    const out = list.map((m) => ({ at: m.at, from: m.out ? "Avshi Sapir" : who, to: m.out ? who : "Avshi Sapir", direction: (m.out ? "out" : "in") as HubMsg["direction"], body: m.text, source: "whatsapp" as const }));
    const existing = threads.find((t) => t.topic === "whatsapp" && (lead ? t.refs.lead_id === lead.id : ct ? t.contact_id === ct.id : false));
    if (existing) { onAppend(existing.id, out); setDone(tr("נוסף לשרשור: ") + existing.subject); }
    else { onSave({ dept: lead ? "il" : ct?.dept || "customer", contact_id: ct?.id, subject: "WhatsApp · " + who + " · " + fmtDate(first) + (first.slice(0, 10) !== last.slice(0, 10) ? "–" + fmtDate(last) : ""), topic: "whatsapp", refs: lead ? { lead_id: lead.id, lead_name: lead.name } : {}, owner: lastIn ? "sapirim" : "silitex", status: lastIn ? "waiting_us" : "waiting_silitex", created_at: first, last_at: last }, out); setDone(tr("נשמר: ") + list.length + tr(" הודעות → ") + who); }
    setRaw(""); setParty(""); setMe(""); setWhen("");
  };
  const save = () => { if (!msgs.length || !sel) return; commit(msgs.map((m) => ({ ...m, out: m.sender === meSel })), sel); };
  const saveFree = () => { if (!free || !selFree) return; const at = when ? new Date(when + "T12:00:00").toISOString() : new Date().toISOString(); commit([{ at, sender: dir === "out" ? "Avshi Sapir" : "", text: raw.trim(), out: dir === "out" }], selFree); };
  const partySelect = (value: string, onChange: (v: string) => void) => (<select className={inputCls + " mt-0.5"} value={value} onChange={(e) => onChange(e.target.value)}><option value="">—</option><optgroup label={tr("לקוחות פוטנציאליים")}>{leads.map((l) => <option key={l.id} value={"lead:" + l.id}>{l.name}{l.contact_name ? " · " + l.contact_name : ""}</option>)}</optgroup><optgroup label="Silitex">{contacts.map((c) => <option key={c.id} value={"ct:" + c.id}>{c.name} · {DEPTS.find((d) => d.key === c.dept)?.en}</option>)}</optgroup></select>);
  return (
    <Card>
      <div className="flex items-center justify-between"><div className="font-bold">📱 {tr("ייבוא שיחת WhatsApp")}</div><button className={btnGhost} onClick={() => setOpen(!open)}>{open ? "▲" : "▼"}</button></div>
      {open && (<div className="mt-2 space-y-2 text-sm">
        <div className="text-xs text-slate-500">{tr("הדבק הודעה שהעתקת מוואטסאפ (לחיצה ארוכה → העתק) ובחר ממי היא — או הדבק ייצוא צ'אט שלם (⋮ → עוד → ייצוא צ'אט → ללא מדיה) והמערכת תזהה שולחים ואיש קשר לבד.")}</div>
        <textarea className={inputCls + " h-32 font-mono text-xs"} dir="ltr" placeholder={tr("הדבק כאן הודעה אחת או ייצוא צ'אט שלם…")} value={raw} onChange={(e) => { setRaw(e.target.value); setDone(""); }} />
        {msgs.length > 0 && (<div className="border rounded-xl p-2 bg-slate-50 space-y-2">
          <div className="flex flex-wrap gap-2 items-center"><Badge tone="blue">{msgs.length} {tr("הודעות")}</Badge><span className="text-xs text-slate-500">{fmtDate(msgs[0].at)} → {fmtDate(msgs[msgs.length - 1].at)}</span>{senders.map((s) => <Badge key={s} tone={isUs(s) ? "green" : "slate"}>{s}</Badge>)}</div>
          <div className="grid md:grid-cols-2 gap-2">
            <label className="text-xs text-slate-500">{tr("שייך ל-")}{partySelect(sel, setParty)}{auto && !party && <span className="text-emerald-700"> ✓ {tr("זוהה אוטומטית")}</span>}</label>
            <label className="text-xs text-slate-500">{tr("אני (השולח שלנו)")}<select className={inputCls + " mt-0.5"} value={meSel} onChange={(e) => setMe(e.target.value)}><option value="">—</option>{senders.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
          </div>
          <div className="max-h-40 overflow-auto text-xs space-y-1 bg-white border rounded-lg p-2" dir="auto">{msgs.slice(0, 50).map((m, i) => <div key={i} className={m.sender === meSel ? "text-emerald-800" : ""}><span className="text-slate-400">{m.at.slice(11, 16)}</span> <b>{m.sender}:</b> {m.text.slice(0, 160)}</div>)}{msgs.length > 50 && <div className="text-slate-400">… +{msgs.length - 50}</div>}</div>
          <button className={btnPrimary} disabled={!sel || !meSel} onClick={save}>{tr("שמור כשרשור")}</button>{!meSel && <span className="text-xs text-amber-700 ms-2">{tr("בחר מי מהשולחים זה אתה")}</span>}
        </div>)}
        {free && (<div className="border rounded-xl p-2 bg-slate-50 space-y-2">
          <div className="text-xs text-slate-500">{tr("הודעה בודדת (ללא תאריכים) — בחר למי שייכת וממי נשלחה:")}</div>
          <div className="grid md:grid-cols-3 gap-2">
            <label className="text-xs text-slate-500">{tr("שייך ל-")}{partySelect(selFree, setParty)}</label>
            <label className="text-xs text-slate-500">{tr("ממי")}<select className={inputCls + " mt-0.5"} value={dir} onChange={(e) => setDir(e.target.value as "in" | "out")}><option value="in">{tr("מהם → אליי")}</option><option value="out">{tr("ממני → אליהם")}</option></select></label>
            <label className="text-xs text-slate-500">{tr("תאריך")}<input type="date" className={inputCls + " mt-0.5"} value={when} onChange={(e) => setWhen(e.target.value)} /></label>
          </div>
          <button className={btnPrimary} disabled={!selFree} onClick={saveFree}>{tr("שמור הודעה")}</button>
        </div>)}
        {done && <div className="text-xs text-emerald-700">{done}</div>}
      </div>)}
    </Card>
  );
}
