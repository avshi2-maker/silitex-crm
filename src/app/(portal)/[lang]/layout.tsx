// layout.tsx (src/app/(portal)/[lang]/layout.tsx) · updated 18.10.2026 18:05 (Asia/Jerusalem) — PUBLIC PORTAL language wrapper: only he / en / ru exist (anything else is 404); sets text direction and language for the whole page.
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PORTAL_LANGS, isPLang, dirOf } from "@/portal/config";
export const dynamicParams = false;
export function generateStaticParams() { return PORTAL_LANGS.map((lang) => ({ lang })); }
export default async function PortalLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params; if (!isPLang(lang)) notFound();
  return <div lang={lang} dir={dirOf(lang)} className="portal">{children}</div>;
}
