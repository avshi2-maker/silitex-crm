// page.tsx (src/app/(portal)/[lang]/products/page.tsx) · updated 18.10.2026 18:10 (Asia/Jerusalem) — PUBLIC PORTAL product index grouped by catalogue sector (food sector excluded)
import Link from "next/link";
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { P_PRODUCTS, P_SECTORS } from "@/portal/data";
import type { PLang } from "@/portal/config";
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/products", pt(lang, "allProducts"), pt(lang, "indIntro")); }
export default async function Products({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const t = (k: string) => pt(lang, k); const b = "/" + lang;
  return (
    <PortalPage lang={lang} path="/products" crumbs={[{ name: t("home"), url: b }, { name: t("products"), url: b + "/products" }]}>
      <h1 className="text-3xl font-bold">{t("allProducts")} ({P_PRODUCTS.length})</h1>
      {P_SECTORS.map((s) => (
        <section key={s} className="space-y-2" dir="ltr"><h2 className="text-xl font-bold">{s}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{P_PRODUCTS.filter((p) => p.sector === s).map((p) => <Link key={p.slug} href={b + "/products/" + p.slug} className="border rounded-lg p-2 hover:border-brand-500"><div className="font-medium">{p.product} <span className="text-xs text-slate-400">{p.code}</span></div><div className="text-xs text-slate-500 line-clamp-2">{p.description || p.application}</div></Link>)}</div></section>
      ))}
    </PortalPage>
  );
}
