// page.tsx (src/app/(portal)/[lang]/regulation/page.tsx) · updated 21.10.2026 10:55 (Asia/Jerusalem) — link to the full 2026–2027 article · D6 rinse-off date 06/06/2026 · 20.10.2026 18:15 — + 2027 banner + INCI checker · 17:55 — + Italian · 18.10.2026 18:10 — PUBLIC PORTAL D4 / D5 / D6 explainer: the verified EU facts (same list as Post Studio), Israel status "not confirmed", what to do. FAQPage JSON-LD.
import Link from "next/link";
import type { Metadata } from "next";
import PortalPage from "@/portal/components/PortalPage";
import JsonLd from "@/portal/components/JsonLd";
import InciChecker from "@/portal/components/InciChecker";
import { POP } from "@/portal/reg2027";
import { pt } from "@/portal/i18n";
import { meta, faqLd } from "@/portal/seo";
import type { PLang } from "@/portal/config";
const FACTS: Record<PLang, [string, string][]> = {
  he: [["D4 — מותר בקוסמטיקה?", "לא. באיחוד האירופי D4 אסור במוצרי קוסמטיקה (נספח II לתקנת הקוסמטיקה)."], ["D5 במוצרים נשטפים?", "באיחוד האירופי מוגבל לפחות מ-0.1% במוצרים נשטפים מאז 31/01/2020."], ["D5 ו-D6 במוצרים שנשארים על העור?", "לפי תקנה (EU) 2024/1328: מ-06/06/2027 D5 מוגבל לפחות מ-0.1% במוצרים שנשארים על העור, ו-D6 לפחות מ-0.1% גם במוצרים נשטפים וגם בנשארים."]],
  en: [["Is D4 allowed in cosmetics?", "No. In the EU, D4 is banned in cosmetic products (Annex II of the Cosmetics Regulation)."], ["D5 in wash-off products?", "In the EU it is limited to below 0.1 % in wash-off (rinse-off) cosmetics since 31/01/2020."], ["D5 and D6 in leave-on products?", "Under Regulation (EU) 2024/1328: from 06/06/2027 D5 is limited to below 0.1 % in leave-on cosmetics, and D6 to below 0.1 % in both wash-off and leave-on cosmetics."]],
  ru: [["Разрешён ли D4 в косметике?", "Нет. В ЕС D4 запрещён в косметической продукции (Приложение II Регламента о косметике)."], ["D5 в смываемых продуктах?", "В ЕС ограничен менее 0,1 % в смываемой косметике с 31/01/2020."], ["D5 и D6 в несмываемых продуктах?", "Согласно Регламенту (EU) 2024/1328: с 06/06/2027 D5 ограничен менее 0,1 % в несмываемой косметике, а D6 — менее 0,1 % и в смываемой, и в несмываемой."]],
  it: [["D4 è ammesso nei cosmetici?", "No. Nell'UE il D4 è vietato nei prodotti cosmetici (Allegato II del Regolamento Cosmetici)."], ["D5 nei prodotti a risciacquo?", "Nell'UE è limitato a meno dello 0,1 % nei cosmetici a risciacquo dal 31/01/2020."], ["D5 e D6 nei prodotti senza risciacquo?", "Con il Regolamento (UE) 2024/1328: dal 06/06/2027 il D5 è limitato a meno dello 0,1 % nei cosmetici senza risciacquo, e il D6 a meno dello 0,1 % sia nei cosmetici a risciacquo sia in quelli senza risciacquo."]],
};
const ARTL: Record<PLang, string> = { he: "המאמר המלא: לוח הזמנים 2020–2031 ואיך עוברים", en: "Full article: the 2020–2031 timeline and how to switch", ru: "Полная статья: сроки 2020–2031 и как перейти", it: "Articolo completo: le scadenze 2020–2031 e come passare" };
export async function generateMetadata({ params }: { params: Promise<{ lang: PLang }> }): Promise<Metadata> { const { lang } = await params; return meta(lang, "/regulation", pt(lang, "regulation"), pt(lang, "regIntro") + " " + FACTS[lang].map((f) => f[1]).join(" ")); }
export default async function Regulation({ params }: { params: Promise<{ lang: PLang }> }) {
  const { lang } = await params; const t = (k: string) => pt(lang, k); const b = "/" + lang;
  const qa = [...FACTS[lang], [lang === "he" ? "ומה בישראל?" : lang === "ru" ? "А в Израиле?" : lang === "it" ? "E in Israele?" : "And in Israel?", t("regIsrael")] as [string, string]];
  return (
    <PortalPage lang={lang} path="/regulation" crumbs={[{ name: t("home"), url: b }, { name: t("regulation"), url: b + "/regulation" }]}>
      <JsonLd data={faqLd(qa.map(([q, a]) => ({ q, a })))} />
      <div className="rounded-2xl bg-ink-900 text-white p-5 space-y-2"><span className="inline-block rounded-full bg-amber-400 text-ink-900 text-xs font-extrabold px-3 py-1">{POP.badge[lang]}</span><div className="text-2xl font-extrabold">{POP.title[lang]}</div><p className="text-slate-200">{POP.text[lang]}</p></div>
      <h1 className="text-3xl font-bold">{t("regulation")}</h1><p className="text-lg text-slate-700">{t("regIntro")}</p>
      <Link href={b + "/articles/d4-d5-d6-2027"} className="inline-block text-brand-700 underline font-semibold">📰 {ARTL[lang]} ›</Link>
      <InciChecker lang={lang} />
      <div className="space-y-3">{qa.map(([q, a]) => <section key={q} className="border rounded-xl p-4"><h2 className="font-bold">{q}</h2><p className="text-slate-700 mt-1">{a}</p></section>)}</div>
      <section className="rounded-2xl bg-slate-50 p-4"><h2 className="font-bold">{t("regWhat")}</h2><p className="text-slate-700">{t("regDo")}</p></section>
    </PortalPage>
  );
}
