"use client";
// RowActions.tsx (src/components/leads/RowActions.tsx) · updated 09.10.2026 19:05 (Asia/Jerusalem) — ✏️ edit (opens lead file) + 🗑️ delete with inline two-step confirm (no browser dialog)
import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/i18n";
type Props = { id: string; name: string; onDelete: () => void; hideEdit?: boolean };
export default function RowActions({ id, name, onDelete, hideEdit }: Props) {
  const { t: tr } = useLang(); const [arm, setArm] = useState(false);
  const btn = "text-xs px-2 py-1 rounded-lg border bg-white hover:bg-slate-50 whitespace-nowrap";
  return (
    <span className="inline-flex gap-1 items-center">
      {!hideEdit && <Link href={"/leads/" + id} className={btn}>{tr("✏️ ערוך")}</Link>}
      {!arm && <button className={btn} title={tr("למחוק את") + " " + name + "?"} onClick={() => { setArm(true); setTimeout(() => setArm(false), 4000); }}>🗑️</button>}
      {arm && <button className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white whitespace-nowrap" onClick={onDelete}>{tr("כן, מחק")} {name.slice(0, 18)}</button>}
    </span>
  );
}
