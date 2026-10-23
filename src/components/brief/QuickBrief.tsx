"use client";
// QuickBrief.tsx (src/components/brief/QuickBrief.tsx) · created 23.10.2026 08:30 (Asia/Jerusalem) — 📞 QUICK BRIEF on every CRM page (owner): floating 📞 button or Ctrl+K → search a customer by name (HE/EN), phone digits or website → one card to start the conversation (QuickBriefCard). The store is loaded only when the panel opens (fresh data, no stale writes). Hidden for partners and on login / public / field pages.
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PARTNER_NAME_COOKIE } from "@/lib/gate";
import { useLang } from "@/i18n";
import QuickBriefPanel from "./QuickBriefPanel";

export default function QuickBrief() {
  const { t: tr } = useLang(); const path = usePathname() || "/";
  const [show, setShow] = useState(false); const [open, setOpen] = useState(false);
  useEffect(() => {
    let partner = false; try { partner = new RegExp("(?:^|; )" + PARTNER_NAME_COOKIE + "=").test(document.cookie); } catch {}
    setShow(!partner && !/^\/(login|request|survey|notes|field|expo)/.test(path));
  }, [path]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); } if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  if (!show) return null;
  const btn = "fixed bottom-[4.5rem] left-5 z-50 w-11 h-11 rounded-full bg-brand-500 text-white shadow-lg text-lg hover:bg-brand-600 print:hidden";
  return (
    <>
      <button className={btn} title={tr("תדריך מהיר על לקוח (Ctrl+K)")} onClick={() => setOpen(true)}>📞</button>
      {open && <QuickBriefPanel onClose={() => setOpen(false)} />}
    </>
  );
}
