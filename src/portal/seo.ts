// seo.ts (src/portal/seo.ts) · updated 20.10.2026 17:55 (Asia/Jerusalem) — it_IT locale · 18.10.2026 17:55 — PUBLIC PORTAL metadata: title/description, canonical on PORTAL_URL, hreflang alternates (he/en/ru + x-default), Open Graph; JSON-LD builders (Organization, Product, FAQPage, BreadcrumbList).
import type { Metadata } from "next";
import { PORTAL_URL, PORTAL_LANGS, CONTACT, type PLang } from "./config";
import { pt } from "./i18n";
export function meta(lang: PLang, path: string, title: string, description: string): Metadata {
  const url = PORTAL_URL + "/" + lang + path;
  const languages: Record<string, string> = Object.fromEntries(PORTAL_LANGS.map((l) => [l, PORTAL_URL + "/" + l + path]));
  languages["x-default"] = PORTAL_URL + "/he" + path;
  return { title: title + " · " + pt(lang, "brand"), description: description.slice(0, 300), alternates: { canonical: url, languages }, openGraph: { title, description: description.slice(0, 300), url, siteName: "Sapirim", locale: lang === "he" ? "he_IL" : lang === "ru" ? "ru_RU" : lang === "it" ? "it_IT" : "en_US", type: "website" } };
}
export const orgLd = () => ({ "@context": "https://schema.org", "@type": "Organization", name: "Sapirim", url: PORTAL_URL, email: CONTACT.email, telephone: CONTACT.phone, founder: { "@type": "Person", name: CONTACT.name }, areaServed: "IL", knowsAbout: ["silicone emulsions", "antifoams", "defoamers", "textile softeners", "water repellents", "cyclic siloxanes D4 D5 D6"] });
export const crumbsLd = (items: { name: string; url: string }[]) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: PORTAL_URL + it.url })) });
export const faqLd = (qa: { q: string; a: string }[]) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: qa.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) });
export function productLd(p: { product: string; description: string; code: string; inci: string; active_pct: string; type: string; application: string; compliance: string; sector: string }, url: string) {
  const props = [["INCI", p.inci], ["Active matter %", p.active_pct], ["Type", p.type], ["Application", p.application], ["Compliance", p.compliance]].filter(([, v]) => v).map(([name, value]) => ({ "@type": "PropertyValue", name, value }));
  return { "@context": "https://schema.org", "@type": "Product", name: p.product, sku: p.code || undefined, description: p.description || p.application, category: p.sector, brand: { "@type": "Brand", name: "Silitex" }, manufacturer: { "@type": "Organization", name: "Silitex S.r.l.", url: "https://www.silitex.it" }, url: PORTAL_URL + url, additionalProperty: props };
}
