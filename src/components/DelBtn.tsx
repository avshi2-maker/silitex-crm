"use client";
// DelBtn.tsx (src/components/DelBtn.tsx) · updated 22.10.2026 08:40 (Asia/Jerusalem) — all UI text through tr() (EN / IT / RU) · 19.10.2026 12:05 (Asia/Jerusalem) — 🗑️ two-tap delete for garbage data across the site: first tap asks "מחק?", second tap deletes, ✕ cancels.
import { useState } from "react";
import { useLang } from "@/i18n";
export default function DelBtn({ onDelete, title = "מחק" }: { onDelete: () => void; title?: string }) {
  const { t: tr } = useLang();
  const [ask, setAsk] = useState(false);
  return ask
    ? <span className="inline-flex items-center gap-1"><button className="px-2 py-0.5 rounded bg-red-600 text-white text-xs" onClick={() => { setAsk(false); onDelete(); }}>{tr("מחק")}</button><button className="px-1.5 py-0.5 rounded border text-xs bg-white" onClick={() => setAsk(false)}>✕</button></span>
    : <button className="text-slate-400 hover:text-red-600 text-xs px-1" title={tr(title)} onClick={() => setAsk(true)}>🗑️</button>;
}
