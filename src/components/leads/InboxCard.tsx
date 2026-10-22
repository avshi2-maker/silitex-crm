"use client";
// InboxCard.tsx (src/components/leads/InboxCard.tsx) · updated 22.10.2026 17:00 (Asia/Jerusalem) — 🙈 hide a request (tests / junk) — saved in Supabase (hidden_at), nothing deleted; "show hidden" brings it back · 09.10.2026 18:30 (Asia/Jerusalem) — public form submissions (Supabase form_submissions) → one click = new lead
import { useEffect, useState } from "react";
import { Card, Badge, btnGhost } from "@/components/ui";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/i18n";
type Sub = { id: number; created_at: string; kind: string; company: string; name: string; email: string; phone?: string; product?: string; message?: string; fields?: Record<string, string>; hidden_at?: string | null };
type Props = { existing: string[]; onImport: (s: Sub) => void };
export default function InboxCard({ existing, onImport }: Props) {
  const { t: tr } = useLang();
  const [items, setItems] = useState<Sub[]>([]); const [note, setNote] = useState(""); const [showHidden, setShowHidden] = useState(false);
  useEffect(() => { fetch("/api/forms").then((r) => r.json()).then((j) => { setItems((j.items || []).filter((s: Sub) => s.kind !== "survey")); if (j.note) setNote(j.note); }).catch(() => setNote("offline")); }, []);
  const hide = async (s: Sub, hidden: boolean) => {
    setItems((x) => x.map((y) => y.id === s.id ? { ...y, hidden_at: hidden ? new Date().toISOString() : null } : y));
    await fetch("/api/forms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: s.id, hidden }) }).catch(() => {});
  };
  const fresh = items.filter((s) => !existing.some((n) => n.toLowerCase() === (s.company || "").toLowerCase()));
  const hiddenN = fresh.filter((s) => s.hidden_at).length; const list = fresh.filter((s) => showHidden || !s.hidden_at);
  if (note) return <Card className="text-xs text-slate-400">{tr("תיבת פניות מהאתר: דורשת Supabase (form_submissions). כרגע הטפסים מגיעים במייל בלבד.")}</Card>;
  if (fresh.length === 0) return null;
  return (
    <Card>
      <div className="flex items-center gap-2 mb-2"><h3 className="font-bold flex-1">{tr("פניות חדשות מהאתר")} ({fresh.length - hiddenN})</h3>{hiddenN > 0 && <button className="text-xs text-slate-500 underline" onClick={() => setShowHidden(!showHidden)}>{showHidden ? tr("הסתר את המוסתרים") : tr("הצג מוסתרים") + " (" + hiddenN + ")"}</button>}</div>
      {list.length === 0 ? <div className="text-xs text-slate-400">{tr("אין פניות חדשות")}</div> : <ul className="text-sm space-y-1">{list.slice(0, 10).map((s) => (<li key={s.id} className={"flex flex-wrap items-center gap-2 border-t pt-1" + (s.hidden_at ? " opacity-50" : "")}><Badge tone={s.kind === "sample" ? "amber" : s.kind === "price" ? "green" : "blue"}>{s.kind}</Badge><b dir="auto">{s.company}</b><span dir="auto">{s.name}</span><span className="text-slate-500">{s.phone || s.email}</span><span className="text-slate-400 text-xs">{fmtDateTime(s.created_at)}</span><span className="ms-auto flex gap-1">{s.hidden_at ? <button className={btnGhost} onClick={() => hide(s, false)}>↩ {tr("שחזר")}</button> : <button className={btnGhost} title={tr("הסתר (בדיקה / לא רלוונטי) — לא נמחק")} onClick={() => hide(s, true)}>🙈 {tr("הסתר")}</button>}<button className={btnGhost} onClick={() => onImport(s)}>{tr("+ קלוט כלקוח")}</button></span></li>))}</ul>}
    </Card>
  );
}
