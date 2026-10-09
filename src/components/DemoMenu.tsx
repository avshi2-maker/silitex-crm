"use client";
// DemoMenu.tsx (src/components/DemoMenu.tsx) · updated 09.10.2026 12:30 (Asia/Jerusalem) — ⚙ presentation controls: load demo state, reset, copy EN demo link
import { useEffect, useState } from "react";
import { useLang } from "@/i18n";
import { btnGhost } from "./ui";
type Props = { demo?: boolean; onLoad: () => void; onReset: () => void };
export default function DemoMenu({ demo, onLoad, onReset }: Props) {
  const { t: tr } = useLang(); const [open, setOpen] = useState(false); const [copied, setCopied] = useState(false);
  useEffect(() => { try { if (new URLSearchParams(window.location.search).get("demo") === "1" && !demo) onLoad(); } catch {} // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const copy = () => { const u = window.location.origin + "/pitch?lang=en&demo=1"; navigator.clipboard?.writeText(u); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="relative print:hidden">
      <button className={btnGhost} onClick={() => setOpen((v) => !v)} title="Presentation">⚙ {demo && <span className="text-emerald-600">●</span>}</button>
      {open && (<div className="absolute end-0 mt-1 bg-white border rounded-xl shadow-lg p-2 w-64 z-20 text-sm space-y-1">
        <button className="w-full text-start px-2 py-1 rounded hover:bg-slate-50" onClick={() => { onLoad(); setOpen(false); }}>▶ {tr("טען מצב הדגמה (צנרת חיה)")}</button>
        <button className="w-full text-start px-2 py-1 rounded hover:bg-slate-50" onClick={copy}>🔗 {copied ? tr("הועתק") : tr("העתק קישור הדגמה (EN)")}</button>
        <button className="w-full text-start px-2 py-1 rounded hover:bg-slate-50 text-red-600" onClick={() => { if (confirm(tr("לאפס את כל הנתונים המקומיים?"))) { onReset(); setOpen(false); } }}>↺ {tr("איפוס נתונים")}</button>
      </div>)}
    </div>
  );
}
