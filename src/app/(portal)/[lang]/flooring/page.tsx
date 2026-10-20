// page.tsx (src/app/(portal)/[lang]/flooring/page.tsx) · created 20.10.2026 16:30 (Asia/Jerusalem) — PUBLIC PORTAL: industrial epoxy flooring — Stonhard (own wording quoted), Sapirim as qualified installers, main systems, reference clients by sector (historic A.E. Sapirim Ltd list), he / en / ru.
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { STONHARD_FAMILIES, REFS, st } from "@/portal/scope";
import type { PLang } from "@/portal/config";
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/flooring", st(lang, "floor"), st(lang, "floorIntro").slice(0, 160)); }
export default async function Flooring({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const b = "/" + lang;
  return (
    <PortalPage lang={lang} path="/flooring" crumbs={[{ name: pt(lang, "home"), url: b }, { name: st(lang, "floor"), url: b + "/flooring" }]}>
      <h1 className="text-3xl font-bold">{st(lang, "floor")}</h1>
      <p className="text-slate-700 max-w-3xl text-lg">{st(lang, "floorIntro")}</p>
      <a href="https://www.stonhard.com" target="_blank" rel="noopener" className="inline-block px-4 py-2 rounded-xl bg-brand-500 text-white text-sm">{st(lang, "stonhardSite")} ↗</a>
      <section className="space-y-2">
        <h2 className="text-xl font-bold">{st(lang, "families")}</h2>
        <div className="grid md:grid-cols-3 gap-3">{STONHARD_FAMILIES.map((f) => <div key={f.name} className="rounded-2xl border p-4 bg-white"><div className="font-bold" dir="ltr">{f.name}</div><div className="text-sm text-slate-700">{f.t[lang]}</div></div>)}</div>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-bold">{st(lang, "refs")}</h2>
        <p className="text-xs text-slate-500">{st(lang, "refsNote")}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{REFS.map((g) => <div key={g.sector.en} className="rounded-2xl border p-4 bg-white space-y-1"><div className="font-bold">{g.sector[lang]}</div><ul className="text-sm text-slate-700 space-y-0.5">{(lang === "he" ? g.he : g.en).map((n) => <li key={n}>{n}</li>)}</ul></div>)}</div>
      </section>
    </PortalPage>
  );
}
