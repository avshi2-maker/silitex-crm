// page.tsx (src/app/(portal)/[lang]/alternatives/page.tsx) · updated 26.10.2026 11:35 (Asia/Jerusalem) — v0.99.0 unverified-codes notice · updated 21.10.2026 10:55 (Asia/Jerusalem) — link to the competitor-code pages · 20.10.2026 18:40 — finder: free-text example chip · 18.10.2026 18:10 — PUBLIC PORTAL alternatives index: code finder + all 37 product families with the Dow code and the Silitex equivalent
import Link from "next/link";
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import CodeFinder from "@/portal/components/CodeFinder";
const NEED_EX: Record<string, string> = { he: "קרם הגנה לשמש", en: "sunscreen cream", ru: "солнцезащитный крем", it: "crema solare" };
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { P_FAMILIES } from "@/portal/data";
import type { PLang } from "@/portal/config";
import { TrustBanner } from "@/components/TrustTag";
import { PORTAL_NOTE } from "@/lib/offsets-trust";
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/alternatives", pt(lang, "alternatives"), pt(lang, "altIntro")); }
export default async function Alternatives({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const t = (k: string) => pt(lang, k); const b = "/" + lang;
  return (
    <PortalPage lang={lang} path="/alternatives" crumbs={[{ name: t("home"), url: b }, { name: t("alternatives"), url: b + "/alternatives" }]}>
      <h1 className="text-3xl font-bold">{t("alternatives")}</h1><p className="text-slate-700">{t("altIntro")}</p>
      <TrustBanner lang={lang} text={PORTAL_NOTE[lang]} />
      <Link href={"/" + lang + "/codes"} className="inline-block text-brand-700 underline font-semibold">🔢 {lang === "he" ? "כל קודי המתחרים — דף לכל קוד" : lang === "ru" ? "Все коды конкурентов — страница на каждый код" : lang === "it" ? "Tutti i codici dei concorrenti — una pagina per codice" : "All competitor codes — one page per code"} ›</Link>
      <CodeFinder lang={lang} title={t("finder")} hint={t("finderHint")} none={t("finderNone")} examples={["DOWSIL 1520", "Dow Corning 556", "SILFOAM SE 47", NEED_EX[lang]]} />
      <div className="overflow-x-auto"><table className="w-full text-sm border" dir="ltr"><thead className="bg-slate-50"><tr><th className="p-2 text-left">Family</th><th className="p-2 text-left">Dow / DOWSIL / XIAMETER</th><th className="p-2 text-left">{t("silitexEq")}</th></tr></thead>
        <tbody>{P_FAMILIES.map((f) => <tr key={f.slug} className="border-t align-top"><td className="p-2"><Link href={b + "/alternatives/" + f.slug} className="text-brand-700 underline font-medium">{f.family}</Link></td><td className="p-2">{f.dow_corning}</td><td className="p-2">{f.silitex_product.split(" - ")[0]}</td></tr>)}</tbody></table></div>
    </PortalPage>
  );
}
