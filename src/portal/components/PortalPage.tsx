// PortalPage.tsx (src/portal/components/PortalPage.tsx) · updated 20.10.2026 18:15 (Asia/Jerusalem) — NEW badge on regulation + 2027 announcement pop-up · 18:05 — header re-laid: brand right + bigger, menu centred with wider spacing, clock / version / language on the left · 17:55 — + IT language, version stamp, "back to home" button on every page · 17:40 — light-gold background, live clock + date in header, flooring moved into Sapirim Group (bigger gold link), LinkedIn in footer · 16:30 — + complementary (silicone-free) + flooring nav · 13:50 — + "Sapirim Group" nav item (activities + AI portfolio) · 18.10.2026 18:00 — PUBLIC PORTAL page frame (server): header with nav + language switch (same page in he/en/ru), breadcrumbs, content, contact call-to-action, footer, Organization JSON-LD.
import Link from "next/link";
import type { ReactNode } from "react";
import { PORTAL_LANGS, CONTACT, type PLang } from "../config";
import { pt } from "../i18n";
import { orgLd, crumbsLd } from "../seo";
import { gt } from "../group";
import { st } from "../scope";
import JsonLd from "./JsonLd";
import PortalClock from "./PortalClock";
import RegPopup from "./RegPopup";
import { POP } from "../reg2027";
import { APP_VERSION } from "@/config/app";
const BACK: Record<PLang, string> = {"he": "← חזרה לדף הבית", "en": "← Back to home", "ru": "← На главную", "it": "← Torna alla home"};
const LN: Record<PLang, string> = { he: "עב", en: "EN", ru: "RU", it: "IT" };
export default function PortalPage({ lang, path, crumbs, children }: { lang: PLang; path: string; crumbs?: { name: string; url: string }[]; children: ReactNode }) {
  const t = (k: string) => pt(lang, k); const base = "/" + lang;
  const nav: [string, string][] = [["", "home"], ["/industries", "industries"], ["/alternatives", "alternatives"], ["/products", "products"], ["/faq", "faq"], ["/regulation", "regulation"]];
  const wa = "https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent(lang === "he" ? "שלום אבשי, הגעתי מהאתר — " : lang === "ru" ? "Здравствуйте, Авши! Пишу с сайта — " : lang === "it" ? "Buongiorno Avshi, vi ho trovato sul sito — " : "Hello Avshi, I found you on the website — ");
  return (
    <div className="min-h-screen text-slate-900" style={{ background: "#FBF5E4" }}>
      <JsonLd data={crumbs?.length ? [orgLd(), crumbsLd(crumbs)] : orgLd()} />
      <header className="bg-ink-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
          <Link href={base} className="font-extrabold text-2xl leading-tight shrink-0">Sapirim<span className="block font-medium text-base text-amber-300">{t("brand").split("—")[1]?.trim()}</span></Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[15px] opacity-95 flex-1 min-w-0">{nav.slice(1).map(([p, k]) => <Link key={k} href={base + p} className="hover:underline">{t(k)}{k === "regulation" && <sup className="ms-1 rounded bg-amber-400 text-ink-900 text-[10px] font-extrabold px-1.5 py-0.5 animate-pulse">{POP.badge[lang]}</sup>}</Link>)}<Link href={base + "/complementary"} className="hover:underline">{st(lang, "comp").split("—")[0].trim()}</Link><Link href={base + "/group"} className="px-3 py-1 rounded-full bg-amber-400 text-ink-900 font-bold text-base hover:bg-amber-300">{gt(lang, "group")}</Link></nav>
          <div className="flex items-center gap-3 shrink-0">
            <PortalClock />
            <span className="text-[11px] font-mono opacity-60" dir="ltr" title="version">{APP_VERSION}</span>
            <div className="flex gap-1 text-xs" aria-label={t("lang")}>{PORTAL_LANGS.map((l) => <Link key={l} href={"/" + l + path} hrefLang={l} className={"px-2 py-0.5 rounded " + (l === lang ? "bg-brand-500" : "opacity-80 hover:opacity-100")}>{LN[l]}</Link>)}</div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {path !== "" && <Link href={base} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-ink-900 text-amber-300 text-sm font-semibold hover:bg-ink-700">{BACK[lang]}</Link>}
        {crumbs && crumbs.length > 1 && <div className="text-xs text-slate-500 flex flex-wrap gap-1">{crumbs.map((c, i) => <span key={c.url}>{i > 0 && " › "}{i < crumbs.length - 1 ? <Link href={c.url} className="hover:underline">{c.name}</Link> : c.name}</span>)}</div>}
        {children}
        <section className="rounded-2xl bg-brand-50 border border-brand-200 p-5 space-y-3">
          <h2 className="text-xl font-bold">{t("cta")}</h2>
          <p className="text-slate-700">{t("ctaText")}</p>
          <div className="flex flex-wrap gap-2">
            <a href={wa} className="px-4 py-2 rounded-xl bg-green-600 text-white font-medium" rel="nofollow">💬 {t("wa")} {CONTACT.phone}</a>
            <a href={"mailto:" + CONTACT.email} className="px-4 py-2 rounded-xl border bg-white">✉️ {CONTACT.email}</a>
            <a href={"/request?lang=" + lang} className="px-4 py-2 rounded-xl border bg-white">📝 {t("form")}</a>
          </div>
        </section>
      </main>
      <RegPopup lang={lang} path={path} />
      <footer className="border-t mt-6">
        <div className="max-w-6xl mx-auto px-4 py-5 text-sm text-slate-500 space-y-1">
          <div><b>{t("about")}:</b> {t("aboutText")}</div>
          <div className="text-xs">{t("disclaimer")}</div>
          <div className="text-xs flex flex-wrap items-center gap-2">© Sapirim · {lang === "he" ? CONTACT.nameHe : CONTACT.name} · {CONTACT.phone}{CONTACT.linkedin && <a href={CONTACT.linkedin} target="_blank" rel="noopener" className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0A66C2] text-white font-semibold">in LinkedIn</a>}{CONTACT.facebookAi && <a href={CONTACT.facebookAi} target="_blank" rel="noopener" className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1877F2] text-white font-semibold">Facebook — AI</a>}</div>
        </div>
      </footer>
    </div>
  );
}
