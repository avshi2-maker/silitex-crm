// page.tsx (src/app/(portal)/[lang]/alternatives/page.tsx) · updated 20.10.2026 18:40 (Asia/Jerusalem) — finder: free-text example chip · 18.10.2026 18:10 — PUBLIC PORTAL alternatives index: code finder + all 37 product families with the Dow code and the Silitex equivalent
import Link from "next/link";
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import CodeFinder from "@/portal/components/CodeFinder";
const NEED_EX: Record<string, string> = { he: "קרם הגנה לשמש", en: "sunscreen cream", ru: "солнцезащитный крем", it: "crema solare" };
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { P_FAMILIES } from "@/portal/data";
import type { PLang } from "@/portal/config";
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/alternatives", pt(lang, "alternatives"), pt(lang, "altIntro")); }
export default async function Alternatives({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const t = (k: string) => pt(lang, k); const b = "/" + lang;
  return (
    <PortalPage lang={lang} path="/alternatives" crumbs={[{ name: t("home"), url: b }, { name: t("alternatives"), url: b + "/alternatives" }]}>
      <h1 className="text-3xl font-bold">{t("alternatives")}</h1><p className="text-slate-700">{t("altIntro")}</p>
      <CodeFinder lang={lang} title={t("finder")} hint={t("finderHint")} none={t("finderNone")} examples={["DOWSIL 1520", "Dow Corning 556", "SILFOAM SE 47", NEED_EX[lang]]} />
      <div className="overflow-x-auto"><table className="w-full text-sm border" dir="ltr"><thead className="bg-slate-50"><tr><th className="p-2 text-left">Family</th><th className="p-2 text-left">Dow / DOWSIL / XIAMETER</th><th className="p-2 text-left">{t("silitexEq")}</th></tr></thead>
        <tbody>{P_FAMILIES.map((f) => <tr key={f.slug} className="border-t align-top"><td className="p-2"><Link href={b + "/alternatives/" + f.slug} className="text-brand-700 underline font-medium">{f.family}</Link></td><td className="p-2">{f.dow_corning}</td><td className="p-2">{f.silitex_product.split(" - ")[0]}</td></tr>)}</tbody></table></div>
    </PortalPage>
  );
}
