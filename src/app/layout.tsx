// layout.tsx (src/app/layout.tsx) · updated 09.10.2026 10:30 (Asia/Jerusalem)
import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { BUILD } from "@/config/app";
import { LangProvider } from "@/i18n";
export const metadata: Metadata = { title: "Silitex CRM — הפצה ומכירות", description: "CRM לקידום מוצרי Silitex בישראל" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head><link rel="preconnect" href="https://fonts.googleapis.com" /><link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&display=swap" rel="stylesheet" /></head>
      <body>
        <LangProvider>
        <div className="flex min-h-screen">
          <Nav />
          <main className="flex-1 p-6 max-w-[1400px]">
            {children}
            <footer className="mt-10 text-[11px] text-slate-400 print:hidden">Silitex CRM {BUILD} · mockup</footer>
          </main>
        </div>
        </LangProvider>
      </body>
    </html>
  );
}
