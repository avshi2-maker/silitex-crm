"use client";
// Nav.tsx (src/components/Nav.tsx) · updated 13.10.2026 06:40 — partner mode: Silitex staff see knowledge items only + confidentiality footer (Asia/Jerusalem)
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OWNER } from "@/config/app";
import LangSwitch from "./LangSwitch";
import Clock from "./Clock";
import VersionStamp from "./VersionStamp";
import { useLang } from "@/i18n";
import { useEffect, useState } from "react";
import { PARTNER_NAME_COOKIE, isPartnerPath } from "@/lib/gate";
const ITEMS = [
  { href: "/", he: "לוח בקרה", icon: "📊" },
  { href: "/pitch", he: "הצעת הפצה (Pitch)", icon: "🏁" },
  { href: "/notes", he: "טלפרומפטר (הערות דובר)", icon: "🎙️" },
  { href: "/team", he: "הצוות ותהליך המכירה", icon: "👥" },
  { href: "/ask", he: "שאל את Silitex", icon: "🔎" },
  { href: "/products", he: "קטלוג מוצרים", icon: "🧪" },
  { href: "/offsets", he: "מקבילות עולמיות", icon: "🌍" },
  { href: "/market", he: "מנוע פיתוח שוק", icon: "🧭" },
  { href: "/market/gaps", he: "נספח פערים (לפגישה)", icon: "⛔" },
  { href: "/partners", he: "שותפים — שימוש Silitex", icon: "🤝" },
  { href: "/leads", he: "לקוחות פוטנציאליים", icon: "🏭" },
  { href: "/pipeline", he: "צנרת מכירות", icon: "🧭" },
  { href: "/schedule", he: "יומן יומי/שבועי", icon: "📅" },
  { href: "/logistics", he: "לוגיסטיקה ומשלוחים", icon: "🚢" },
  { href: "/hub", he: "Silitex Hub — התכתבויות", icon: "📬" },
  { href: "/campaign", he: "קמפיין", icon: "🚀" },
  { href: "/sniper", he: "Offset Sniper", icon: "🎯" },
  { href: "/brief", he: "תדריך יומי (בוט)", icon: "🤖" },
  { href: "/faq", he: "50 שאלות ותשובות", icon: "❓" },
  { href: "/formulations", he: "נוסחאות ומקרי בוחן", icon: "🧴" },
  { href: "/kb", he: "מאגר ידע (RAG)", icon: "📚" },
  { href: "/satisfaction", he: "שביעות רצון והמלצות", icon: "⭐" },
  { href: "/report", he: "דוח ליצרן", icon: "📑" },
];
export default function Nav() {
  const { t: tr } = useLang();
  const path = usePathname();
  const [partner, setPartner] = useState("");
  useEffect(() => { try { const m = document.cookie.match(new RegExp("(?:^|; )" + PARTNER_NAME_COOKIE + "=([^;]*)")); setPartner(m ? decodeURIComponent(m[1]) : ""); } catch {} }, [path]);
  if (path.startsWith("/request") || path.startsWith("/survey") || path.startsWith("/notes") || path.startsWith("/login")) return null;
  return (
    <aside className="w-60 shrink-0 bg-ink-900 text-white min-h-screen p-4 print:hidden">
      <div className="mb-6">
        <Link href="/" className="bg-white rounded-lg px-2 py-1 mb-2 inline-block"><img src="/silitex-logo.png" alt="Silitex" className="h-9" /></Link>
        <div className="text-sm font-bold">{partner ? tr("Silitex knowledge tools") : "Silitex CRM · Israel"}</div>
        {partner && <div className="text-[11px] text-amber-300">{tr("Partner access")} · {partner} · {tr("read-only")}</div>}
        <div className="flex items-center justify-between"><div className="text-xs text-slate-300">{tr("הפצה רשמית · ישראל")}</div><LangSwitch /></div>
        <div className="mt-3"><Clock /><VersionStamp /></div>
      </div>
      <nav className="flex flex-col gap-1">
        {partner && <Link href="/partner" className={"flex items-center gap-2 px-3 py-2 rounded-lg text-sm " + (path === "/partner" ? "bg-brand-500" : "hover:bg-ink-700")}><span>🤝</span><span>{tr("Partner home")}</span></Link>}
        {(partner ? ITEMS.filter((it) => isPartnerPath(it.href)) : ITEMS).map((it) => {
          const active = it.href === "/" ? path === "/" : it.href === "/market" ? path === "/market" : path.startsWith(it.href);
          const cls = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm " + (active ? "bg-brand-500" : "hover:bg-ink-700");
          return (<Link key={it.href} href={it.href} className={cls}><span>{it.icon}</span><span>{tr(it.he)}</span></Link>);
        })}
      </nav>
      <div className="mt-8 text-[11px] text-slate-300 leading-5">
        {partner && <div className="mb-2 text-amber-200">{tr("Prepared by Sapirim for Silitex S.r.l. — confidential. Do not forward outside Silitex.")}</div>}
        {tr(OWNER.name)} · {OWNER.phone}<br />Silitex S.r.l. — Italy · <button className="underline" onClick={() => fetch("/api/login", { method: "DELETE" }).then(() => (window.location.href = "/login"))}>🔒</button>
      </div>
    </aside>
  );
}
