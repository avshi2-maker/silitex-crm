// page.tsx (src/app/(portal)/[lang]/codes/[slug]/page.tsx) · updated 26.10.2026 11:35 (Asia/Jerusalem) — v0.99.0 unverified notice · 21.10.2026 11:45 (Asia/Jerusalem) — a code listed in several families shows each Silitex equivalent · created 10:40 — PUBLIC PORTAL competitor-code landing page: "<code> alternative" → Silitex family equivalent, INCI, certificates, sibling codes, sample CTA. Honest wording (equivalent to verify in the lab).
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortalPage from "@/portal/components/PortalPage";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { P_CODES, codeBySlug, CT } from "@/portal/codes";
import { familyProducts } from "@/portal/data";
import { PORTAL_LANGS, CONTACT, type PLang } from "@/portal/config";
import { TrustBanner, Unverified } from "@/components/TrustTag";
import { PORTAL_NOTE, isVerifiedProducer } from "@/lib/offsets-trust";
export const dynamicParams = false;
export function generateStaticParams() { return PORTAL_LANGS.flatMap((lang) => P_CODES.map((c) => ({ lang, slug: c.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params; const c = codeBySlug(slug); if (!c) return {};
  return meta(lang, "/codes/" + slug, CT.h1[lang] + c.code + " (" + c.producer + ") — Silitex", c.code + " · " + c.families.map((ff) => ff.family + " → Silitex " + ff.silitex_product.split(" - ")[0]).join(" · ") + ". INCI: " + c.family.inci + ". " + CT.note[lang]);
}
export default async function Code({ params }: { params: Promise<{ lang: PLang; slug: string }> }) {
  const { lang, slug } = await params; const c = codeBySlug(slug); if (!c) notFound();
  const t = (k: string) => pt(lang, k); const b = "/" + lang; const f = c.family; const prods = c.families.flatMap((ff) => familyProducts(ff)).filter((p, i, a) => a.findIndex((q) => q.slug === p.slug) === i).slice(0, 10);
  const sibs = P_CODES.filter((x) => x.slug !== c.slug && x.families.some((ff) => c.families.includes(ff))).slice(0, 24);
  const wa = "https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent((lang === "he" ? "שלום אבשי, אני מחפש חלופה ל-" : lang === "ru" ? "Здравствуйте, ищу аналог " : lang === "it" ? "Buongiorno, cerco un'alternativa a " : "Hello, I am looking for an alternative to ") + c.code);
  return (
    <PortalPage lang={lang} path={"/codes/" + slug} crumbs={[{ name: t("home"), url: b }, { name: CT.all[lang], url: b + "/codes" }, { name: c.code, url: b + "/codes/" + slug }]}>
      <h1 className="text-3xl font-bold">{CT.h1[lang]}<span dir="ltr">{c.code}</span></h1>
      <div className="text-slate-700">{CT.by[lang]}: <b dir="ltr">{c.producer}</b>{!isVerifiedProducer(c.producer) && <> <Unverified lang={lang} /></>}</div>
      {!isVerifiedProducer(c.producer) && <TrustBanner lang={lang} text={PORTAL_NOTE[lang]} />}
      {c.families.map((fam) => (
        <section key={fam.slug} className="rounded-2xl border-2 border-brand-200 bg-white/80 p-4 space-y-1" dir="ltr">
          <div className="text-xs text-slate-500">{CT.family[lang]}: <Link href={b + "/alternatives/" + fam.slug} className="underline">{fam.family}</Link> · {CT.eq[lang]}</div>
          <div className="text-xl font-bold text-brand-700">{fam.silitex_product}</div>
          <div className="text-sm">{t("inci")}: {fam.inci}</div>
        </section>))}
      <p className="text-sm text-slate-600">{CT.note[lang]}</p>
      {prods.length > 0 && <div className="flex flex-wrap gap-2">{prods.map((p) => <Link key={p.slug} href={b + "/products/" + p.slug} className="px-3 py-1.5 rounded-full border bg-white hover:border-brand-500" dir="ltr">{p.product}{p.code && " · " + p.code}</Link>)}</div>}
      <div className="flex flex-wrap gap-2">
        <a href={wa} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold">💬 {CT.sample[lang]}</a>
        <Link href={b + "/alternatives/" + f.slug} className="px-4 py-2 rounded-xl bg-ink-900 text-amber-300 font-semibold">{CT.full[lang]} ›</Link>
      </div>
      {sibs.length > 0 && <section className="space-y-2"><h2 className="text-lg font-bold">{CT.same[lang]}</h2>
        <div className="flex flex-wrap gap-2" dir="ltr">{sibs.map((x) => <Link key={x.slug} href={b + "/codes/" + x.slug} className="px-3 py-1 rounded-full border bg-white text-sm hover:border-brand-500">{x.code} <span className="text-slate-400">· {x.producer}</span></Link>)}</div></section>}
    </PortalPage>
  );
}
