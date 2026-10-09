"use client";
// BackLink.tsx (src/components/BackLink.tsx) · updated 09.10.2026 13:40 (Asia/Jerusalem) — "← Dashboard" on every page except the dashboard itself
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/i18n";
export default function BackLink() {
  const path = usePathname(); const { t: tr, lang } = useLang();
  if (path === "/" || path.startsWith("/request") || path.startsWith("/survey")) return null;
  return <Link href={"/" + (lang === "en" ? "?lang=en" : "")} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 mb-1 print:hidden"><span>{lang === "en" ? "←" : "→"}</span>{tr("חזרה ללוח הבקרה")}</Link>;
}
