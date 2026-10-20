// page.tsx (src/app/(portal)/[lang]/group/page.tsx) · updated 20.10.2026 17:40 — Facebook link on the AI card · created 13:50 (Asia/Jerusalem) — PUBLIC PORTAL: Sapirim Group — 4 activity cards (silicones = this site, Marble Art, Artfloor, AI solution architect) in he / en / ru.
import type { Metadata } from "next";
import Link from "next/link";
import PortalPage from "@/portal/components/PortalPage";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { ACTIVITIES, gt } from "@/portal/group";
import { CONTACT, type PLang } from "@/portal/config";
import { L } from "@/portal/it";
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/group", gt(lang, "group"), gt(lang, "groupIntro")); }
export default async function Group({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const b = "/" + lang;
  return (
    <PortalPage lang={lang} path="/group" crumbs={[{ name: pt(lang, "home"), url: b }, { name: gt(lang, "group"), url: b + "/group" }]}>
      <h1 className="text-3xl font-bold">{gt(lang, "group")}</h1>
      <p className="text-slate-600 max-w-3xl">{gt(lang, "groupIntro")}</p>
      <div className="grid md:grid-cols-2 gap-4">
        {ACTIVITIES.map((a) => { const href = a.url === "" ? b : a.url?.startsWith("/") ? b + a.url : a.url || b; const ext = !!a.url && a.url.startsWith("http"); return (
          <div key={a.key} className="rounded-2xl border p-5 space-y-2 bg-white">
            <div className="text-3xl">{a.icon}</div>
            <h2 className="text-xl font-bold">{L(a.name, lang)}</h2>
            <p className="text-slate-700">{L(a.text, lang)}</p>
            {ext ? <a href={href} target="_blank" rel="noopener" className="inline-block px-4 py-2 rounded-xl bg-brand-500 text-white text-sm">{L(a.cta, lang)} ↗</a> : <Link href={href} className="inline-block px-4 py-2 rounded-xl bg-brand-500 text-white text-sm">{L(a.cta, lang)}</Link>}
            {a.fb && CONTACT.facebookAi && <a href={CONTACT.facebookAi} target="_blank" rel="noopener" className="inline-block ms-2 px-4 py-2 rounded-xl bg-[#1877F2] text-white text-sm">{gt(lang, "fbPage")} ↗</a>}
          </div>); })}
      </div>
    </PortalPage>
  );
}
