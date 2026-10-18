// page.tsx (src/app/(portal)/[lang]/industries/page.tsx) · updated 18.10.2026 18:05 (Asia/Jerusalem) — PUBLIC PORTAL industries index
import Link from "next/link";
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { P_INDUSTRIES, industryRows } from "@/portal/data";
import type { PLang } from "@/portal/config";
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/industries", pt(lang, "industries"), pt(lang, "indIntro")); }
export default async function Industries({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const t = (k: string) => pt(lang, k); const b = "/" + lang;
  return (
    <PortalPage lang={lang} path="/industries" crumbs={[{ name: t("home"), url: b }, { name: t("industries"), url: b + "/industries" }]}>
      <h1 className="text-3xl font-bold">{t("industries")}</h1><p className="text-slate-700">{t("indIntro")}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{P_INDUSTRIES.map((i) => <Link key={i.key} href={b + "/industries/" + i.key} className="border rounded-xl p-4 hover:border-brand-500"><div className="font-bold">{i.name[lang]}</div><div className="text-xs text-slate-500" dir="ltr">{industryRows(i.key).slice(0, 4).map((r) => r.product).join(" · ")}</div></Link>)}</div>
    </PortalPage>
  );
}
