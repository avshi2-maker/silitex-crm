"use client";
// page.tsx (src/app/partner/page.tsx) · updated 13.10.2026 07:20 — + working-session framing and follow-up date (Asia/Jerusalem) — landing for Silitex staff (partner access): what they can open, in EN/IT first. Knowledge tools only.
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { useLang } from "@/i18n";
import { CAT26 } from "@/lib/catalog";
const TILES = [
  { href: "/ask", icon: "🔎", t: "Ask Silitex (AI)", d: "Questions in English or Italian — answers with sources from your catalogues, offsets and FAQ." },
  { href: "/products", icon: "📕", t: "Catalogue 2026", d: "Your five sector catalogues, searchable by name, INCI, code and application; PDFs inside." },
  { href: "/offsets", icon: "🌍", t: "Global equivalents", d: "37 product families × 25 producers (Dow, Wacker, Shin-Etsu, Momentive, Evonik…) → Silitex equivalent." },
  { href: "/formulations", icon: "🧴", t: "Formulation patterns", d: "Personal-care patterns with Silitex substitutions, D5-free routes." },
  { href: "/faq", icon: "❓", t: "50 Q&A", d: "Technical and commercial questions customers ask, with sourced answers." },
];
export default function PartnerHome() {
  const { lang, setLang } = useLang();
  const [name, setName] = useState("");
  useEffect(() => { fetch("/api/partner/me").then((r) => r.json()).then((j) => setName(j.partner || "")).catch(() => {}); if (lang === "he") setLang("en"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const uniq = new Set(CAT26.map((r) => r.product.toUpperCase())).size;
  return (
    <div className="space-y-4" dir="ltr">
      <div><div className="text-2xl font-bold text-ink-900">Welcome{name ? ", " + name.charAt(0).toUpperCase() + name.slice(1) : ""} — Silitex knowledge tools</div><div className="text-slate-500 text-sm">Built by Sapirim (Avshi Sapir) on the Silitex 2026 catalogues ({uniq} products) for the Israeli market. Read-only partner access; your questions are logged for usage statistics only.</div></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{TILES.map((x) => <Link key={x.href} href={x.href} className="block border rounded-xl p-4 bg-white hover:border-brand-500"><div className="text-2xl">{x.icon}</div><div className="font-bold mt-1">{x.t}</div><div className="text-sm text-slate-600 mt-1">{x.d}</div></Link>)}</div>
      <Card className="text-sm bg-brand-50/40 border-brand-200"><b>How to use these two weeks.</b> Ask the tool the three questions your agents ask you most often. Where the answer is wrong or missing, press <b>💬 Ask Sapirim</b> (bottom-right on every page) — the note reaches Avshi&apos;s inbox with the page attached, and he answers within 24 hours. We reconnect on <b>{process.env.NEXT_PUBLIC_FOLLOWUP_DATE || "27/10/2026"}</b> to review what you found and decide together whether there is a basis to talk terms.</Card>
      <Card className="text-sm text-slate-600">Try: <i>"Which Silitex product replaces Dow Corning 5225C?"</i> · <i>"Kosher antifoams for yeast fermentation"</i> · <i>"D5-free alternative for a hair serum"</i>. Answers cite the source rows [n]; they do not invent percentages or recipes.</Card>
      <div className="text-xs text-slate-400">Prepared by Sapirim for Silitex S.r.l. — confidential · <button className="underline" onClick={async () => { await fetch("/api/login", { method: "DELETE" }); location.href = "/login"; }}>sign out</button></div>
    </div>
  );
}
