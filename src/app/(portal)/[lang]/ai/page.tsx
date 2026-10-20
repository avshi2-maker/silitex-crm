// page.tsx (src/app/(portal)/[lang]/ai/page.tsx) · updated 20.10.2026 17:40 — Facebook / LinkedIn buttons · created 13:50 (Asia/Jerusalem) — PUBLIC PORTAL: AI solution architect — intro + portfolio of systems built (business apps only, client names anonymised) grouped by field, in he / en / ru.
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { APPS, AI_INTRO, gt } from "@/portal/group";
import { CONTACT, type PLang } from "@/portal/config";
import { L } from "@/portal/it";
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/ai", gt(lang, "ai"), L(AI_INTRO, lang).slice(0, 160)); }
export default async function Ai({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const b = "/" + lang;
  const fields = Array.from(new Set(APPS.map((a) => L(a.field, lang))));
  return (
    <PortalPage lang={lang} path="/ai" crumbs={[{ name: pt(lang, "home"), url: b }, { name: gt(lang, "group"), url: b + "/group" }, { name: gt(lang, "ai"), url: b + "/ai" }]}>
      <h1 className="text-3xl font-bold">🤖 {gt(lang, "ai")}</h1>
      <p className="text-slate-700 max-w-3xl text-lg">{L(AI_INTRO, lang)}</p>
      <div className="text-sm text-slate-500">{APPS.length} {gt(lang, "apps")} · {gt(lang, "anon")}</div>
      {fields.map((f) => (
        <section key={f} className="space-y-2">
          <h2 className="text-xl font-bold">{f}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {APPS.filter((a) => L(a.field, lang) === f).map((a) => (
              <div key={a.name.en} className="rounded-2xl border p-4 bg-white space-y-1">
                <h3 className="font-bold">{L(a.name, lang)}</h3>
                <p className="text-sm text-slate-700">{L(a.text, lang)}</p>
                <div className="text-xs text-slate-400" dir="ltr">{a.stack}</div>
                {a.live && <a href={a.live} target="_blank" rel="noopener" className="text-sm text-brand-600 underline">{gt(lang, "live")} ↗</a>}
              </div>))}
          </div>
        </section>))}
      <p className="text-lg font-medium">{gt(lang, "talk")}</p>
      <div className="flex flex-wrap gap-2">{CONTACT.facebookAi && <a href={CONTACT.facebookAi} target="_blank" rel="noopener" className="px-4 py-2 rounded-xl bg-[#1877F2] text-white text-sm">{gt(lang, "fbPage")} ↗</a>}{CONTACT.linkedin && <a href={CONTACT.linkedin} target="_blank" rel="noopener" className="px-4 py-2 rounded-xl bg-[#0A66C2] text-white text-sm">LinkedIn ↗</a>}</div>
    </PortalPage>
  );
}
