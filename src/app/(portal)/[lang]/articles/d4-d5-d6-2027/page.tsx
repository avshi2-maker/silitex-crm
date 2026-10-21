// page.tsx (src/app/(portal)/[lang]/articles/d4-d5-d6-2027/page.tsx) · created 21.10.2026 10:50 (Asia/Jerusalem) — PUBLIC PORTAL article: EU D4 / D5 / D6 timeline 2020 → 2031 + how to switch + Silitex alternatives to test + free INCI checker. Article JSON-LD for Google.
import Link from "next/link";
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import JsonLd from "@/portal/components/JsonLd";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { ART, ART_PATH, ART_DATE, ART_PRODUCTS, ART_FAMILIES } from "@/portal/article-d5";
import { P_PRODUCTS, P_FAMILIES } from "@/portal/data";
import { PORTAL_LANGS, PORTAL_URL, CONTACT, type PLang } from "@/portal/config";
export const dynamicParams = false;
export function generateStaticParams() { return PORTAL_LANGS.map((lang) => ({ lang })); }
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, ART_PATH, ART[lang].title, ART[lang].lead); }
export default async function Article({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const a = ART[lang]; const b = "/" + lang; const t = (k: string) => pt(lang, k);
  const prods = P_PRODUCTS.filter((p) => ART_PRODUCTS.includes(p.slug)); const fams = P_FAMILIES.filter((f) => ART_FAMILIES.includes(f.slug));
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.lead, inLanguage: lang, datePublished: ART_DATE, dateModified: ART_DATE, author: { "@type": "Person", name: CONTACT.name }, publisher: { "@type": "Organization", name: "Sapirim", url: PORTAL_URL }, mainEntityOfPage: PORTAL_URL + b + ART_PATH };
  const wa = "https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent(lang === "he" ? "שלום אבשי, אשמח לבדיקת INCI (D4/D5/D6): " : "Hello Avshi, please check my INCI (D4/D5/D6): ");
  return (
    <PortalPage lang={lang} path={ART_PATH} crumbs={[{ name: t("home"), url: b }, { name: t("regulation"), url: b + "/regulation" }, { name: "D4 / D5 / D6 — 2027", url: b + ART_PATH }]}>
      <JsonLd data={ld} />
      <article className="space-y-5 max-w-3xl">
        <div className="text-xs text-slate-500">21/10/2026 · {lang === "he" ? CONTACT.nameHe : CONTACT.name}</div>
        <h1 className="text-3xl font-bold leading-tight">{a.title}</h1>
        <p className="text-lg text-slate-700">{a.lead}</p>
        <Link href={b + "/regulation#checker"} className="inline-block px-4 py-2 rounded-xl bg-amber-400 text-ink-900 font-bold">🔬 {a.check}</Link>
        {a.secs.map((s) => (
          <section key={s.h} className="space-y-2"><h2 className="text-xl font-bold">{s.h}</h2>
            {s.p && <p className="text-slate-800 leading-relaxed">{s.p}</p>}
            {s.li && <ul className="list-disc ps-6 space-y-1 text-slate-800">{s.li.map((x) => <li key={x}>{x}</li>)}</ul>}
          </section>))}
        <section className="space-y-2"><h2 className="text-xl font-bold">{a.alts}</h2>
          <div className="flex flex-wrap gap-2" dir="ltr">{prods.map((p) => <Link key={p.slug} href={b + "/products/" + p.slug} className="px-3 py-1.5 rounded-full border bg-white hover:border-brand-500">{p.product}{p.code && " · " + p.code}</Link>)}{fams.map((f) => <Link key={f.slug} href={b + "/alternatives/" + f.slug} className="px-3 py-1.5 rounded-full border bg-white hover:border-brand-500">{f.family}</Link>)}</div>
        </section>
        <div className="rounded-2xl bg-ink-900 text-white p-4 flex flex-wrap items-center gap-3"><span className="flex-1 min-w-[16rem]">{a.cta}</span><a href={wa} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-emerald-600 font-semibold">💬 WhatsApp</a></div>
        <p className="text-xs text-slate-500">{a.legal}</p>
      </article>
    </PortalPage>
  );
}
