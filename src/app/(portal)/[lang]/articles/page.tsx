// page.tsx (src/app/(portal)/[lang]/articles/page.tsx) · created 18.11.2026 14:45 (Asia/Jerusalem) — v1.20.0 📰 PUBLIC PORTAL מאמרים (Hebrew): Hub articles + the D4/D5/D6 2027 article
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PortalPage from "@/portal/components/PortalPage";
import { meta } from "@/portal/seo";
import type { PLang } from "@/portal/config";
import { listArticles, dmy } from "@/portal/hubArticles";

export const revalidate = 300;
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/articles", "מאמרים", "מאמרים מקצועיים על סיליקונים לתעשייה, אמולסיות, נוגדי קצף ופתרונות ייצור — ספירים."); }
export default async function Articles({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; if (lang !== "he") notFound();
  const items = await listArticles();
  return (
    <PortalPage lang={lang} path="/articles" crumbs={[{ name: "בית", url: "/he" }, { name: "מאמרים", url: "/he/articles" }]}>
      <h1 className="text-3xl font-bold">מאמרים</h1>
      <ul className="space-y-3">
        {items.map((a) => <li key={a.slug} className="border rounded-xl p-4 bg-white/70"><Link href={`/he/articles/${a.slug}`} className="block"><h2 className="text-xl font-bold hover:underline">{a.title}</h2>{a.description && <p className="text-slate-700 mt-1">{a.description}</p>}<span className="text-xs text-slate-500">{dmy(a.published_at)}</span></Link></li>)}
        <li className="border rounded-xl p-4 bg-white/70"><Link href="/he/articles/d4-d5-d6-2027" className="block"><h2 className="text-xl font-bold hover:underline">D4 / D5 / D6 — הרגולציה החדשה של 2027</h2><p className="text-slate-700 mt-1">מה משתנה בסילוקסנים הציקליים ואיך להיערך.</p></Link></li>
      </ul>
    </PortalPage>
  );
}
