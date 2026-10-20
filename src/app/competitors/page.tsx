"use client";
// page.tsx (src/app/competitors/page.tsx) · created 20.10.2026 07:10 (Asia/Jerusalem) — COMPETITORS & CHANNELS: register of Israeli silicone distributors / local makers + how many of our customers each one probably supplies (from the lead's "competitor / current supplier" field) + export.
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, H1, Badge } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import { RIVALS, KIND_HE } from "@/config/competitors";
import { useLang } from "@/i18n";
export default function CompetitorsPage() {
  const { t: tr } = useLang();
  const { state, ready } = useStore();
  if (!ready) return null;
  const leadsOf = (m: RegExp) => state.leads.filter((l) => m.test([l.competitor_offset, (l as { intake?: Record<string, unknown> }).intake?.BEN_001].filter(Boolean).join(" ")));
  const text = RIVALS.map((r) => r.name + " [" + KIND_HE[r.kind] + "] — " + r.brands.join(", ") + "\n" + (r.contact || "") + (r.address ? " · " + r.address : "") + "\n" + r.note + "\n" + tr("לקוחות מקושרים") + ": " + leadsOf(r.match).map((l) => l.name).join(", ")).join("\n\n");
  return (
    <div className="space-y-4">
      <H1 sub={tr("מי מוכר סיליקון בישראל, איזה מותג, ואיזה מהלקוחות שלנו כנראה קונה דרכו. מקור: רשימת Comet 20/10/2026 — לאמת עם פיני.")}>🥊 {tr("מתחרים וערוצי הפצה")}</H1>
      <div className="grid md:grid-cols-2 gap-3">
        {RIVALS.map((r) => { const ls = leadsOf(r.match); return (
          <Card key={r.id} className="space-y-1.5">
            <div className="flex items-start gap-2"><div className="font-bold flex-1" dir="ltr">{r.name}</div><Badge tone={r.kind === "distributor" ? "red" : r.kind === "maker" ? "amber" : "slate"}>{tr(KIND_HE[r.kind])}</Badge></div>
            <div className="text-sm"><b>{tr("מותגים")}:</b> <span dir="auto">{r.brands.join(" · ")}</span> · <span className="text-slate-500">{tr(r.segments)}</span></div>
            {r.contact && <div className="text-xs text-slate-600" dir="ltr">{r.contact}{r.address ? " · " : ""}<span dir="rtl">{r.address}</span></div>}
            {r.website && <a href={r.website} target="_blank" rel="noreferrer" className="text-xs text-brand-600 underline" dir="ltr">{r.website}</a>}
            <div className="text-sm text-slate-700">{tr(r.note)}</div>
            <div className="text-xs text-slate-500">{tr("לקוחות מקושרים")} ({ls.length}): {ls.slice(0, 12).map((l) => <Link key={l.id} href={"/leads/" + l.id} className="underline me-2">{l.name}</Link>)}</div>
          </Card>); })}
      </div>
      <ExportBar title={tr("מתחרים וערוצי הפצה")} text={text} />
    </div>
  );
}
