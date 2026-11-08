"use client";
// CorrespondenceCard.tsx (src/components/leads/CorrespondenceCard.tsx) · created 08.11.2026 13:35 (Asia/Jerusalem) — v1.7.5
// 📬 ALL correspondence of one customer in ONE list, newest first: mails / WhatsApp with the customer (in ⬅ / out ➡) +
// Silitex mails about this customer (🇮🇹) + partner (🧑‍🔬). Filter chips · click a line = full text · link to the Hub thread.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Lead, HubMsg, Thread } from "@/lib/types";

type Row = { m: HubMsg; t: Thread; side: "customer" | "silitex" | "partner" };
type F = "all" | "customer" | "silitex";
const QUOTE = /\n\s*(From:|-----\s*Original|On .{3,80} wrote:|מאת:)/i;
const sideOf = (t: Thread): Row["side"] => (t.dept === "il" ? "customer" : t.dept === "partner" ? "partner" : "silitex");
const who = (s: string) => (s || "").replace(/<[^>]+>/g, "").trim() || "—";

export default function CorrespondenceCard({ lead }: { lead: Lead }) {
  const { t: tr } = useLang();
  const [rows, setRows] = useState<Row[] | null>(null); const [f, setF] = useState<F>("all"); const [open, setOpen] = useState(""); const [all, setAll] = useState(false);
  useEffect(() => {
    fetch("/api/hub/ingest", { cache: "no-store" }).then((r) => r.json()).then((j) => {
      const ths = ((j.threads || []) as Thread[]).filter((t) => t.refs?.lead_id === lead.id); const by = new Map(ths.map((t) => [t.id, t]));
      setRows(((j.msgs || []) as HubMsg[]).filter((m) => by.has(m.thread_id)).map((m) => ({ m, t: by.get(m.thread_id) as Thread, side: sideOf(by.get(m.thread_id) as Thread) })).sort((a, b) => b.m.at.localeCompare(a.m.at)));
    }).catch(() => setRows([]));
  }, [lead.id]);
  const list = (rows || []).filter((r) => f === "all" || (f === "customer" ? r.side === "customer" : r.side !== "customer"));
  const shown = all ? list : list.slice(0, 8);
  const n = (k: F) => (rows || []).filter((r) => k === "all" || (k === "customer" ? r.side === "customer" : r.side !== "customer")).length;
  const chip = (k: F, label: string) => <button type="button" onClick={() => setF(k)} className={"text-xs px-2 py-1 rounded-full border " + (f === k ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{label} ({n(k)})</button>;
  const tag = (r: Row) => {
    const wa = r.m.source === "whatsapp" ? "📱 " : "📧 ";
    if (r.side === "customer") return r.m.direction === "in" ? <Badge tone="amber">{wa}⬅ {tr("מהלקוח")}</Badge> : <Badge tone="green">{wa}➡ {tr("ללקוח")}</Badge>;
    const s = r.side === "silitex" ? "🇮🇹 Silitex" : "🧑‍🔬 " + tr("שותף");
    return <Badge tone="blue">{wa}{s} {r.m.direction === "in" ? "⬅" : "➡"}</Badge>;
  };
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2 mb-2"><h3 className="font-bold flex-1">📬 {tr("כל ההתכתבות")}</h3>{chip("all", tr("הכל"))}{chip("customer", tr("עם הלקוח"))}{chip("silitex", "Silitex")}</div>
      {rows === null && <div className="text-sm text-slate-500">⏳ {tr("טוען…")}</div>}
      {rows !== null && list.length === 0 && <div className="text-sm text-slate-400">{tr("אין עדיין התכתבות. מייל מהלקוח (או ממך אליו) נכנס לכאן לבד מ-Outlook כשהאימייל שלו שמור בכרטיס.")}</div>}
      <ul className="divide-y">{shown.map((r) => (
        <li key={r.m.id} className="py-2">
          <button type="button" className="w-full text-start" onClick={() => setOpen(open === r.m.id ? "" : r.m.id)}>
            <div className="flex flex-wrap items-center gap-2 text-xs">{tag(r)}<span className="text-slate-500">{fmtDateTime(r.m.at)}</span><span className="text-slate-500 truncate" dir="ltr">{r.m.direction === "in" ? who(r.m.from) : "→ " + who(r.m.to)}</span></div>
            <div className="text-sm font-medium mt-0.5 truncate" dir="auto">{r.t.subject}</div>
            {open !== r.m.id && <div className="text-xs text-slate-500 truncate" dir="auto">{(r.m.body || "").split(QUOTE)[0].replace(/\s+/g, " ").slice(0, 160)}</div>}
          </button>
          {open === r.m.id && <div className="mt-1"><pre className="whitespace-pre-wrap text-sm bg-slate-50 border rounded-lg p-2 leading-6 font-[inherit] max-h-96 overflow-auto" dir="auto">{(r.m.body || "").split(QUOTE)[0].trim()}</pre><Link href={"/hub?thread=" + r.t.id} className="text-xs text-brand-600 underline">{tr("פתח את השרשור ב-Hub")}</Link></div>}
        </li>))}</ul>
      {list.length > 8 && <button type="button" className="text-xs text-brand-600 underline mt-1" onClick={() => setAll(!all)}>{all ? tr("הצג פחות") : tr("הצג הכל") + " (" + list.length + ")"}</button>}
    </Card>
  );
}
