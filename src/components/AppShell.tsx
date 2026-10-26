"use client";
// AppShell.tsx (src/components/AppShell.tsx) · updated 26.10.2026 05:50 (Asia/Jerusalem) — /outlook-callback renders bare (Microsoft sign-in popup) · 24.10.2026 06:00 — loads radar-added industries on start · 23.10.2026 08:30 — + 📞 QuickBrief (Ctrl+K customer brief) · 06:55 — + ScanPulse (live server-scan signal + timer on every page) · 22.10.2026 17:20 (Asia/Jerusalem) — + SaveToast (green save echo on every page) · 18.10.2026 18:15 (Asia/Jerusalem) — CRM frame (sidebar, floating notes, footer) around every page — EXCEPT the public portal (/he /en /ru), which renders bare with its own header/footer.
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Nav from "./Nav";
import AskSapirim from "./AskSapirim";
import OwnerNote from "./OwnerNote";
import SaveToast from "./SaveToast";
import ScanPulse from "./ScanPulse";
import QuickBrief from "./brief/QuickBrief";
import { BUILD } from "@/config/app";
import { PORTAL_PATH } from "@/portal/config";
import { useEffect } from "react";
import { refreshExtra } from "@/lib/industries-extra";
export default function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname() || "/";
  useEffect(() => { if (!PORTAL_PATH.test(window.location.pathname)) refreshExtra(); }, []); // 🛰️ radar-added industries → every pick-list
  if (PORTAL_PATH.test(path) || path.startsWith("/outlook-callback")) return <>{children}</>;
  return (
    <div className="flex min-h-screen">
      <Nav />
      <AskSapirim />
      <OwnerNote />
      <SaveToast />
      <ScanPulse />
      <QuickBrief />
      <main className="flex-1 min-w-0 p-6 max-w-[1400px]">
        {children}
        <footer className="mt-10 text-[11px] text-slate-400 print:hidden">Silitex CRM {BUILD} · mockup</footer>
      </main>
    </div>
  );
}
