"use client";
// SiteCatalog.tsx (src/components/SiteCatalog.tsx) · updated 12.10.2026 12:40 (Asia/Jerusalem) — the FULL Silitex catalogue as scraped from silitex.it (318 names, 35 categories) vs the 48 products that carry a full spec sheet in the CRM. Shows coverage, lets you search the whole list.
import { useMemo, useState } from "react";
import { Card, Badge, inputCls } from "@/components/ui";
import { useLang } from "@/i18n";
import { PRODUCTS } from "@/lib/data";
import site from "@/data/silitex_catalog_site.json";
import { isCatalog } from "@/lib/catalog";
type SP = { name: string; categories: string[]; desc_en: string };
const SITE = (site as { products: SP[]; scraped: string }).products;
const SCRAPED = (site as { scraped: string }).scraped;
const specNames = PRODUCTS.flatMap((p) => p.product_name.toUpperCase().split(/\s*\/\s*|\s+—\s+/).map((s) => s.replace(/\(.*?\)/g, "").trim()));
const hasSpec = (n: string) => { const u = n.toUpperCase().replace(/\(.*?\)/g, "").trim(); return specNames.some((s) => s === u || u.startsWith(s + " ") || s.startsWith(u + " ")); };
const CAT_HE: Record<string, string> = { "antischiuma-siliconici": "מסירי קצף סיליקון", "antischiuma-e-disaeranti-non-siliconici": "מסירי קצף ללא סיליקון", "antischiuma-per-l-industria-alimentare": "מסירי קצף למזון", "antischiuma-per-alte-temperature": "מסירי קצף לטמפ' גבוהה", "antischiuma-polietere-modificati": "מסירי קצף פוליאתר", "antischiuma-vegetali": "מסירי קצף צמחיים", "antischiuma-alcolici": "מסירי קצף אלכוהוליים", "antischiuma-in-polvere": "מסירי קצף אבקה", "antischiuma-al-solvente": "מסירי קצף בממס", "bagnanti-e-livellanti-per-sistemi-all-acqua": "מרטיבים ומיישרים", "ammorbidenti-cationici": "מרככים קטיוניים", "ammorbidenti-siliconici": "מרככי סיליקון", "emulsioni": "אמולסיות", "microemulsioni": "מיקרו-אמולסיות", "nanoemulsioni": "ננו-אמולסיות", "finishes-siliconici-per-rifinizione-conciaria": "גימור עור", "distaccanti-per-plastica-e-gomma": "משחררי תבנית פלסטיק/גומי", "distaccanti-per-saldatura": "משחררים לריתוך", "antistatici-per-stampa-offset": "אנטיסטטיים לדפוס אופסט", "cere-in-emulsione-acquosa": "שעוות באמולסיה", "cere-e-lubrificanti-per-cucirini": "שעוות וסיכה לחוטי תפירה", "idrorepellenti-e-antimacchia": "דוחי מים וכתמים", "lubrificanti-scivolanti-antistatici": "סיכה / החלקה / אנטיסטטי", "gomme-siliconiche": "גומי סיליקון", "paste-e-grassi-di-silicone": "משחות וגריז סיליקון", "fluidi-di-silicone": "נוזלי סיליקון", "fluidi-non-siliconici": "נוזלים ללא סיליקון", "resine-in-emulsione-acquosa": "שרפים באמולסיה", "resine-in-solvente": "שרפים בממס", "materie-prime-siliconiche": "חומרי גלם סיליקון", "polielettroliti": "פוליאלקטרוליטים", "disemulsionanti": "שוברי אמולסיה", "detergenti": "דטרגנטים", "spray-aerosol": "ספריי אירוסול", "flocculanti": "פלוקולנטים" };
export default function SiteCatalog() {
  const { t: tr } = useLang();
  const [q, setQ] = useState(""); const [cat, setCat] = useState(""); const [only, setOnly] = useState<"" | "spec" | "site">("");
  const withSpec = useMemo(() => SITE.filter((p) => hasSpec(p.name)).length, []);
  const cats = useMemo(() => Array.from(new Set(SITE.flatMap((p) => p.categories))), []);
  const list = useMemo(() => SITE.filter((p) => (!cat || p.categories.includes(cat)) && (!q || (p.name + " " + p.desc_en).toLowerCase().includes(q.toLowerCase())) && (!only || (only === "spec") === hasSpec(p.name))), [q, cat, only]);
  return (
    <Card className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <b>🌐 {tr("הקטלוג המלא מאתר silitex.it")}</b>
        <Badge tone="blue">{SITE.length} {tr("שמות")}</Badge>
        <Badge tone="green">{withSpec} {tr("עם מפרט מלא ב-CRM")}</Badge>
        <Badge tone="amber">{SITE.length - withSpec} {tr("שם + תיאור בלבד (מהאתר)")}</Badge>
        <span className="text-xs text-slate-500">{tr("נסרק")} {SCRAPED} · 35 {tr("קטגוריות")}</span>
      </div>
      <div className="grid md:grid-cols-4 gap-2">
        <input className={inputCls + " md:col-span-2"} placeholder={tr("חיפוש בכל 318 השמות…")} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls} value={cat} onChange={(e) => setCat(e.target.value)}><option value="">{tr("כל הקטגוריות")}</option>{cats.map((c) => <option key={c} value={c}>{tr(CAT_HE[c] || c)}</option>)}</select>
        <select className={inputCls} value={only} onChange={(e) => setOnly(e.target.value as "" | "spec" | "site")}><option value="">{tr("הכל")}</option><option value="spec">{tr("רק עם מפרט מלא")}</option><option value="site">{tr("רק ללא מפרט (לעבודה)")}</option></select>
      </div>
      <div className="overflow-auto max-h-[60vh]"><table className="w-full text-xs"><thead className="bg-slate-50 text-slate-500 sticky top-0"><tr><th className="p-2 text-start">{tr("מוצר")}</th><th className="p-2 text-start">{tr("קטגוריה")}</th><th className="p-2 text-start">{tr("תיאור (מהאתר)")}</th><th className="p-2 text-start">{tr("מפרט")}</th></tr></thead>
        <tbody>{list.map((p) => (<tr key={p.name} className="border-t align-top"><td className="p-2 font-medium whitespace-nowrap" dir="ltr">{p.name}</td><td className="p-2 text-slate-500">{p.categories.map((c) => tr(CAT_HE[c] || c)).join(" · ")}</td><td className="p-2">{p.desc_en || "—"}</td><td className="p-2">{hasSpec(p.name) ? <Badge tone="green">✔ CRM</Badge> : <Badge tone="amber">{tr("אתר")}</Badge>}</td></tr>))}</tbody></table></div>
      <div className="text-[11px] text-slate-400">{tr("מקור אמת לבדיקת שמות (isCatalog). מוצר שלא ברשימה הזו = לא קיים ב-Silitex.")}{isCatalog("EVERSIL 35") ? "" : ""}</div>
    </Card>
  );
}
