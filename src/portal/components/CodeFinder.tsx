"use client";
// CodeFinder.tsx (src/portal/components/CodeFinder.tsx) · updated 20.10.2026 17:55 (Asia/Jerusalem) — + Italian · 18.10.2026 18:00 — PUBLIC competitor-code finder: type a Dow / Wacker / Momentive … code → matching Silitex family page (same engine as the CRM quick match, public-safe gaps_lite data)
import { useMemo, useState } from "react";
import Link from "next/link";
import { searchEquiv } from "@/lib/equiv-search";
import type { PLang } from "../config";
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[®™]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
export default function CodeFinder({ lang, title, hint, none, examples }: { lang: PLang; title: string; hint: string; none: string; examples: string[] }) {
  const [q, setQ] = useState("");
  const hits = useMemo(() => (q.trim().length >= 3 ? searchEquiv(q, 6).filter((h) => h.kind !== "gap") : []), [q]);
  return (
    <section className="rounded-2xl border-2 border-brand-200 p-4 space-y-3">
      <h2 className="text-xl font-bold">🔎 {title}</h2>
      <input dir="ltr" value={q} onChange={(e) => setQ(e.target.value)} placeholder={hint} className="w-full border rounded-xl px-4 py-3 text-base" />
      <div className="flex flex-wrap gap-1">{examples.map((x) => <button key={x} onClick={() => setQ(x)} className="text-xs px-2 py-1 rounded-full border bg-slate-50" dir="ltr">{x}</button>)}</div>
      {q.trim().length >= 3 && !hits.length && <div className="text-sm text-slate-600">{none}</div>}
      <ul className="space-y-2">{hits.map((h) => (
        <li key={h.key} className="border rounded-xl p-3" dir="ltr">
          <div className="text-xs text-slate-500">{h.producer} · {h.competitor}</div>
          <div className="font-bold text-brand-700">→ {h.silitex.replace(/\s+—\s+full lines.*$/i, "")}</div>
          <div className="text-xs text-slate-500">{h.family}{h.inci ? " · " + h.inci : ""}{h.certs.length ? " · " + h.certs.join(", ") : ""}</div>
          {h.kind === "offset" && <Link href={"/" + lang + "/alternatives/" + slugify(h.family)} className="text-sm text-brand-600 underline">{lang === "he" ? "לעמוד ההשוואה המלא" : lang === "ru" ? "Полная таблица аналогов" : lang === "it" ? "Tabella completa delle equivalenze" : "Full comparison page"} ›</Link>}
        </li>))}</ul>
    </section>
  );
}
