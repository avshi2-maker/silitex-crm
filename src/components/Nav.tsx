"use client";
// Nav.tsx (src/components/Nav.tsx) · updated 18.10.2026 19:10 — + /visibility AI bot · 18:40 — + /he public portal draft · 17:25 — + /studio Post Studio · 12:00 — hidden on /expo too · 18.10.2026 07:35 — + /mobile apps (QR install, pinned 5th) · 18.10.2026 07:05 — + /capture field inbox (pinned 4th) · + /field mobile field mode (pinned 3rd, sidebar hidden there) · 17.10.2026 08:20 — + /today "My day" pinned under Dashboard · 16.10.2026 18:25 — + owner link /meetings (Meetings online — Silitex, English label) · + owner links: Silitex partner view (/partner) and Israel portal preview (/partner/preview) · 15.10.2026 14:30 — items sorted A→Z by the label in the current language (HE/EN/IT), Dashboard pinned on top · 13.10.2026 06:40 — partner mode: Silitex staff see knowledge items only + confidentiality footer (Asia/Jerusalem)
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
  { href: "/today", he: "היום שלי", icon: "☀️" },
  { href: "/field", he: "מצב שטח (נייד)", icon: "📱" },
  { href: "/capture", he: "תיבת שטח (עיבוד במשרד)", icon: "📥" },
  { href: "/mobile", he: "אפליקציות נייד", icon: "📲" },
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
  { href: "/studio", he: "סטודיו פוסטים", icon: "✍️" },
  { href: "/he", he: "פורטל ספירים — טיוטה (לא ציבורי)", icon: "🌐", owner: true },
  { href: "/visibility", he: "נראות ב-AI", icon: "📡", owner: true },
  { href: "/sniper", he: "Offset Sniper", icon: "🎯" },
  { href: "/brief", he: "תדריך יומי (בוט)", icon: "🤖" },
  { href: "/faq", he: "50 שאלות ותשובות", icon: "❓" },
  { href: "/formulations", he: "נוסחאות ומקרי בוחן", icon: "🧴" },
  { href: "/kb", he: "מאגר ידע (RAG)", icon: "📚" },
  { href: "/satisfaction", he: "שביעות רצון והמלצות", icon: "⭐" },
  { href: "/report", he: "דוח ליצרן", icon: "📑" },
  { href: "/meetings", he: "Meetings online — Silitex", icon: "🗓️", owner: true },
  { href: "/partner", he: "תצוגת שותף Silitex (מה פדריקה רואה)", icon: "👁️", owner: true },
  { href: "/partner/preview", he: "פורטל ישראל — תצוגה מקדימה (שלב 2)", icon: "🇮🇱", owner: true },
];
export default function Nav() {
  const { t: tr, lang } = useLang();
  const path = usePathname();
  const sorted = [ITEMS[0], ITEMS[1], ITEMS[2], ITEMS[3], ITEMS[4], ...ITEMS.slice(5).sort((a, b) => tr(a.he).localeCompare(tr(b.he), lang, { sensitivity: "base", numeric: true }))];
  const [partner, setPartner] = useState("");
  useEffect(() => { try { const m = document.cookie.match(new RegExp("(?:^|; )" + PARTNER_NAME_COOKIE + "=([^;]*)")); setPartner(m ? decodeURIComponent(m[1]) : ""); } catch {} }, [path]);
  if (path.startsWith("/request") || path.startsWith("/survey") || path.startsWith("/notes") || path.startsWith("/login") || path.startsWith("/field") || path.startsWith("/expo")) return null;
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
        {(partner ? sorted.filter((it) => isPartnerPath(it.href) && !(it as { owner?: boolean }).owner) : sorted).map((it) => {
          const active = it.href === "/" ? path === "/" : it.href === "/market" || it.href === "/partner" ? path === it.href : path.startsWith(it.href);
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
