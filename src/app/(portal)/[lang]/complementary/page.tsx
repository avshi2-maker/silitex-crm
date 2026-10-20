// page.tsx (src/app/(portal)/[lang]/complementary/page.tsx) · created 20.10.2026 16:30 (Asia/Jerusalem) — PUBLIC PORTAL: Silitex complementary silicone-free ranges (antifoams, fluids, demulsifiers, water polymers, cationic softeners, waxes, detergents, plant-based) with links to the producer's pages, he / en / ru.
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { COMPLEMENTARY, st } from "@/portal/scope";
import type { PLang } from "@/portal/config";
import { L } from "@/portal/it";
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/complementary", st(lang, "comp"), st(lang, "compIntro")); }
export default async function Complementary({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const b = "/" + lang;
  return (
    <PortalPage lang={lang} path="/complementary" crumbs={[{ name: pt(lang, "home"), url: b }, { name: st(lang, "comp"), url: b + "/complementary" }]}>
      <h1 className="text-3xl font-bold">{st(lang, "comp")}</h1>
      <p className="text-slate-600 max-w-3xl">{st(lang, "compIntro")}</p>
      <div className="grid md:grid-cols-2 gap-4">
        {COMPLEMENTARY.map((r) => (
          <section key={r.key} className="rounded-2xl border p-5 bg-white space-y-2">
            <h2 className="text-xl font-bold">{L(r.name, lang)}</h2>
            <p className="text-slate-700">{L(r.text, lang)}</p>
            <ul className="text-sm font-mono text-slate-600 space-y-0.5" dir="ltr">{r.items.map((x) => <li key={x}>{x}</li>)}</ul>
            <a href={r.url} target="_blank" rel="noopener" className="text-sm text-brand-600 underline">{st(lang, "producer")} ↗</a>
          </section>))}
      </div>
    </PortalPage>
  );
}
