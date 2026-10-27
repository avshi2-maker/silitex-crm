"use client";
// MeetingList.tsx (src/components/salesmeet/MeetingList.tsx) · created 27.10.2026 05:05 (Asia/Jerusalem) — v1.0.0 — 🤝 all sales meetings & calls, newest first, search, open → full summary + export
import { useMemo, useState } from "react";
import { Card, Badge, inputCls } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import { smText } from "./NewMeeting";
import { SM_KINDS, type SalesMeeting } from "@/lib/sales-meeting-types";
import { fmtDate } from "@/lib/format";
export default function MeetingList({ items }: { items: SalesMeeting[] }) {
  const [q, setQ] = useState(""); const [open, setOpen] = useState("");
  const rows = useMemo(() => items.filter((m) => !q || JSON.stringify([m.with_who, m.title, m.summary, m.notes]).toLowerCase().includes(q.toLowerCase())), [items, q]);
  return (
    <Card className="space-y-2">
      <div className="flex items-center gap-2"><b>📋 כל הפגישות והשיחות ({items.length})</b><input className={inputCls + " !w-64 ms-auto"} placeholder="חיפוש: לקוח, מוצר, מילה…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {rows.length === 0 && <div className="text-sm text-slate-500">אין עדיין פגישות.</div>}
      {rows.map((m) => { const k = SM_KINDS.find((x) => x.k === m.kind); const o = open === m.id; return (
        <div key={m.id} className="border rounded-xl p-2">
          <button className="w-full text-start flex flex-wrap items-center gap-2" onClick={() => setOpen(o ? "" : m.id)}><span className="text-sm font-bold">{fmtDate(m.held_at)}</span><span>{k?.icon} {m.with_who}</span><span className="text-sm text-slate-600 truncate">{m.title}</span><span className="ms-auto flex gap-1">{m.photo_count > 0 && <Badge>📷 {m.photo_count}</Badge>}<Badge tone="blue">{m.summary.customers?.length || 0} לקוחות</Badge><Badge tone="green">{m.applied?.tasks || 0} משימות</Badge></span></button>
          {o && <div className="mt-2 space-y-2 text-sm"><pre className="whitespace-pre-wrap font-[inherit] leading-6">{smText(m.summary, m.held_at, m.with_who, m.kind)}</pre>{m.notes && <details><summary className="cursor-pointer text-xs text-slate-500">הערות מקוריות</summary><pre className="whitespace-pre-wrap font-[inherit] text-xs">{m.notes}</pre></details>}<ExportBar title={"סיכום פגישה — " + m.with_who + " — " + fmtDate(m.held_at)} text={smText(m.summary, m.held_at, m.with_who, m.kind)} /></div>}
        </div>); })}
    </Card>
  );
}
