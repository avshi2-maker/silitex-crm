"use client";
// Nav.tsx (src/components/Nav.tsx) · updated 28.10.2026 18:15 (Asia/Jerusalem) — ◀ ▶ collapse the side menu to an icon strip (more room for wide tables), remembered per browser · 28.10.2026 10:40 — + 🎪 /expo-ready Expo Ready packs for Federica (owner) · 27.10.2026 05:10 — + 🤝 sales meetings & calls (owner) · 26.10.2026 10:55 + 🧬 NuSil CareSil (owner) · 25.10.2026 04:45 — owner menu by WORK ORDER: Dashboard + 6 groups (daily routine · customers & sales · finding new customers open; knowledge · Silitex partnership · promotion & reports closed, remembered) · 🧲 renamed "חיפוש לקוחות עם Claude" · partner view unchanged · 24.10.2026 06:00 — + 🛰️ /radar industry gap radar (owner) · 22.10.2026 17:40 — + 🧲 /leads/prompt search-prompt builder (owner) · 08:05 — + 🎯 /potential analytics (owner) · 21.10.2026 17:10 — + 📮 /federica Friday report & Silitex open questions (owner) · 11:15 — + 📣 /promo promotion & Google (owner) · 20.10.2026 13:20 — + 🧭 /roadmap 6-month priorities · 12:45 — menu sorted א→ת by the Hebrew label (other languages A→Z by their own label) · 09:40 — + 🗺️ /matrix market map (Pini / Federica) · 07:10 — + 🥊 /competitors register (owner only) · 05:20 — + 🚗 /visits planner · 🔎 /scan websites · 19.10.2026 09:30 — 📥 Field inbox nudge: red counter on the menu item + pop-up when something new arrives from the phone · 18.10.2026 18:55 — + /social plan · 17:55 — Dashboard pinned, all other items A→Z by English name · 17:30 — menu sorted · 19:10 — + /visibility AI bot · 18:40 — + /he public portal draft · 17:25 — + /studio Post Studio · 12:00 — hidden on /expo too · 18.10.2026 07:35 — + /mobile apps (QR install, pinned 5th) · 18.10.2026 07:05 — + /capture field inbox (pinned 4th) · + /field mobile field mode (pinned 3rd, sidebar hidden there) · 17.10.2026 08:20 — + /today "My day" pinned under Dashboard · 16.10.2026 18:25 — + owner link /meetings (Meetings online — Silitex, English label) · + owner links: Silitex partner view (/partner) and Israel portal preview (/partner/preview) · 15.10.2026 14:30 — items sorted A→Z by the label in the current language (HE/EN/IT), Dashboard pinned on top · 13.10.2026 06:40 — partner mode: Silitex staff see knowledge items only + confidentiality footer (Asia/Jerusalem)
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OWNER } from "@/config/app";
import LangSwitch from "./LangSwitch";
import Clock from "./Clock";
import VersionStamp from "./VersionStamp";
import { useLang } from "@/i18n";
import { NAV_GROUPS, NAV_OPEN_KEY, NAV_MINI_KEY } from "@/config/nav-groups";
import { EN } from "@/i18n/en";
const enName = (he: string) => (EN[he] || he).replace(/^[^A-Za-z0-9]+/, "");
import { useEffect, useState } from "react";
import { PARTNER_NAME_COOKIE, isPartnerPath } from "@/lib/gate";
import { useInbox } from "@/lib/capture/useInbox";
const ITEMS = [
  { href: "/", he: "לוח בקרה", icon: "📊" },
  { href: "/today", he: "היום שלי", icon: "☀️" },
  { href: "/visits", he: "תכנון ביקורים", icon: "🚗" },
  { href: "/scan", he: "סריקת אתרי לקוחות", icon: "🔎" },
  { href: "/leads/prompt", he: "חיפוש לקוחות עם Claude", icon: "🧲", owner: true },
  { href: "/radar", he: "מכ״ם פערי תעשייה", icon: "🛰️", owner: true },
  { href: "/sheet", he: "דף פגישה להדפסה", icon: "🖨️", owner: true },
  { href: "/roadmap", he: "מפת דרכים — 6 חודשים", icon: "🧭", owner: true },
  { href: "/potential", he: "פוטנציאל — מי קודם", icon: "🎯", owner: true },
  { href: "/promo", he: "קידום אתר וגוגל", icon: "📣", owner: true },
  { href: "/federica", he: "דוח שבועי לפדריקה", icon: "📮", owner: true },
  { href: "/expo-ready", he: "Expo Ready — חבילות תערוכה לפדריקה", icon: "🎪", owner: true },
  { href: "/matrix", he: "מפת שוק — פיני ופדריקה", icon: "🗺️" },
  { href: "/field", he: "מצב שטח (נייד)", icon: "📱" },
  { href: "/capture", he: "תיבת שטח (עיבוד במשרד)", icon: "📥" },
  { href: "/mobile", he: "אפליקציות נייד", icon: "📲" },
  { href: "/pitch", he: "הצעת הפצה (Pitch)", icon: "🏁" },
  { href: "/notes", he: "טלפרומפטר (הערות דובר)", icon: "🎙️" },
  { href: "/team", he: "הצוות ותהליך המכירה", icon: "👥" },
  { href: "/ask", he: "שאל את Silitex", icon: "🔎" },
  { href: "/products", he: "קטלוג מוצרים", icon: "🧪" },
  { href: "/offsets", he: "מקבילות עולמיות", icon: "🌍" },
  { href: "/sales-meetings", he: "פגישות ושיחות מכירה", icon: "🤝", owner: true },
  { href: "/nusil", he: "NuSil CareSil — מעבר ל-cyclic-free", icon: "🧬", owner: true },
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
  { href: "/social", he: "תוכנית פרסום", icon: "🗓️" },
  { href: "/he", he: "פורטל ספירים — טיוטה (לא ציבורי)", icon: "🌐", owner: true },
  { href: "/visibility", he: "נראות ב-AI", icon: "📡", owner: true },
  { href: "/competitors", he: "מתחרים וערוצי הפצה", icon: "🥊", owner: true },
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
  const key = (he: string) => (lang === "he" ? he : tr(he)).replace(/^[^\p{L}\p{N}]+/u, "");
  const sorted = [ITEMS[0], ...ITEMS.slice(1).sort((a, b) => key(a.he).localeCompare(key(b.he), lang === "he" ? "he" : lang, { sensitivity: "base", numeric: true }))]; // Dashboard first, then A→Z (א→ת in Hebrew) by the label shown in the current language
  const [partner, setPartner] = useState("");
  // owner menu by work order: groups open / closed (remembered in this browser); the group holding the current page always opens
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(NAV_GROUPS.map((g) => [g.id, g.open])));
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(NAV_OPEN_KEY) || "null"); if (v && typeof v === "object") setOpen((o) => ({ ...o, ...v })); } catch {} }, []);
  const [mini, setMini] = useState(false); // ◀ ▶ icon-strip menu, remembered in this browser
  useEffect(() => { try { setMini(localStorage.getItem(NAV_MINI_KEY) === "1"); } catch {} }, []);
  const flipMini = () => setMini((m) => { const n = !m; try { localStorage.setItem(NAV_MINI_KEY, n ? "1" : "0"); } catch {} window.dispatchEvent(new Event("silitex-nav-mini")); return n; });
  const toggle = (id: string) => setOpen((o) => { const n = { ...o, [id]: !o[id] }; try { localStorage.setItem(NAV_OPEN_KEY, JSON.stringify(n)); } catch {} return n; });
  const listed = new Set(NAV_GROUPS.flatMap((g) => g.hrefs));
  const groups = NAV_GROUPS.map((g, i) => ({ ...g, items: [...g.hrefs.map((h) => ITEMS.find((it) => it.href === h)).filter((x): x is (typeof ITEMS)[number] => !!x), ...(i === NAV_GROUPS.length - 1 ? ITEMS.slice(1).filter((it) => !listed.has(it.href)) : [])] }));
  useEffect(() => { try { const m = document.cookie.match(new RegExp("(?:^|; )" + PARTNER_NAME_COOKIE + "=([^;]*)")); setPartner(m ? decodeURIComponent(m[1]) : ""); } catch {} }, [path]);
  const hidden = path.startsWith("/request") || path.startsWith("/survey") || path.startsWith("/notes") || path.startsWith("/login") || path.startsWith("/field") || path.startsWith("/expo");
  const inbox = useInbox(!partner && !hidden, path.startsWith("/capture"));
  if (path.startsWith("/request") || path.startsWith("/survey") || path.startsWith("/notes") || path.startsWith("/login") || path.startsWith("/field") || path.startsWith("/expo")) return null;
  const asideCls = "shrink-0 bg-ink-900 text-white min-h-screen print:hidden transition-all " + (mini ? "w-14 p-2" : "w-60 p-4");
  const miniBtn = "w-full mb-2 rounded-lg border border-white/20 text-xs py-1 hover:bg-ink-700";
  const arrow = lang === "he" ? (mini ? "◀" : "▶") : (mini ? "▶" : "◀"); // RTL: menu on the right — ▶ pushes it to the edge
  const isActive = (href: string) => href === "/" ? path === "/" : href === "/market" || href === "/partner" || href === "/leads" ? path === href || (href === "/leads" && /^\/leads\/(?!prompt)/.test(path)) : path.startsWith(href);
  const item = (it: (typeof ITEMS)[number]) => {
    const cls = "flex items-center gap-2 rounded-lg text-sm relative " + (mini ? "justify-center px-1 py-2 " : "px-3 py-2 ") + (isActive(it.href) ? "bg-brand-500" : "hover:bg-ink-700");
    const badge = it.href === "/capture" && inbox.count > 0 ? <span className={"ms-auto min-w-[1.4rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center" + (inbox.fresh ? " animate-pulse" : "")}>{inbox.count}</span> : null;
    if (mini) return (<Link key={it.href} href={it.href} className={cls} title={tr(it.he)}><span>{it.icon}</span>{badge && <span className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-red-500" />}</Link>);
    return (<Link key={it.href} href={it.href} className={cls}><span>{it.icon}</span><span>{tr(it.he)}</span>{badge}</Link>);
  };
  return (
    <aside className={asideCls}>
      <button type="button" onClick={flipMini} className={miniBtn} title={mini ? tr("הרחבת התפריט") : tr("כיווץ התפריט")} aria-label={mini ? "expand menu" : "collapse menu"}>{arrow}</button>
      {mini ? (
        <nav className="flex flex-col gap-1 mt-2">{partner ? sorted.filter((it) => isPartnerPath(it.href) && !(it as { owner?: boolean }).owner).map(item) : [ITEMS[0], ...groups.flatMap((g) => g.items)].map(item)}</nav>
      ) : (<>
      <div className="mb-6">
        <Link href="/" className="bg-white rounded-lg px-2 py-1 mb-2 inline-block"><img src="/silitex-logo.png" alt="Silitex" className="h-9" /></Link>
        <div className="text-sm font-bold">{partner ? tr("Silitex knowledge tools") : "Silitex CRM · Israel"}</div>
        {partner && <div className="text-[11px] text-amber-300">{tr("Partner access")} · {partner} · {tr("read-only")}</div>}
        <div className="flex items-center justify-between"><div className="text-xs text-slate-300">{tr("הפצה רשמית · ישראל")}</div><LangSwitch /></div>
        <div className="mt-3"><Clock /><VersionStamp /></div>
      </div>
      <nav className="flex flex-col gap-1">
        {partner && <Link href="/partner" className={"flex items-center gap-2 px-3 py-2 rounded-lg text-sm " + (path === "/partner" ? "bg-brand-500" : "hover:bg-ink-700")}><span>🤝</span><span>{tr("Partner home")}</span></Link>}
        {partner ? sorted.filter((it) => isPartnerPath(it.href) && !(it as { owner?: boolean }).owner).map(item) : (
          <>
            {item(ITEMS[0])}
            {groups.map((g, i) => {
              const here = g.items.some((it) => isActive(it.href)); const show = open[g.id] || here;
              const head = "mt-2 flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide " + (show ? "text-brand-100" : "text-slate-300 hover:bg-ink-700");
              return (
                <div key={g.id} className="flex flex-col gap-1">
                  <button type="button" className={head} onClick={() => toggle(g.id)} aria-expanded={show}><span>{i + 1} · {tr(g.he)}{!show && " (" + g.items.length + ")"}</span><span aria-hidden="true">{show ? "▾" : "▸"}</span></button>
                  {show && g.items.map(item)}
                </div>);
            })}
          </>
        )}
      </nav>
      {inbox.fresh && !path.startsWith("/capture") && <div className="fixed bottom-4 start-4 z-50 bg-white text-ink-900 rounded-2xl shadow-xl border-2 border-red-400 p-3 w-72 animate-bounce [animation-iteration-count:2]">
        <div className="font-bold">📥 {tr("הגיע חומר חדש מהשטח")}</div>
        <div className="text-sm text-slate-600"><span dir="ltr">{inbox.count}</span> {tr("פריטים")} · <span dir="ltr">{inbox.meetings}</span> {tr("פגישות")} — {tr("מחכים לעיבוד")}</div>
        <div className="flex gap-2 mt-2"><Link href="/capture" className="flex-1 text-center px-3 py-1.5 rounded-lg bg-brand-500 text-white text-sm">{tr("פתח תיבת שטח")}</Link><button className="px-3 py-1.5 rounded-lg border text-sm" onClick={inbox.markSeen}>{tr("אחר כך")}</button></div>
      </div>}
      <div className="mt-8 text-[11px] text-slate-300 leading-5">
        {partner && <div className="mb-2 text-amber-200">{tr("Prepared by Sapirim for Silitex S.r.l. — confidential. Do not forward outside Silitex.")}</div>}
        {tr(OWNER.name)} · {OWNER.phone}<br />Silitex S.r.l. — Italy · <button className="underline" onClick={() => fetch("/api/login", { method: "DELETE" }).then(() => (window.location.href = "/login"))}>🔒</button>
      </div>
      </>)}
    </aside>
  );
}
