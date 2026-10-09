"use client";
// InboxCard.tsx (src/components/leads/InboxCard.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — public form submissions (Supabase form_submissions) → one click = new lead
import { useEffect, useState } from "react";
import { Card, Badge, btnGhost } from "@/components/ui";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/i18n";
type Sub = { id: number; created_at: string; kind: string; company: string; name: string; email: string; phone?: string; product?: string; message?: string; fields?: Record<string, string> };
type Props = { existing: string[]; onImport: (s: Sub) => void };
export default function InboxCard({ existing, onImport }: Props) {
  const { t: tr } = useLang();
  const [items, setItems] = useState<Sub[]>([]); const [note, setNote] = useState("");
  useEffect(() => { fetch("/api/forms").then((r) => r.json()).then((j) => { setItems((j.items || []).filter((s: Sub) => s.kind !== "survey")); if (j.note) setNote(j.note); }).catch(() => setNote("offline")); }, []);
  const fresh = items.filter((s) => !existing.some((n) => n.toLowerCase() === (s.company || "").toLowerCase()));
  if (note) return <Card className="text-xs text-slate-400">{tr("תיבת פניות מהאתר: דורשת Supabase (form_submissions). כרגע הטפסים מגיעים במייל בלבד.")}</Card>;
  if (fresh.length === 0) return null;
  return (
    <Card>
      <h3 className="font-bold mb-2">{tr("פניות חדשות מהאתר")} ({fresh.length})</h3>
      <ul className="text-sm space-y-1">{fresh.slice(0, 10).map((s) => (<li key={s.id} className="flex flex-wrap items-center gap-2 border-t pt-1"><Badge tone={s.kind === "sample" ? "amber" : s.kind === "price" ? "green" : "blue"}>{s.kind}</Badge><b>{s.company}</b><span>{s.name}</span><span className="text-slate-500">{s.phone || s.email}</span><span className="text-slate-400 text-xs">{fmtDateTime(s.created_at)}</span><button className={btnGhost + " ms-auto"} onClick={() => onImport(s)}>{tr("+ קלוט כלקוח")}</button></li>))}</ul>
    </Card>
  );
}
