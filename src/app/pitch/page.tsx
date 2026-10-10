"use client";
// page.tsx (src/app/pitch/page.tsx) · updated 10.10.2026 07:40 (Asia/Jerusalem) — executive story for Silitex management (English, print-ready). Copy lives in config/pitch.ts.
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PRODUCTS, OFFSETS, PRIORITIES, INDUSTRIES } from "@/lib/data";
import { PITCH } from "@/config/pitch";
import { SALES_PROCESS } from "@/config/sales";
import { TEAM } from "@/config/team";
import Counter from "@/components/pitch/Counter";
import IsraelMap from "@/components/pitch/IsraelMap";
import Timeline from "@/components/pitch/Timeline";
import ExportBar from "@/components/ExportBar";
import BackLink from "@/components/BackLink";
import { fmtDate } from "@/lib/format";
export default function PitchPage() {
  const { state, ready } = useStore();
  if (!ready) return null;
  const potential = state.leads.reduce((a, l) => a + l.value_usd, 0);
  const tons = state.leads.reduce((a, l) => a + l.volume_tons, 0);
  const summary = PITCH.title + "\n" + PITCH.subtitle + "\n\n" + state.leads.length + " accounts · " + INDUSTRIES.length + " industries · $" + potential.toLocaleString() + " / yr · " + tons + " t/yr\n\n" + PITCH.phases.map((p) => "Phase " + p.n + " (" + p.months + "): " + p.title + " — " + p.text).join("\n") + "\n\n" + PITCH.process.title + ":\n" + SALES_PROCESS.map((s) => s.n + ". " + s.title + " (" + s.owner + ") — " + s.text).join("\n") + "\n\nTeam:\n" + TEAM.map((m) => "- " + m.role + ": " + m.name).join("\n") + "\n\n" + PITCH.model.title + ":\n" + PITCH.model.lines.map((l) => "- " + l).join("\n") + "\n\nWhat Silitex gets:\n" + PITCH.gets.map((g) => "- " + g[0] + ": " + g[1]).join("\n") + "\n\nWhat we need:\n" + PITCH.needs.map((n) => "- " + n).join("\n");
  return (
    <div className="space-y-8" dir="ltr">
      <BackLink />
      <section className="rounded-2xl bg-ink-900 text-white p-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="bg-white rounded-lg inline-block px-3 py-1 mb-4"><img src="/silitex-logo.png" alt="Silitex" className="h-12" /></div>
        <h1 className="text-4xl font-bold tracking-tight">{PITCH.title}</h1>
        <p className="text-slate-300 mt-2 text-lg">{PITCH.subtitle}</p>
        <div className="text-sm text-slate-400 mt-4">{PITCH.presenter} · {fmtDate(new Date())}</div>
      </section>
      <section className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[["Target accounts", state.leads.length, "", ""], ["Industries", INDUSTRIES.length, "", ""], ["Year-1 target", potential / 1e3, "$", "k"], ["Year-1 volume", tons, "", " t"], ["Market capacity (TAM)", state.leads.reduce((a, l) => a + (l.tam_tons || 0), 0), "", " t/yr"], ["Cross-ref categories", OFFSETS.rows.length, "", ""]].map(([k, v, p, s]) => (
          <div key={k as string} className="bg-white border rounded-xl p-4 shadow-sm"><div className="text-xs text-slate-500">{k}</div><div className="text-3xl font-bold text-brand-500"><Counter to={v as number} prefix={p as string} suffix={s as string} decimals={0} /></div></div>
        ))}
      </section>
      <section className="grid lg:grid-cols-[auto_1fr] gap-8 bg-white border rounded-2xl p-6 shadow-sm">
        <IsraelMap leads={state.leads} />
        <div>
          <h2 className="text-2xl font-bold text-ink-900 mb-2">The market is already mapped</h2>
          <p className="text-slate-600">Every pin is a named Israeli manufacturer with a decision-maker role, the Silitex SKU that fits, the incumbent it replaces and an annual volume estimate. Priority families:</p>
          <ul className="mt-3 space-y-2">{PRIORITIES.map((p) => (<li key={p.rank} className="flex gap-3 text-sm"><span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center shrink-0">{p.rank}</span><div><b>{p.family}</b> — ${(p.value_usd / 1000).toFixed(0)}k · {p.volume_tons} t/yr<div className="text-xs text-slate-500">{p.targets}</div></div></li>))}</ul>
          <div className="mt-4 flex gap-2 text-sm"><Link href="/products?lang=en" className="text-brand-600 underline">Catalog ({PRODUCTS.length})</Link><Link href="/offsets?lang=en" className="text-brand-600 underline">Cross-reference</Link><Link href="/sniper?lang=en" className="text-brand-600 underline">Offset Sniper</Link></div>
        </div>
      </section>
      <section><h2 className="text-2xl font-bold text-ink-900 mb-4">12-month plan</h2><Timeline /></section>
      <section className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-ink-900 mb-1">{PITCH.process.title}</h2><p className="text-sm text-slate-500 mb-3">{PITCH.process.sub}</p>
        <ol className="grid md:grid-cols-3 gap-2">{SALES_PROCESS.map((s) => (<li key={s.n} className="flex gap-2 text-sm"><span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center shrink-0">{s.n}</span><div><b>{s.title}</b> <span className="text-xs text-slate-400">· {s.owner}</span><div className="text-xs text-slate-600">{s.text}</div></div></li>))}</ol>
        <div className="mt-4 grid md:grid-cols-3 gap-2">{TEAM.map((m) => (<div key={m.role} className="border rounded-xl p-3 text-sm"><div className="text-xs text-brand-600 font-bold uppercase">{m.role}</div><div className="font-bold">{m.name}</div><div className="text-xs text-slate-500">{m.owns.slice(0, 2).join(" · ")}</div></div>))}</div>
        <Link href="/team?lang=en" className="text-sm text-brand-600 underline mt-2 inline-block">Team & process →</Link>
      </section>
      <section className="bg-white border rounded-2xl p-6 shadow-sm"><h2 className="text-xl font-bold text-ink-900 mb-2">{PITCH.model.title}</h2><ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">{PITCH.model.lines.map((l) => <li key={l}>{l}</li>)}</ul></section>
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm"><h2 className="text-xl font-bold text-ink-900 mb-3">What Silitex gets</h2><ul className="space-y-3">{PITCH.gets.map(([t, d]) => (<li key={t} className="flex gap-3"><span className="text-brand-500 text-lg">✔</span><div><b>{t}</b><div className="text-sm text-slate-600">{d}</div></div></li>))}</ul></div>
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6"><h2 className="text-xl font-bold text-ink-900 mb-3">What we need from Silitex</h2><ol className="space-y-2 list-decimal list-inside text-sm">{PITCH.needs.map((n) => <li key={n}>{n}</li>)}</ol><div className="mt-4 text-sm text-slate-600">Live system: <b>silitex.marble-art.co.il</b> — dashboard, pipeline, sample tracker, principal report.</div></div>
      </section>
      <ExportBar title="Silitex Israel — Distribution Proposal" text={summary} />
    </div>
  );
}
