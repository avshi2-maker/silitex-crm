"use client";
// WaInbox.tsx (src/components/hub/WaInbox.tsx) · updated 10.10.2026 10:20 (Asia/Jerusalem) — 📥 Unmatched WhatsApp: messages from numbers not in the CRM → assign to prospect / Silitex contact · create prospect · ignore · block
import { useEffect, useState } from "react";
import { Card, Badge, inputCls, btnGhost, btnPrimary } from "@/components/ui";
import { DEPTS } from "@/config/hub";
import { fmtDateTime, uid } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Lead, SilitexContact } from "@/lib/types";
type Item = { id: string; phone: string; name: string | null; at: string; body: string };
type Props = { leads: Lead[]; contacts: SilitexContact[]; onCreateLead: (l: Lead) => void; onAssigned: () => void };
export default function WaInbox({ leads, contacts, onCreateLead, onAssigned }: Props) {
  const { t: tr } = useLang(); const [items, setItems] = useState<Item[]>([]); const [pick, setPick] = useState<Record<string, string>>({}); const [busy, setBusy] = useState("");
  const load = () => fetch("/api/hub/wa-admin").then((r) => r.json()).then((j) => setItems(j.items || [])).catch(() => {});
  useEffect(() => { load(); const i = setInterval(load, 60000); return () => clearInterval(i); }, []);
  const post = async (b: Record<string, string>) => { setBusy(b.id || b.phone || ""); await fetch("/api/hub/wa-admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); setBusy(""); await load(); onAssigned(); };
  const assign = (it: Item) => { const v = pick[it.id]; if (!v) return; const [k, id] = v.split(":"); return post(k === "lead" ? { action: "assign", id: it.id, lead_id: id } : { action: "assign", id: it.id, contact_id: id }); };
  const create = async (it: Item) => {
    const name = (it.name || "").trim() || "+" + it.phone; const l: Lead = { id: uid("lead"), name: name + " (WhatsApp)", industry: "", sub_industry: "", product_match: "", use_case: "", volume_tons: 0, value_usd: 0, tier: "Tier 3 - New", department: "", contact_role: "", status: "new", stage: "prospect", contact_name: it.name || "", contact_phone: "+" + it.phone, source: "whatsapp" };
    onCreateLead(l); await new Promise((r) => setTimeout(r, 400)); await post({ action: "assign", id: it.id, lead_id: l.id });
  };
  const phones = Array.from(new Set(items.map((i) => i.phone)));
  if (!items.length) return null;
  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <div className="font-bold mb-2">📥 {tr("WhatsApp — מספרים לא מזוהים")} <Badge tone="amber">{phones.length}</Badge></div>
      <div className="space-y-2">{phones.map((p) => { const ms = items.filter((i) => i.phone === p); const first = ms[0]; return (
        <div key={p} className="bg-white border rounded-xl p-2 text-sm">
          <div className="flex flex-wrap items-center gap-2"><b dir="ltr">+{p}</b>{first.name && <span className="text-slate-500">{first.name}</span>}<span className="text-xs text-slate-400">{fmtDateTime(ms[ms.length - 1].at)} · {ms.length}</span></div>
          <div className="text-xs text-slate-600 mt-1 whitespace-pre-wrap max-h-20 overflow-auto" dir="auto">{ms.slice(-3).map((m) => m.body).join("\n")}</div>
          <div className="flex flex-wrap gap-1 mt-2 items-center">
            <select className={inputCls + " w-64"} value={pick[first.id] || ""} onChange={(e) => setPick({ ...pick, [first.id]: e.target.value })}><option value="">{tr("שייך ל…")}</option><optgroup label={tr("לקוחות פוטנציאליים")}>{leads.map((l) => <option key={l.id} value={"lead:" + l.id}>{l.name}</option>)}</optgroup><optgroup label="Silitex">{contacts.map((c) => <option key={c.id} value={"ct:" + c.id}>{c.name} · {DEPTS.find((d) => d.key === c.dept)?.en}</option>)}</optgroup></select>
            <button className={btnPrimary} disabled={!pick[first.id] || busy === first.id} onClick={() => assign(first)}>{tr("שייך")}</button>
            <button className={btnGhost} disabled={busy === first.id} onClick={() => create(first)}>➕ {tr("צור לקוח פוטנציאלי")}</button>
            <button className={btnGhost} onClick={() => post({ action: "ignore", id: first.id })}>{tr("התעלם")}</button>
            <button className={btnGhost + " text-red-600"} onClick={() => post({ action: "block", phone: p })}>⛔ {tr("חסום מספר")}</button>
          </div>
        </div>); })}</div>
    </Card>
  );
}
