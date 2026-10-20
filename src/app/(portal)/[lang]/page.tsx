// page.tsx (src/app/(portal)/[lang]/page.tsx) · updated 20.10.2026 18:40 (Asia/Jerusalem) — finder: free-text example chip · 18:30 — free match report banner · 18.10.2026 18:05 — PUBLIC PORTAL home: who we are, competitor-code finder, industries grid, regulation teaser, latest FAQ.
import Link from "next/link";
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import CodeFinder from "@/portal/components/CodeFinder";
const NEED_EX: Record<string, string> = { he: "קרם הגנה לשמש", en: "sunscreen cream", ru: "солнцезащитный крем", it: "crema solare" };
import { MT } from "@/portal/match";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { P_INDUSTRIES, P_FAMILIES, P_PRODUCTS } from "@/portal/data";
import type { PLang } from "@/portal/config";
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "", pt(lang, "brand"), pt(lang, "tagline")); }
export default async function Home({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const t = (k: string) => pt(lang, k); const b = "/" + lang;
  return (
    <PortalPage lang={lang} path="">
      <section className="space-y-2"><h1 className="text-3xl font-bold">{t("brand")}</h1><p className="text-lg text-slate-700">{t("tagline")}</p>
        <p className="text-sm text-slate-500">{P_PRODUCTS.length} {t("products")} · {P_FAMILIES.length} {t("alternatives")} · {P_INDUSTRIES.length} {t("industries")}</p></section>
      <Link href={"/" + lang + "/match"} className="block rounded-2xl bg-ink-900 text-white p-5 hover:ring-4 ring-amber-400"><div className="text-2xl font-extrabold text-amber-300">{MT.nav[lang]}</div><div className="text-slate-200 mt-1">{MT.title[lang]} — {MT.steps[lang]}</div></Link>
      <CodeFinder lang={lang} title={t("finder")} hint={t("finderHint")} none={t("finderNone")} examples={["DOWSIL 1520", "Dow Corning 556", "SILFOAM SE 47", "BELSIL", "TEGO Antifoam", NEED_EX[lang]]} />
      <section className="space-y-3"><h2 className="text-2xl font-bold">{t("industries")}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{P_INDUSTRIES.map((i) => <Link key={i.key} href={b + "/industries/" + i.key} className="border rounded-xl p-4 hover:border-brand-500 font-medium">{i.name[lang]} ›</Link>)}</div></section>
      <section className="rounded-2xl border p-4 space-y-1"><h2 className="text-xl font-bold"><Link href={b + "/regulation"} className="hover:underline">⚖️ {t("regulation")}</Link></h2><p className="text-slate-700">{t("regIntro")}</p></section>
    </PortalPage>
  );
}
