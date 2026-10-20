// page.tsx (src/app/(portal)/[lang]/match/page.tsx) · created 20.10.2026 18:30 (Asia/Jerusalem) — PUBLIC PORTAL: free match report (lead magnet) — what you get, 4 steps, the form; he / en / ru / it.
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import MatchForm from "@/portal/components/MatchForm";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { P_INDUSTRIES } from "@/portal/data";
import { MT } from "@/portal/match";
import type { PLang } from "@/portal/config";
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/match", MT.title[lang], MT.intro[lang].slice(0, 160)); }
export default async function Match({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const b = "/" + lang;
  return (
    <PortalPage lang={lang} path="/match" crumbs={[{ name: pt(lang, "home"), url: b }, { name: MT.nav[lang], url: b + "/match" }]}>
      <div className="rounded-2xl bg-ink-900 text-white p-6 space-y-3">
        <h1 className="text-3xl font-extrabold">{MT.title[lang]}</h1>
        <p className="text-slate-200 text-lg leading-relaxed max-w-4xl">{MT.intro[lang]}</p>
        <div className="text-amber-300 font-semibold">{MT.steps[lang]}</div>
      </div>
      <MatchForm lang={lang} industries={P_INDUSTRIES.map((i) => ({ key: i.key, name: i.name[lang] }))} />
    </PortalPage>
  );
}
