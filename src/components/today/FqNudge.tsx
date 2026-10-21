"use client";
// FqNudge.tsx (src/components/today/FqNudge.tsx) · created 21.10.2026 17:10 (Asia/Jerusalem) — "My day" ticker for the Friday report to Federica: open Silitex questions, blockers, oldest waiting, days to Friday; turns gold on Friday ("time to send").
import { useEffect, useState } from "react";
import Link from "next/link";
import { isOpen, daysOpen, nextFriday, type Fq } from "@/lib/fq-types";
export default function FqNudge() {
  const [items, setItems] = useState<Fq[] | null>(null);
  useEffect(() => { fetch("/api/federica", { cache: "no-store" }).then((r) => r.json()).then((j) => setItems(j.items || null)).catch(() => {}); }, []);
  if (!items) return null;
  const open = items.filter((f) => f.party === "silitex" && isOpen(f)); const bl = open.filter((f) => f.prio === "blocker").length; const old = open.reduce((m, f) => Math.max(m, daysOpen(f)), 0);
  const toFri = Math.round((nextFriday().getTime() - Date.now()) / 864e5); const fri = toFri === 0;
  return (
    <Link href="/federica" className={"flex flex-wrap items-center gap-3 rounded-xl border-2 px-4 py-2 text-sm hover:shadow " + (fri ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white")}>
      <span className="font-bold">📮 {fri ? "היום שישי — לשלוח דוח לפדריקה" : "דוח שישי לפדריקה בעוד " + toFri + " ימים"}</span>
      <span>🔴 {bl} חוסמים</span><span>· {open.length} שאלות פתוחות</span><span>· הוותיקה {old} ימים</span><span className="ms-auto text-brand-700">פתח ›</span>
    </Link>
  );
}
