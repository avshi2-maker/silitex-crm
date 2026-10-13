"use client";
// page.tsx (src/app/partner/page.tsx) · updated 13.10.2026 08:00 — + PartnerGreeting (hour-aware, Israel time + Tel Aviv weather) — + white-label footnote (tools.silitex.it) — all strings through tr() (EN/IT; HE for owner preview) — + working-session framing and follow-up date (Asia/Jerusalem) — landing for Silitex staff (partner access): what they can open, in EN/IT first. Knowledge tools only.
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { useLang } from "@/i18n";
import { CAT26 } from "@/lib/catalog";
import PartnerGreeting from "@/components/PartnerGreeting";
const TILES = [
  { href: "/ask", icon: "🔎", t: "Ask Silitex (AI)", d: "Questions in English or Italian — answers with sources from your catalogues, offsets and FAQ. No source = no answer: the question goes to Avshi by email + WhatsApp, human reply within 24 h." },
  { href: "/products", icon: "📕", t: "Catalogue 2026", d: "Your five sector catalogues, searchable by name, INCI, code and application; PDFs inside." },
  { href: "/offsets", icon: "🌍", t: "Global equivalents", d: "37 product families × 25 producers (Dow, Wacker, Shin-Etsu, Momentive, Evonik…) → Silitex equivalent." },
  { href: "/formulations", icon: "🧴", t: "Formulation patterns", d: "Personal-care patterns with Silitex substitutions, D5-free routes." },
  { href: "/faq", icon: "❓", t: "50 Q&A", d: "Technical and commercial questions customers ask, with sourced answers." },
];
export default function PartnerHome() {
  const { lang, setLang, t: tr } = useLang();
  const [name, setName] = useState("");
  useEffect(() => { fetch("/api/partner/me").then((r) => r.json()).then((j) => setName(j.partner || "")).catch(() => {}); if (lang === "he") setLang("en"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const uniq = new Set(CAT26.map((r) => r.product.toUpperCase())).size;
  return (
    <div className="space-y-4" dir="ltr">
      <PartnerGreeting name={name} />
      <div><div className="text-2xl font-bold text-ink-900">{tr("Silitex knowledge tools")}</div><div className="text-slate-500 text-sm">{tr("Built by Sapirim (Avshi Sapir) on the Silitex 2026 catalogues")} ({uniq} {tr("products")}) {tr("for the Israeli market. Read-only partner access; your questions are logged for usage statistics only.")}</div></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{TILES.map((x) => <Link key={x.href} href={x.href} className="block border rounded-xl p-4 bg-white hover:border-brand-500"><div className="text-2xl">{x.icon}</div><div className="font-bold mt-1">{tr(x.t)}</div><div className="text-sm text-slate-600 mt-1">{tr(x.d)}</div></Link>)}</div>
      <Card className="text-sm bg-brand-50/40 border-brand-200"><b>{tr("How to use these two weeks.")}</b> {tr("Ask the tool the three questions your agents ask you most often. Where the answer is wrong or missing, press")} <b>💬 Ask Sapirim</b> {tr("(bottom-right on every page) — the note reaches Avshi's inbox with the page attached, and he answers within 24 hours. We reconnect on")} <b>{process.env.NEXT_PUBLIC_FOLLOWUP_DATE || "27/10/2026"}</b> {tr("to review what you found and decide together whether there is a basis to talk terms.")}</Card>
      <Card className="text-sm text-slate-600">{tr("Try:")} <i>{tr("\"Which Silitex product replaces Dow Corning 5225C?\"")}</i> · <i>{tr("\"Kosher antifoams for yeast fermentation\"")}</i> · <i>{tr("\"D5-free alternative for a hair serum\"")}</i>. {tr("Answers cite the source rows [n]; they do not invent percentages or recipes.")}</Card>
      <div className="text-xs text-slate-500 border-t pt-3">{tr("If Silitex finds it useful, this tool can run under a silitex.it address (e.g. tools.silitex.it) for your whole sales network — one DNS record, no development on your side. Sapirim keeps hosting, updates and the AI service.")}</div>
      <div className="text-xs text-slate-400">{tr("Prepared by Sapirim for Silitex S.r.l. — confidential")} · <button className="underline" onClick={async () => { await fetch("/api/login", { method: "DELETE" }); location.href = "/login"; }}>{tr("sign out")}</button></div>
    </div>
  );
}
