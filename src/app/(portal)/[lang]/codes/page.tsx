// page.tsx (src/app/(portal)/[lang]/codes/page.tsx) · created 21.10.2026 10:40 (Asia/Jerusalem) — PUBLIC PORTAL index of every competitor code page, grouped by producer (internal links for Google).
import Link from "next/link";
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import { pt } from "@/portal/i18n";
import { meta } from "@/portal/seo";
import { P_CODES, PRODUCERS, CT } from "@/portal/codes";
import { PORTAL_LANGS, type PLang } from "@/portal/config";
export const dynamicParams = false;
export function generateStaticParams() { return PORTAL_LANGS.map((lang) => ({ lang })); }
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/codes", CT.title[lang], CT.intro[lang] + " " + P_CODES.slice(0, 20).map((c) => c.code).join(", ")); }
export default async function Codes({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const b = "/" + lang; const t = (k: string) => pt(lang, k);
  return (
    <PortalPage lang={lang} path="/codes" crumbs={[{ name: t("home"), url: b }, { name: CT.title[lang], url: b + "/codes" }]}>
      <h1 className="text-3xl font-bold">{CT.title[lang]} ({P_CODES.length})</h1>
      <p className="text-slate-700">{CT.intro[lang]}</p>
      {PRODUCERS.map((p) => (
        <section key={p} className="space-y-2"><h2 className="text-xl font-bold" dir="ltr">{p}</h2>
          <div className="flex flex-wrap gap-2" dir="ltr">{P_CODES.filter((c) => c.producer === p).map((c) => <Link key={c.slug} href={b + "/codes/" + c.slug} className="px-3 py-1.5 rounded-full border bg-white text-sm hover:border-brand-500">{c.code}</Link>)}</div>
        </section>))}
    </PortalPage>
  );
}
