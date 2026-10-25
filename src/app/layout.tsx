// layout.tsx (src/app/layout.tsx) · updated 18.10.2026 18:15 — CRM frame moved to AppShell (public portal renders without it) · 07:55 — apple home-screen icon + web-app mode · 18.10.2026 07:10 — main min-w-0 (no sideways overflow on phones) · 16.10.2026 09:35 — + OwnerNote 📝 bubble (owner only) · 13.10.2026 07:20 — + AskSapirim floating button (partners only) (Asia/Jerusalem)
import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import MailtoOutlook from "@/components/MailtoOutlook";
import { LangProvider } from "@/i18n";
export const metadata: Metadata = { title: "Silitex CRM · Israel", description: "Silitex S.r.l. — Israel distribution CRM", icons: { icon: "/favicon.png", apple: "/field-icon-192.png" }, appleWebApp: { capable: false, title: "Silitex", statusBarStyle: "black" } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head><link rel="preconnect" href="https://fonts.googleapis.com" /><link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&display=swap" rel="stylesheet" /></head>
      <body>
        <LangProvider>
          <AppShell>{children}</AppShell>
          <MailtoOutlook />
        </LangProvider>
      </body>
    </html>
  );
}
