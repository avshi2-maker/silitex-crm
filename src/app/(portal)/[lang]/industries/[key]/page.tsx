// page.tsx (src/app/(portal)/[lang]/industries/[key]/page.tsx) · updated 18.10.2026 18:35 (Asia/Jerusalem) — phone layout — PUBLIC PORTAL industry page: typical questions + matching Silitex products (catalogue 2026) with key data and links
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortalPage from "@/portal/components/PortalPage";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { P_INDUSTRIES, industryRows, industryQuestions, productSlugFor } from "@/portal/data";
import { PORTAL_LANGS, type PLang } from "@/portal/config";
export const dynamicParams = false;
export function generateStaticParams() { return PORTAL_LANGS.flatMap((lang) => P_INDUSTRIES.map((i) => ({ lang, key: i.key }))); }
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang; key: string }> }): Promise<Metadata> {
  const { lang, key } = await params; const i = P_INDUSTRIES.find((x) => x.key === key); if (!i) return {};
  return meta(lang, "/industries/" + key, i.name[lang], i.name[lang] + " — " + industryRows(key).slice(0, 6).map((r) => r.product).join(", ") + ". " + pt(lang, "indIntro"));
}
export default async function Industry({ params }: { params: Promise<{ lang: PLang; key: string }> }) {
  const { lang, key } = await params; const i = P_INDUSTRIES.find((x) => x.key === key); if (!i) notFound();
  const t = (k: string) => pt(lang, k); const b = "/" + lang; const rows = industryRows(key); const qs = lang === "he" ? industryQuestions(key) : [];
  return (
    <PortalPage lang={lang} path={"/industries/" + key} crumbs={[{ name: t("home"), url: b }, { name: t("industries"), url: b + "/industries" }, { name: i.name[lang], url: b + "/industries/" + key }]}>
      <h1 className="text-3xl font-bold">{i.name[lang]}</h1><p className="text-slate-700">{t("indIntro")}</p>
      {qs.length > 0 && <section><h2 className="font-bold mb-1">{t("typicalQ")}</h2><ul className="list-disc ps-6 text-slate-700">{qs.map((q) => <li key={q}>{q}</li>)}</ul></section>}
      <div className="overflow-x-auto"><table className="w-full text-sm border" dir="ltr"><thead className="bg-slate-50"><tr><th className="p-2 text-left">Product</th><th className="p-2 text-left">Code</th><th className="p-2 text-left hidden md:table-cell">{t("inci")}</th><th className="p-2 text-left">{t("active")}</th><th className="p-2 text-left hidden md:table-cell">{t("application")}</th></tr></thead>
        <tbody>{rows.map((r) => { const s = productSlugFor(r.product); return <tr key={r.id} className="border-t align-top"><td className="p-2 font-medium">{s ? <Link href={b + "/products/" + s} className="text-brand-700 underline">{r.product}</Link> : r.product}<div className="md:hidden text-xs font-normal text-slate-500 mt-1">{r.application || r.description}</div></td><td className="p-2">{r.code}</td><td className="p-2 hidden md:table-cell">{r.inci}</td><td className="p-2">{r.active_pct && r.active_pct + "%"}</td><td className="p-2 hidden md:table-cell">{r.application || r.description}</td></tr>; })}</tbody></table></div>
    </PortalPage>
  );
}
