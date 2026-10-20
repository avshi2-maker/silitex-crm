// PortalPage.tsx (src/portal/components/PortalPage.tsx) · updated 20.10.2026 16:30 (Asia/Jerusalem) — + complementary (silicone-free) + flooring nav · 13:50 — + "Sapirim Group" nav item (activities + AI portfolio) · 18.10.2026 18:00 — PUBLIC PORTAL page frame (server): header with nav + language switch (same page in he/en/ru), breadcrumbs, content, contact call-to-action, footer, Organization JSON-LD.
import Link from "next/link";
import type { ReactNode } from "react";
import { PORTAL_LANGS, CONTACT, type PLang } from "../config";
import { pt } from "../i18n";
import { orgLd, crumbsLd } from "../seo";
import { gt } from "../group";
import { st } from "../scope";
import JsonLd from "./JsonLd";
const LN: Record<PLang, string> = { he: "עב", en: "EN", ru: "RU" };
export default function PortalPage({ lang, path, crumbs, children }: { lang: PLang; path: string; crumbs?: { name: string; url: string }[]; children: ReactNode }) {
  const t = (k: string) => pt(lang, k); const base = "/" + lang;
  const nav: [string, string][] = [["", "home"], ["/industries", "industries"], ["/alternatives", "alternatives"], ["/products", "products"], ["/faq", "faq"], ["/regulation", "regulation"]];
  const wa = "https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent(lang === "he" ? "שלום אבשי, הגעתי מהאתר — " : lang === "ru" ? "Здравствуйте, Авши! Пишу с сайта — " : "Hello Avshi, I found you on the website — ");
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <JsonLd data={crumbs?.length ? [orgLd(), crumbsLd(crumbs)] : orgLd()} />
      <header className="bg-ink-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Link href={base} className="font-bold text-lg">Sapirim<span className="font-normal opacity-70 text-sm"> · {t("brand").split("—")[1]?.trim()}</span></Link>
          <nav className="flex flex-wrap gap-3 text-sm opacity-90 flex-1">{nav.slice(1).map(([p, k]) => <Link key={k} href={base + p} className="hover:underline">{t(k)}</Link>)}<Link href={base + "/complementary"} className="hover:underline">{st(lang, "comp").split("—")[0].trim()}</Link><Link href={base + "/flooring"} className="hover:underline">{st(lang, "floor").split("—")[0].trim()}</Link><Link href={base + "/group"} className="hover:underline font-semibold">{gt(lang, "group")}</Link></nav>
          <div className="flex gap-1 text-xs" aria-label={t("lang")}>{PORTAL_LANGS.map((l) => <Link key={l} href={"/" + l + path} hrefLang={l} className={"px-2 py-0.5 rounded " + (l === lang ? "bg-brand-500" : "opacity-80 hover:opacity-100")}>{LN[l]}</Link>)}</div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
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
      <footer className="border-t mt-6">
        <div className="max-w-6xl mx-auto px-4 py-5 text-sm text-slate-500 space-y-1">
          <div><b>{t("about")}:</b> {t("aboutText")}</div>
          <div className="text-xs">{t("disclaimer")}</div>
          <div className="text-xs">© Sapirim · {lang === "he" ? CONTACT.nameHe : CONTACT.name} · {CONTACT.phone}</div>
        </div>
      </footer>
    </div>
  );
}
