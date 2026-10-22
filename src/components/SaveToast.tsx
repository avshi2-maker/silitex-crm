"use client";
// SaveToast.tsx (src/components/SaveToast.tsx) · created 22.10.2026 17:20 (Asia/Jerusalem) — CRM-wide save echo: green "✓ נשמר בהצלחה" after every save (any form / button on any page), amber when kept on the device offline, red when the cloud refused. Shown only right after YOUR click / Enter (background scan updates stay silent); several writes from one click = one toast.
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n";
import { SAVE_EVENT, type SaveStatus } from "@/lib/save-signal";
const RANK: Record<SaveStatus, number> = { ok: 0, deleted: 1, queued: 2, err: 3 };
const STYLE: Record<SaveStatus, string> = { ok: "bg-emerald-600", deleted: "bg-emerald-600", queued: "bg-amber-500", err: "bg-red-600" };
const TEXT: Record<SaveStatus, string> = { ok: "✓ נשמר בהצלחה", deleted: "✓ נמחק", queued: "⏳ נשמר במכשיר — יסונכרן כשיחזור חיבור", err: "✗ השמירה נכשלה" };
export default function SaveToast() {
  const { t: tr } = useLang();
  const [shown, setShown] = useState<{ status: SaveStatus; detail: string } | null>(null);
  const lastUser = useRef(0); const pending = useRef<{ status: SaveStatus; detail: string } | null>(null);
  const flushT = useRef<ReturnType<typeof setTimeout> | null>(null); const hideT = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const mark = (e: Event) => { if (e.type !== "keydown" || (e as KeyboardEvent).key === "Enter") lastUser.current = Date.now(); };
    const onSave = (e: Event) => {
      const d = (e as CustomEvent<{ status: SaveStatus; detail: string }>).detail; if (!d) return;
      if (d.status !== "err" && Date.now() - lastUser.current > 8000) return;
      if (!pending.current || RANK[d.status] > RANK[pending.current.status]) pending.current = d;
      if (flushT.current) clearTimeout(flushT.current);
      flushT.current = setTimeout(() => {
        const p = pending.current; pending.current = null; if (!p) return;
        setShown(p); if (hideT.current) clearTimeout(hideT.current);
        hideT.current = setTimeout(() => setShown(null), p.status === "err" ? 6000 : 2500);
      }, 350);
    };
    window.addEventListener("pointerdown", mark, true); window.addEventListener("keydown", mark, true); window.addEventListener(SAVE_EVENT, onSave);
    return () => { window.removeEventListener("pointerdown", mark, true); window.removeEventListener("keydown", mark, true); window.removeEventListener(SAVE_EVENT, onSave); };
  }, []);
  if (!shown) return null;
  const cls = "fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium print:hidden " + STYLE[shown.status];
  return (
    <div role="status" aria-live="polite" className={cls} onClick={() => setShown(null)}>
      {tr(TEXT[shown.status])}{shown.status === "err" && shown.detail ? " — " + shown.detail : ""}
    </div>
  );
}
