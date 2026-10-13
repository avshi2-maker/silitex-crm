"use client";
// page.tsx (src/app/partner/preview/page.tsx) · updated 13.10.2026 10:50 (Asia/Jerusalem) — "Israel portal · Phase 2 preview" for Silitex: how Silitex would be presented to Israeli formulators AFTER an agreement (industry finder, starter patterns, documented cases, one-click sample, Google/AI-search ready). Draft, noindex, partner-only. EN/IT via t().
import Link from "next/link";
import { Card, Badge, btnGhost } from "@/components/ui";
import { useLang } from "@/i18n";
import { CAT26 } from "@/lib/catalog";
const STEPS = ["1 · Formulator opens the Israeli portal (Hebrew / English) and picks the industry: cosmetics, food & beverage, detergents, paint & coating, water treatment, textile.", "2 · 60-second intake: company, role, what silicone is used today, the problem to solve. No password — a magic link by email.", "3 · 'For you' page: Silitex products filtered by function (antifoam, softener, emulsifier, water repellent, carrier, film former…), each with dosage, certifications and what it replaces — from your catalogues only.", "4 · Starter formulation patterns and documented application cases for that industry.", "5 · One-click sample request → Sapirim ships from Israeli stock, logs the trial, follows up in the CRM.", "6 · Every question the data cannot answer goes to a person within 24 h — no guessing."];
const SEO = ["Original application pages per problem, not catalogue copies (Google ignores duplicates of silitex.it).", "Bilingual HE/EN with structured data (Product, FAQ, Article schema) so Google and AI assistants cite Silitex for Israeli queries.", "Documented cases with real numbers (dose, foam knock-down time, wash resistance) — the content AI search prefers.", "Exposure grows exactly as fast as the application data and cases Silitex shares."];
const NEED = ["Application / dosage data per product (your lab's ranges per application).", "Permission rules: which claims, certificates and brand assets may be published in Israel.", "Two or three European reference cases we may anonymise and adapt.", "Technical contact for questions we cannot answer from the catalogues (60-day SLA)."];
export default function PreviewPage() {
  const { t: tr } = useLang();
  const food = CAT26.filter((r) => r.sector === "Food & Agri" && /SILIFOOD 30|CPL 350 ET|CPL 250 FOOD|FISIOREX FG|RIMAX 750 FOOD/.test(r.product)).slice(0, 5);
  return (
    <div className="space-y-4" dir="ltr">
      <div className="flex flex-wrap items-center justify-between gap-2"><Link href="/partner" className={btnGhost}>← {tr("Partner home")}</Link><Badge tone="amber">{tr("DRAFT · Phase 2 · subject to agreement · nothing is public")}</Badge></div>
      <div><div className="text-2xl font-bold text-ink-900">🇮🇱 {tr("Israel portal — Phase 2 preview")}</div><div className="text-slate-600 text-sm">{tr("How Silitex would be presented to Israeli formulators after an agreement. Built on the same engine you are using now; content only what Silitex approves and supplies.")}</div></div>
      <Card><div className="font-bold mb-2">🧭 {tr("What a formulator experiences")}</div><ol className="space-y-1 text-sm">{STEPS.map((s) => <li key={s} className="border-t pt-1">{tr(s)}</li>)}</ol></Card>
      <Card className="border-brand-200">
        <div className="flex items-center justify-between"><div className="font-bold">📄 {tr("Sample application page (draft)")}</div><Badge tone="slate">{tr("example")}</Badge></div>
        <div className="mt-2 text-lg font-bold">{tr("Foam control in yeast and sugar fermentation — Kosher and FDA options")}</div>
        <div className="text-sm text-slate-700 mt-1">{tr("Israeli yeast, sugar and beverage plants need direct-food-contact antifoams with a Kosher certificate specified by the rabbinate, not by R&D. Silitex offers both a silicone (E900) and a 100% vegetable route:")}</div>
        <div className="overflow-auto mt-2"><table className="w-full text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-1.5 text-start">{tr("Product")}</th><th className="p-1.5 text-start">{tr("Base")}</th><th className="p-1.5 text-start">%</th><th className="p-1.5 text-start">{tr("Dosage")}</th><th className="p-1.5 text-start">{tr("Compliance")}</th></tr></thead><tbody>{food.map((r) => <tr key={r.id} className="border-t"><td className="p-1.5 font-medium">{r.product}</td><td className="p-1.5">{r.inci}</td><td className="p-1.5">{r.active_pct}</td><td className="p-1.5">{r.dosage}</td><td className="p-1.5">{r.compliance}</td></tr>)}</tbody></table></div>
        <div className="text-xs text-slate-500 mt-2">{tr("Then: a starter dosing protocol, a 'request 5 kg sample' button, and a Q&A block (FAQ schema) — all indexable by Google and AI assistants in Hebrew and English.")}</div>
      </Card>
      <Card>
        <div className="flex items-center justify-between"><div className="font-bold">🏆 {tr("Success-story template (draft)")}</div><Badge tone="slate">{tr("example — fictional placeholder")}</Badge></div>
        <div className="text-sm mt-2 grid md:grid-cols-2 gap-2">
          <div className="border rounded-lg p-2"><b>{tr("Context")}</b><div className="text-slate-600">{tr("Dead Sea cosmetics plant, northern Israel · hair serum reformulation for EU 2027 cyclics restriction")}</div></div>
          <div className="border rounded-lg p-2"><b>{tr("Before")}</b><div className="text-slate-600">{tr("Cyclopentasiloxane + dimethiconol blend from a global supplier, 8-week lead time")}</div></div>
          <div className="border rounded-lg p-2"><b>{tr("Silitex solution")}</b><div className="text-slate-600">{tr("ALKABLEND 6800 + PHENYL TRIMETHICONE · 5 kg sample from Israeli stock in 3 days · lab sign-off in 4 weeks")}</div></div>
          <div className="border rounded-lg p-2"><b>{tr("Result")}</b><div className="text-slate-600">{tr("Same dry-down and gloss, D5-free claim, first 500 kg order · published with the customer's consent, anonymised on request")}</div></div>
        </div>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        <Card><div className="font-bold mb-2">🔎 {tr("Why Google and AI search will show Silitex")}</div><ul className="list-disc ms-5 text-sm space-y-1">{SEO.map((s) => <li key={s}>{tr(s)}</li>)}</ul></Card>
        <Card className="bg-amber-50/50 border-amber-200"><div className="font-bold mb-2">📥 {tr("What we would need from Silitex")}</div><ul className="list-disc ms-5 text-sm space-y-1">{NEED.map((s) => <li key={s}>{tr(s)}</li>)}</ul></Card>
      </div>
      <div className="text-xs text-slate-500">{tr("Nothing on this page is public. The portal goes live only after a signed agreement and only with content Silitex approves. Use the yellow Ask Sapirim button for remarks.")}</div>
    </div>
  );
}
