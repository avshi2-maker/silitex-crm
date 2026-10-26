"use client";
// CodeFinder.tsx (src/portal/components/CodeFinder.tsx) · updated 26.10.2026 11:25 (Asia/Jerusalem) — v0.99.0 ⚠ unverified competitor codes labelled · 20.10.2026 18:40 (Asia/Jerusalem) — never a dead end: competitor code → equivalents; free text ("קרם הגנה לשמש") → catalogue products by use (need-search); "ask the AI" answer with product links; WhatsApp (query pre-filled) + free match report always offered · 17:55 — + Italian · 18.10.2026 18:00 — PUBLIC competitor-code finder (same engine as the CRM quick match, public-safe gaps_lite data)
import { useMemo, useState } from "react";
import Link from "next/link";
import { searchEquiv } from "@/lib/equiv-search";
import { needSearch } from "../need-search";
import { CONTACT, type PLang } from "../config";
import { Unverified } from "@/components/TrustTag";
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[®™]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
const F: Record<string, Record<PLang, string>> = {
  full: { he: "לעמוד ההשוואה המלא", en: "Full comparison page", ru: "Полная таблица аналогов", it: "Tabella completa delle equivalenze" },
  byUse: { he: "מוצרים מהקטלוג שמתאימים לשימוש", en: "Catalogue products for this use", ru: "Продукты каталога для этой задачи", it: "Prodotti a catalogo per questo uso" },
  ai: { he: "🤖 שאלו את ה-AI של ספירים", en: "🤖 Ask the Sapirim AI", ru: "🤖 Спросить ИИ Sapirim", it: "🤖 Chiedi all'IA di Sapirim" },
  thinking: { he: "⏳ ה-AI בודק את הקטלוג…", en: "⏳ The AI is checking the catalogue…", ru: "⏳ ИИ проверяет каталог…", it: "⏳ L'IA sta controllando il catalogo…" },
  limit: { he: "הגעתם למכסת השאלות להיום — כתבו לנו בוואטסאפ ונענה אישית.", en: "Daily question limit reached — write to us on WhatsApp and we will answer personally.", ru: "Дневной лимит вопросов исчерпан — напишите нам в WhatsApp.", it: "Limite giornaliero raggiunto — scriveteci su WhatsApp e risponderemo personalmente." },
  fail: { he: "ה-AI לא זמין כרגע — כתבו לנו בוואטסאפ.", en: "The AI is not available right now — write to us on WhatsApp.", ru: "ИИ сейчас недоступен — напишите нам в WhatsApp.", it: "L'IA non è disponibile ora — scriveteci su WhatsApp." },
  stuck: { he: "לא מצאתם? שלחו לנו את השאלה כמו שהיא:", en: "Not found? Send us the question as it is:", ru: "Не нашли? Отправьте нам вопрос как есть:", it: "Non trovato? Inviateci la domanda così com'è:" },
  wa: { he: "💬 שלחו בוואטסאפ", en: "💬 Send on WhatsApp", ru: "💬 Отправить в WhatsApp", it: "💬 Invia su WhatsApp" },
  match: { he: "🎁 דוח התאמה חינם לאתר שלכם", en: "🎁 Free match report for your site", ru: "🎁 Бесплатный отчёт о подборе", it: "🎁 Report di abbinamento gratuito" },
  waText: { he: "שלום אבשי, חיפשתי באתר: ", en: "Hello Avshi, I searched the website for: ", ru: "Здравствуйте, Авши! Я искал на сайте: ", it: "Buongiorno Avshi, ho cercato sul sito: " },
  aiNote: { he: "תשובת AI ראשונית — אבשי מאשר בחירה סופית ודוגמה.", en: "First AI answer — Avshi confirms the final choice and the sample.", ru: "Первичный ответ ИИ — окончательный выбор и образец подтверждает Авши.", it: "Prima risposta IA — Avshi conferma la scelta finale e il campione." },
};
type Ai = { answer: string; products: { name: string; slug: string }[] } | { error: string } | null;
export default function CodeFinder({ lang, title, hint, none, examples }: { lang: PLang; title: string; hint: string; none: string; examples: string[] }) {
  const [q, setQ] = useState(""); const [ai, setAi] = useState<Ai>(null); const [aiQ, setAiQ] = useState(""); const [busy, setBusy] = useState(false);
  const ok = q.trim().length >= 3;
  const hits = useMemo(() => (ok ? searchEquiv(q, 6).filter((h) => h.kind !== "gap") : []), [q, ok]);
  const need = useMemo(() => (ok && hits.length < 2 ? needSearch(q, 6) : []), [q, ok, hits.length]);
  const askAi = async () => {
    setBusy(true); setAi(null); setAiQ(q);
    try { const r = await fetch("/api/portal/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, lang }) }); const j = await r.json(); setAi(r.ok ? j : { error: r.status === 429 ? F.limit[lang] : F.fail[lang] }); }
    catch { setAi({ error: F.fail[lang] }); }
    setBusy(false);
  };
  const wa = "https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent(F.waText[lang] + q);
  return (
    <section className="rounded-2xl border-2 border-brand-200 p-4 space-y-3">
      <h2 className="text-xl font-bold">🔎 {title}</h2>
      <input dir="auto" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && ok && !busy) askAi(); }} placeholder={hint} className="w-full border rounded-xl px-4 py-3 text-base" />
      <div className="flex flex-wrap gap-1">{examples.map((x) => <button key={x} onClick={() => setQ(x)} className="text-xs px-2 py-1 rounded-full border bg-slate-50" dir="auto">{x}</button>)}</div>
      {ok && !hits.length && !need.length && <div className="text-sm text-slate-600">{none}</div>}
      {hits.length > 0 && <ul className="space-y-2">{hits.map((h) => (
        <li key={h.key} className="border rounded-xl p-3" dir="ltr">
          <div className="text-xs text-slate-500">{h.producer} · {h.competitor}{h.kind !== "catalogue" && !h.verified && <> <Unverified lang={lang} /></>}</div>
          <div className="font-bold text-brand-700">→ {h.silitex.replace(/\s+—\s+full lines.*$/i, "")}</div>
          <div className="text-xs text-slate-500">{h.family}{h.inci ? " · " + h.inci : ""}{h.certs.length ? " · " + h.certs.join(", ") : ""}</div>
          {h.kind === "offset" && <Link href={"/" + lang + "/alternatives/" + slugify(h.family)} className="text-sm text-brand-600 underline">{F.full[lang]} ›</Link>}
        </li>))}</ul>}
      {need.length > 0 && <div className="space-y-2">
        <div className="text-sm font-bold">{F.byUse[lang]}</div>
        <ul className="grid sm:grid-cols-2 gap-2">{need.map((p) => (
          <li key={p.slug}><Link href={"/" + lang + "/products/" + p.slug} className="block border rounded-xl p-3 bg-white hover:border-brand-400" dir="ltr">
            <div className="font-bold text-brand-700">{p.product} <span className="text-xs text-slate-400">{p.code}</span></div>
            <div className="text-xs text-slate-500">{p.sector}{p.inci ? " · " + p.inci : ""}</div>
            <div className="text-xs text-slate-600 line-clamp-2">{p.description}</div>
          </Link></li>))}</ul>
      </div>}
      {ok && <div className="flex flex-wrap items-center gap-2">
        <button onClick={askAi} disabled={busy} className="px-4 py-2 rounded-xl bg-ink-900 text-amber-300 font-bold text-sm hover:bg-ink-700 disabled:opacity-60">{busy ? F.thinking[lang] : F.ai[lang]}</button>
      </div>}
      {ai && "error" in ai && <div className="text-sm text-red-700">{ai.error}</div>}
      {ai && "answer" in ai && <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 space-y-2">
        <div className="text-xs text-slate-500" dir="auto">« {aiQ} »</div>
        <div className="text-sm whitespace-pre-line leading-relaxed" dir="auto">{ai.answer}</div>
        {ai.products.length > 0 && <div className="flex flex-wrap gap-2">{ai.products.map((p) => <Link key={p.slug} href={"/" + lang + "/products/" + p.slug} className="text-xs px-2 py-1 rounded-full bg-white border border-amber-400 font-bold" dir="ltr">{p.name} ›</Link>)}</div>}
        <div className="text-[11px] text-slate-500">{F.aiNote[lang]}</div>
      </div>}
      {ok && <div className="rounded-xl bg-slate-50 border p-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-600">{F.stuck[lang]}</span>
        <a href={wa} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold">{F.wa[lang]}</a>
        <Link href={"/" + lang + "/match"} className="px-3 py-1.5 rounded-lg bg-amber-400 text-ink-900 font-semibold">{F.match[lang]}</Link>
      </div>}
    </section>
  );
}
