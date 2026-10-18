// page.tsx (src/app/(portal)/[lang]/faq/page.tsx) · updated 18.10.2026 18:10 (Asia/Jerusalem) — PUBLIC PORTAL FAQ (public-safe categories; answers in English from the Silitex sources) + FAQPage JSON-LD
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import JsonLd from "@/portal/components/JsonLd";
import { pt } from "@/portal/i18n";
import { meta, faqLd } from "@/portal/seo";
import { P_FAQ } from "@/portal/data";
import type { PLang } from "@/portal/config";
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/faq", pt(lang, "faq"), P_FAQ.slice(0, 5).map((f) => f.q).join(" · ")); }
export default async function Faq({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const t = (k: string) => pt(lang, k); const b = "/" + lang;
  const cats = Array.from(new Set(P_FAQ.map((f) => f.cat)));
  return (
    <PortalPage lang={lang} path="/faq" crumbs={[{ name: t("home"), url: b }, { name: t("faq"), url: b + "/faq" }]}>
      <JsonLd data={faqLd(P_FAQ.map((f) => ({ q: f.q, a: f.a })))} />
      <h1 className="text-3xl font-bold">{t("faq")}</h1>
      {cats.map((c) => (
        <section key={c} className="space-y-2" dir="ltr"><h2 className="text-xl font-bold">{c}</h2>
          {P_FAQ.filter((f) => f.cat === c).map((f) => <details key={f.n} className="border rounded-xl p-3" open><summary className="font-medium cursor-pointer">{f.q}</summary><p className="mt-2 text-slate-700">{f.a}</p><p className="text-xs text-slate-400 mt-1">{f.src}</p></details>)}</section>
      ))}
    </PortalPage>
  );
}
