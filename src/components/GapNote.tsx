"use client";
// GapNote.tsx (src/components/GapNote.tsx) · updated 12.10.2026 13:40 (Asia/Jerusalem) — "not in Silitex catalogue" answer: matches the search against data/gaps.json; otherwise a clear no-match + routes to Ask Silitex / add-gap request
import Link from "next/link";
import { Card, Badge, btnGhost } from "@/components/ui";
import { useLang } from "@/i18n";
import gaps from "@/data/gaps.json";
type Gap = { id: string; query: string; aliases: string[]; what: string; producers: string; silitex: string; history?: string; action: string; status: string; added: string };
const GAPS = gaps as Gap[];
export const findGap = (q: string) => { const s = q.trim().toLowerCase(); if (s.length < 3) return undefined; return GAPS.find((g) => g.query.toLowerCase().includes(s) || s.includes(g.query.toLowerCase()) || g.aliases.some((a) => a.toLowerCase().includes(s) || s.includes(a.toLowerCase()))); };
export default function GapNote({ q, rows }: { q: string; rows: number }) {
  const { t: tr } = useLang(); const g = findGap(q);
  if (g) return (
    <Card className={(g.status === "partial" ? "border-amber-200 bg-amber-50/40" : "border-red-200 bg-red-50/40") + " space-y-1 text-sm"}>
      <div className="flex flex-wrap items-center gap-2">{g.status === "partial" ? <Badge tone="amber">🟡 {tr("חלקי — Silitex מכסה חלק")}</Badge> : <Badge tone="red">⛔ {tr("לא בקטלוג Silitex")}</Badge>}<b>{g.query}</b><span className="text-xs text-slate-500">{g.id} · {g.added} · {g.status}</span></div>
      <div><b>{tr("מה זה:")}</b> {g.what}</div>
      <div><b>{tr("מי מייצר:")}</b> <span dir="ltr">{g.producers}</span></div>
      <div><b>Silitex:</b> {g.silitex}</div>
      {g.history && <div><b>{tr("היסטוריה:")}</b> {g.history}</div>}
      <div className="p-2 rounded-lg bg-white border border-red-200"><b>▶ {tr("פעולה:")}</b> {g.action}</div>
    </Card>);
  if (q.trim().length >= 3 && rows === 0) return (
    <Card className="border-amber-200 bg-amber-50/40 text-sm flex flex-wrap items-center gap-2">
      <span>⚠️ <b>{tr("אין התאמה ב-37 הקטגוריות")}</b> — {tr("או שזה שם מסחרי שלא ברשימה, או שזה מוצר ש-Silitex לא מייצרת.")}</span>
      <Link href={"/ask?q=" + encodeURIComponent("Does Silitex have an equivalent to " + q.trim() + "? If not, what is the closest product and what does the molecule do?")} className={btnGhost + " text-xs"}>🤖 {tr("שאל את Silitex")}</Link>
      <span className="text-xs text-slate-500">{tr("אם Silitex לא מייצרת — בקש להוסיף ל\"פערים\" (gaps.json) כדי שיעלה בפגישה עם Silitex.")}</span>
    </Card>);
  return null;
}
