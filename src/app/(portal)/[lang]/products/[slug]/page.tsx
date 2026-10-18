// page.tsx (src/app/(portal)/[lang]/products/[slug]/page.tsx) · updated 18.10.2026 18:10 (Asia/Jerusalem) — PUBLIC PORTAL product page: description, technical data table, catalogue PDF link, Product JSON-LD
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortalPage from "@/portal/components/PortalPage";
import SpecTable from "@/portal/components/SpecTable";
import JsonLd from "@/portal/components/JsonLd";
import { pt } from "@/portal/i18n";
import { meta, productLd } from "@/portal/seo";
import { P_PRODUCTS, productBySlug } from "@/portal/data";
import { PORTAL_LANGS, type PLang } from "@/portal/config";
export const dynamicParams = false;
export function generateStaticParams() { return PORTAL_LANGS.flatMap((lang) => P_PRODUCTS.map((p) => ({ lang, slug: p.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params; const p = productBySlug(slug); if (!p) return {};
  return meta(lang, "/products/" + slug, p.product + (p.code ? " (" + p.code + ")" : "") + " — " + p.section, [p.description, p.application, p.inci && "INCI: " + p.inci, p.active_pct && "Active " + p.active_pct + "%"].filter(Boolean).join(". "));
}
export default async function Product({ params }: { params: Promise<{ lang: PLang; slug: string }> }) {
  const { lang, slug } = await params; const p = productBySlug(slug); if (!p) notFound();
  const t = (k: string) => pt(lang, k); const b = "/" + lang; const url = b + "/products/" + slug;
  return (
    <PortalPage lang={lang} path={"/products/" + slug} crumbs={[{ name: t("home"), url: b }, { name: t("products"), url: b + "/products" }, { name: p.product, url }]}>
      <JsonLd data={productLd(p, url)} />
      <div dir="ltr" className="space-y-3"><h1 className="text-3xl font-bold">{p.product} {p.code && <span className="text-lg text-slate-400">{p.code}</span>}</h1>
        <p className="text-lg text-slate-700">{p.description}</p></div>
      <section><h2 className="text-xl font-bold mb-2">{t("spec")}</h2><SpecTable p={p} lang={lang} /></section>
      <p className="text-xs text-slate-500">{t("source")} {p.sector} {p.edition}{p.pdf && <> · <a href={"/catalogues/" + p.pdf} className="underline" rel="nofollow">{t("tds")}</a></>}</p>
    </PortalPage>
  );
}
