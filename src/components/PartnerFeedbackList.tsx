"use client";
// PartnerFeedbackList.tsx (src/components/PartnerFeedbackList.tsx) · updated 13.10.2026 07:20 (Asia/Jerusalem) — owner view of "Ask Sapirim" notes with mark-replied toggle (used on /partners)
import { useState } from "react";
import { Badge, btnGhost } from "@/components/ui";
type Row = { id: number; at: string; partner: string; page: string; topic: string | null; message: string; replied_at: string | null };
const d = (s: string | null) => s ? new Date(s).toLocaleString("en-GB", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
export default function PartnerFeedbackList({ rows: initial }: { rows: Row[] }) {
  const [rows, setRows] = useState(initial);
  const toggle = async (r: Row) => { const on = !r.replied_at; const res = await fetch("/api/partner/feedback", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, replied: on }) }); if (res.ok) setRows(rows.map((x) => x.id === r.id ? { ...x, replied_at: on ? new Date().toISOString() : null } : x)); };
  if (!rows.length) return <div className="text-slate-400 text-sm">אין הודעות עדיין.</div>;
  return (<div className="space-y-2 text-sm">{rows.map((r) => (<div key={r.id} className={"border rounded-lg p-2 " + (r.replied_at ? "bg-slate-50" : "bg-amber-50/50 border-amber-200")}><div className="flex flex-wrap items-center gap-2 text-xs"><span className="text-slate-500" dir="ltr">{d(r.at)}</span><Badge tone="blue">{r.partner}</Badge><code className="bg-white px-1 rounded" dir="ltr">{r.page}</code>{r.topic && <Badge tone="slate">{r.topic}</Badge>}<span className="flex-1" /><button className={btnGhost + " text-xs"} onClick={() => toggle(r)}>{r.replied_at ? "✓ נענה " + d(r.replied_at) : "סמן כנענה"}</button></div><div className="mt-1 whitespace-pre-wrap" dir="auto">{r.message}</div></div>))}</div>);
}
