"use client";
// AppShell.tsx (src/components/AppShell.tsx) · updated 23.10.2026 06:55 (Asia/Jerusalem) — + ScanPulse (live server-scan signal + timer on every page) · 22.10.2026 17:20 (Asia/Jerusalem) — + SaveToast (green save echo on every page) · 18.10.2026 18:15 (Asia/Jerusalem) — CRM frame (sidebar, floating notes, footer) around every page — EXCEPT the public portal (/he /en /ru), which renders bare with its own header/footer.
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Nav from "./Nav";
import AskSapirim from "./AskSapirim";
import OwnerNote from "./OwnerNote";
import SaveToast from "./SaveToast";
import ScanPulse from "./ScanPulse";
import { BUILD } from "@/config/app";
import { PORTAL_PATH } from "@/portal/config";
export default function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname() || "/";
  if (PORTAL_PATH.test(path)) return <>{children}</>;
  return (
    <div className="flex min-h-screen">
      <Nav />
      <AskSapirim />
      <OwnerNote />
      <SaveToast />
      <ScanPulse />
      <main className="flex-1 min-w-0 p-6 max-w-[1400px]">
        {children}
        <footer className="mt-10 text-[11px] text-slate-400 print:hidden">Silitex CRM {BUILD} · mockup</footer>
      </main>
    </div>
  );
}
