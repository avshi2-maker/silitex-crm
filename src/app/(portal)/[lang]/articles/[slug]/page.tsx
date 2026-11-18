// page.tsx (src/app/(portal)/[lang]/articles/[slug]/page.tsx) · created 18.11.2026 14:45 (Asia/Jerusalem) — v1.20.0 📰 one Hub article on the PUBLIC PORTAL: H1 + body + Article (+ FAQPage) JSON-LD
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PortalPage from "@/portal/components/PortalPage";
import JsonLd from "@/portal/components/JsonLd";
import { PORTAL_URL, type PLang } from "@/portal/config";
import { getArticle, dmy } from "@/portal/hubArticles";

type P = { params: Promise<{ lang: PLang; slug: string }> };
export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() { return []; }
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params; const a = await getArticle(slug);
  if (!a) return { title: "מאמר לא נמצא" };
  const url = `${PORTAL_URL}/he/articles/${a.slug}`;
  return { title: `${a.title} · ספירים`, description: a.description || undefined, alternates: { canonical: url }, openGraph: { type: "article", title: a.title, description: a.description || undefined, url, siteName: "Sapirim", locale: "he_IL" } };
}
const PROSE = "text-slate-800 leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-5 [&_p]:mt-3 [&_ul]:list-disc [&_ul]:ps-6 [&_ul]:mt-3 [&_ol]:list-decimal [&_ol]:ps-6 [&_li]:mt-1 [&_a]:underline [&_blockquote]:border-s-4 [&_blockquote]:ps-4 [&_blockquote]:my-4 [&_table]:my-4 [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_img]:my-4 [&_img]:rounded-xl";
export default async function Article({ params }: P) {
  const { lang, slug } = await params; if (lang !== "he") notFound();
  const a = await getArticle(slug); if (!a) notFound();
  const url = `${PORTAL_URL}/he/articles/${a.slug}`;
  const ld: object[] = [{ "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.description || undefined, inLanguage: "he", datePublished: a.published_at, dateModified: a.updated_at, mainEntityOfPage: url, author: { "@type": "Person", name: "אבשלום ספיר" }, publisher: { "@type": "Organization", name: "Sapirim", url: PORTAL_URL } }];
  if (a.faq?.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", inLanguage: "he", mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  return (
    <PortalPage lang={lang} path={`/articles/${a.slug}`} crumbs={[{ name: "בית", url: "/he" }, { name: "מאמרים", url: "/he/articles" }, { name: a.title, url: `/he/articles/${a.slug}` }]}>
      <JsonLd data={ld} />
      <Link href="/he/articles" className="text-sm underline">← כל המאמרים</Link>
      <h1 className="text-3xl font-bold">{a.title}</h1>
      <div className="text-xs text-slate-500">{dmy(a.published_at)}</div>
      <div className={PROSE} dangerouslySetInnerHTML={{ __html: a.body_html }} />
    </PortalPage>
  );
}
