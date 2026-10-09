"use client";
// Nav.tsx (src/components/Nav.tsx) · updated 09.10.2026 10:30 (Asia/Jerusalem)
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OWNER } from "@/config/app";
import LangSwitch from "./LangSwitch";
import { useLang } from "@/i18n";
const ITEMS = [
  { href: "/", he: "לוח בקרה", icon: "📊" },
  { href: "/products", he: "קטלוג מוצרים", icon: "🧪" },
  { href: "/offsets", he: "מקבילות עולמיות", icon: "🌍" },
  { href: "/leads", he: "לקוחות פוטנציאליים", icon: "🏭" },
  { href: "/pipeline", he: "צנרת מכירות", icon: "🧭" },
  { href: "/schedule", he: "יומן יומי/שבועי", icon: "📅" },
  { href: "/campaign", he: "קמפיין", icon: "🚀" },
  { href: "/sniper", he: "Offset Sniper", icon: "🎯" },
  { href: "/brief", he: "תדריך יומי (בוט)", icon: "🤖" },
  { href: "/kb", he: "מאגר ידע (RAG)", icon: "📚" },
];
export default function Nav() {
  const { t: tr } = useLang();
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-brand-900 text-white min-h-screen p-4 print:hidden">
      <div className="mb-6">
        <div className="text-lg font-bold">Silitex CRM</div>
        <div className="flex items-center justify-between"><div className="text-xs text-blue-200">{tr("הפצה רשמית · ישראל")}</div><LangSwitch /></div>
      </div>
      <nav className="flex flex-col gap-1">
        {ITEMS.map((it) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          const cls = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm " + (active ? "bg-brand-500" : "hover:bg-brand-700");
          return (<Link key={it.href} href={it.href} className={cls}><span>{it.icon}</span><span>{tr(it.he)}</span></Link>);
        })}
      </nav>
      <div className="mt-8 text-[11px] text-blue-200 leading-5">
        {tr(OWNER.name)} · {OWNER.phone}<br />Silitex S.r.l. — Italy
      </div>
    </aside>
  );
}
