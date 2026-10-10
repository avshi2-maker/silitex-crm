"use client";
// PasteMail.tsx (src/components/hub/PasteMail.tsx) · updated 10.10.2026 07:30 (Asia/Jerusalem) — paste an Outlook email (headers + body) → parsed, auto-matched (dept, shipment, lead, SKU, P/O) → new thread or append to selected thread
import { useState } from "react";
import { Card, inputCls, btnPrimary, btnGhost, Badge } from "@/components/ui";
import { DEPTS } from "@/config/hub";
import { parseEmail, matchRefs, guessDept, isOutbound } from "@/lib/hub";
import { matchLead } from "@/lib/hub-match";
import { useLang } from "@/i18n";
import type { Lead, Shipment, Thread, HubMsg, SilitexContact } from "@/lib/types";
type Props = { contacts?: SilitexContact[]; leads: Lead[]; shipments: Shipment[]; threads: Thread[]; current?: Thread; onNewThread: (t: Omit<Thread, "id">, m: Omit<HubMsg, "id" | "thread_id">) => void; onAppend: (threadId: string, m: Omit<HubMsg, "id" | "thread_id">) => void };
export default function PasteMail({ contacts = [], leads, shipments, threads, current, onNewThread, onAppend }: Props) {
  const { t: tr } = useLang(); const [raw, setRaw] = useState(""); const [target, setTarget] = useState<string>("new");
  const p = raw ? parseEmail(raw) : null; const refs = p ? matchRefs(p.subject + " " + p.body, leads, shipments) : {}; const ct = p ? contacts.find((c) => c.email && !/^info@/i.test(c.email) && (p.from + " " + p.to).toLowerCase().includes(c.email.toLowerCase())) : undefined; const ld = p && !ct ? matchLead(p.from + " " + p.to, leads) : undefined; if (ld && !refs.lead_id) { refs.lead_id = ld.id; refs.lead_name = ld.name; } const dept = p ? ct?.dept || (ld ? "il" : guessDept(p.subject, p.body)) : "";
  const norm = p ? p.subject.replace(/^(re|fw|fwd|r|i)\s*:\s*/gi, "").trim() : "";
  const existing = p ? threads.find((t) => t.subject.toLowerCase() === norm.toLowerCase()) : undefined;
  const save = () => {
    if (!p) return; const dir: HubMsg["direction"] = isOutbound(p.from) ? "out" : "in";
    const msg = { at: p.at, from: p.from || (dir === "out" ? "avshi@sapirim.com" : "info@silitex.it"), to: p.to, direction: dir, body: p.body, source: "paste" as const };
    const tid = target === "new" ? "" : target === "current" ? current?.id : target === "existing" ? existing?.id : target;
    if (tid) onAppend(tid, msg); else onNewThread({ dept, subject: norm || "(no subject)", topic: refs.shipment_ref ? "shipment" : refs.po ? "order" : refs.invoice ? "invoice" : "other", refs, owner: dir === "in" ? "sapirim" : "silitex", status: dir === "in" ? "waiting_us" : "waiting_silitex", created_at: p.at, last_at: p.at }, msg);
    setRaw("");
  };
  return (
    <Card className="space-y-2">
      <h3 className="font-bold">{tr("הדבק מייל מ-Outlook")} <span className="text-xs font-normal text-slate-500">{tr("(From / Sent / To / Subject + גוף — כמו שמעתיקים מהמייל)")}</span></h3>
      <textarea className={inputCls + " font-mono text-xs"} rows={6} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={"From: Export Dept <export@silitex.it>\nSent: Friday, 10 October 2026 09:12\nTo: avshi@sapirim.com\nSubject: RE: SHP-2026-001 packing list\n\nDear Avshi, ..."} dir="ltr" />
      {p && (<div className="flex flex-wrap gap-1 text-xs items-center">
        <Badge tone={isOutbound(p.from) ? "green" : "amber"}>{isOutbound(p.from) ? tr("יוצא") : tr("נכנס")}</Badge><Badge tone="slate">{DEPTS.find((d) => d.key === dept)?.icon} {tr(DEPTS.find((d) => d.key === dept)?.he || dept)}</Badge>
        {refs.shipment_ref && <Badge tone="blue">🚢 {refs.shipment_ref}</Badge>}{refs.lead_name && <Badge tone="green">🏭 {refs.lead_name}</Badge>}{refs.sku && <Badge tone="purple">{refs.sku}</Badge>}{refs.po && <Badge tone="amber">P/O {refs.po}</Badge>}{refs.invoice && <Badge tone="amber">INV {refs.invoice}</Badge>}{refs.lot && <Badge tone="slate">lot {refs.lot}</Badge>}
        <span className="text-slate-500">· {p.subject || tr("(ללא נושא)")}</span>
      </div>)}
      <div className="flex flex-wrap gap-2 items-center">
        <select className={inputCls + " w-72"} value={target} onChange={(e) => setTarget(e.target.value)}><option value="new">{tr("➕ שרשור חדש")}</option>{existing && <option value="existing">{tr("↪ אותו נושא: ")}{existing.subject.slice(0, 40)}</option>}{current && <option value="current">{tr("↪ לשרשור הפתוח: ")}{current.subject.slice(0, 40)}</option>}</select>
        <button className={btnPrimary} disabled={!p} onClick={save}>{tr("שמור ל-Hub")}</button><button className={btnGhost} onClick={() => setRaw("")}>{tr("נקה")}</button>
      </div>
    </Card>
  );
}
