"use client";
// SecurityNudge.tsx (src/components/agent/SecurityNudge.tsx) · created 16.11.2026 20:25 (Asia/Jerusalem) — v1.14.2 🚨 animated red bar on top of EVERY page while a security event
// (flood / manipulation attempt / actions to strangers removed) is not reviewed. No ✕ — it goes away only after each event is checked and closed on /agent#security.
// Checks on load, every 2 min and when the tab comes back into view.
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function SecurityNudge() {
  const [n, setN] = useState(0); const path = usePathname();
  useEffect(() => {
    const check = () => fetch("/api/agent/alerts", { cache: "no-store" }).then((r) => r.ok ? r.json() : { count: 0 }).then((j) => setN(Number(j.count) || 0)).catch(() => {});
    check(); const t = setInterval(check, 120_000); const v = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", v); window.addEventListener("silitex-security", check);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", v); window.removeEventListener("silitex-security", check); };
  }, [path]);
  if (!n) return null;
  return (
    <div className="sticky top-0 z-50 -mx-6 -mt-6 mb-4 print:hidden" role="alert" aria-live="assertive">
      <style>{"@keyframes sx-shake{0%,92%,100%{transform:translateX(0)}94%{transform:translateX(-6px)}96%{transform:translateX(6px)}98%{transform:translateX(-4px)}}@keyframes sx-glow{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.7)}50%{box-shadow:0 0 0 10px rgba(220,38,38,0)}}"}</style>
      <Link href="/agent#security" className="flex items-center gap-3 bg-red-600 text-white px-4 py-3 font-bold text-sm md:text-base" style={{ animation: "sx-shake 3s infinite, sx-glow 1.6s infinite" }}>
        <span className="text-2xl animate-bounce" aria-hidden>🚨</span>
        <span className="flex-1">{n} אירועי אבטחה ממתינים לבדיקה — הסוכן חסם ניסיון הטעיה / הצפה. חובה לבדוק ולסגור.</span>
        <span className="bg-white text-red-700 rounded-lg px-3 py-1">בדוק עכשיו →</span>
      </Link>
    </div>
  );
}
