// page.tsx (src/app/(portal)/[lang]/alternatives/[slug]/page.tsx) · updated 26.10.2026 11:35 (Asia/Jerusalem) — v0.99.0 unverified competitor codes labelled + notice · 20.10.2026 17:55 (Asia/Jerusalem) — + Italian · 18.10.2026 18:10 — PUBLIC PORTAL family page: every competitor code (Dow, Wacker, Momentive, Shin-Etsu, Evonik, Elkem…) → Silitex equivalent, INCI, certificates, links to product pages. One page per family = the answer AI search quotes for "alternative to <code>".
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortalPage from "@/portal/components/PortalPage";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { P_FAMILIES, familyBySlug, familyProducts } from "@/portal/data";
import { PORTAL_LANGS, type PLang } from "@/portal/config";
import { TrustBanner, Unverified } from "@/components/TrustTag";
import { PORTAL_NOTE, isVerifiedProducer } from "@/lib/offsets-trust";
export const dynamicParams = false;
export function generateStaticParams() { return PORTAL_LANGS.flatMap((lang) => P_FAMILIES.map((f) => ({ lang, slug: f.slug }))); }
const H1: Record<PLang, string> = { he: "חלופה ל-", en: "Alternative to ", ru: "Аналог ", it: "Alternativa a " };
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params; const f = familyBySlug(slug); if (!f) return {};
  return meta(lang, "/alternatives/" + slug, H1[lang] + f.dow_corning.split("/")[0].trim() + " — " + f.family, f.family + ": " + f.codes.slice(0, 6).map((c) => c.code.split("/")[0].trim()).join(", ") + " → Silitex " + f.silitex_product.split(" - ")[0] + ". INCI: " + f.inci);
}
export default async function Family({ params }: { params: Promise<{ lang: PLang; slug: string }> }) {
  const { lang, slug } = await params; const f = familyBySlug(slug); if (!f) notFound();
  const t = (k: string) => pt(lang, k); const b = "/" + lang; const prods = familyProducts(f);
  const certs = [f.kosher && !/^no/i.test(f.kosher) && "Kosher: " + f.kosher, f.fda && !/^no/i.test(f.fda) && "FDA: " + f.fda, f.eco_certs && !/^n\/?a/i.test(f.eco_certs) && f.eco_certs].filter(Boolean) as string[];
  return (
    <PortalPage lang={lang} path={"/alternatives/" + slug} crumbs={[{ name: t("home"), url: b }, { name: t("alternatives"), url: b + "/alternatives" }, { name: f.family, url: b + "/alternatives/" + slug }]}>
      <h1 className="text-3xl font-bold">{H1[lang]}<span dir="ltr">{f.dow_corning.split("/")[0].trim()}</span></h1>
      <p className="text-slate-700"><b dir="ltr">{f.family}</b> · {t("altIntro")}</p>
      <section className="rounded-2xl border-2 border-brand-200 p-4 space-y-1" dir="ltr"><div className="text-xs text-slate-500">{t("silitexEq")}</div><div className="text-xl font-bold text-brand-700">{f.silitex_product}</div><div className="text-sm">{t("inci")}: {f.inci}</div>{certs.length > 0 && <div className="text-sm">{t("certs")}: {certs.join(" · ")}</div>}</section>
      <section className="space-y-2"><h2 className="text-xl font-bold mb-2">{t("competitorCodes")}</h2><TrustBanner lang={lang} text={PORTAL_NOTE[lang]} />
        <table className="w-full text-sm border" dir="ltr"><tbody>{f.codes.map((c) => <tr key={c.producer} className="border-t first:border-t-0"><th className="text-left bg-slate-50 p-2 w-64 font-medium">{c.producer}</th><td className="p-2">{c.code}{!isVerifiedProducer(c.producer) && <> <Unverified lang={lang} /></>}</td></tr>)}</tbody></table></section>
      {prods.length > 0 && <section><h2 className="text-xl font-bold mb-2">{t("products")}</h2><div className="flex flex-wrap gap-2">{prods.map((p) => <Link key={p.slug} href={b + "/products/" + p.slug} className="px-3 py-1.5 rounded-full border hover:border-brand-500" dir="ltr">{p.product}{p.code && " · " + p.code}</Link>)}</div></section>}
    </PortalPage>
  );
}
