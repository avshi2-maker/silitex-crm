"use client";
// page.tsx (src/app/team/page.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — Sapirim team + A–Z sales process (English, for Silitex). Content in config/team.ts + config/sales.ts.
import { TEAM, TEAM_INTRO } from "@/config/team";
import { SALES_PROCESS } from "@/config/sales";
import ExportBar from "@/components/ExportBar";
import BackLink from "@/components/BackLink";
import { Badge } from "@/components/ui";
import { OWNER } from "@/config/app";
export default function TeamPage() {
  const text = "Sapirim — Silitex Israel team\n" + TEAM_INTRO + "\n\n" + TEAM.map((m) => m.role + " — " + m.name + "\n" + m.bio + "\nOwns: " + m.owns.join("; ")).join("\n\n") + "\n\nSales process A–Z:\n" + SALES_PROCESS.map((s) => s.n + ". " + s.title + " (" + s.owner + "): " + s.text).join("\n");
  return (
    <div className="space-y-6" dir="ltr">
      <BackLink />
      <section className="rounded-2xl bg-ink-900 text-white p-8"><div className="text-xs uppercase tracking-wide text-brand-500 font-bold">Sapirim · Silitex Israel</div><h1 className="text-3xl font-bold mt-1">The team behind the channel</h1><p className="text-slate-300 mt-2">{TEAM_INTRO}</p></section>
      <section className="grid md:grid-cols-3 gap-4">
        {TEAM.map((m) => (<div key={m.role} className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-2xl mb-3">{m.photo ? <img src={m.photo} alt={m.name} className="w-16 h-16 rounded-full object-cover" /> : m.external ? "🧪" : m.role.startsWith("General") ? "🏁" : "📦"}</div>
          <div className="text-xs text-brand-600 font-bold uppercase tracking-wide">{m.role} {m.external && <Badge tone="amber">external</Badge>}</div>
          <div className="text-lg font-bold text-ink-900">{m.name}</div>
          <p className="text-sm text-slate-600 mt-2 flex-1">{m.bio}</p>
          <ul className="mt-3 text-sm space-y-1">{m.owns.map((o) => <li key={o} className="flex gap-2"><span className="text-brand-500">✔</span>{o}</li>)}</ul>
        </div>))}
      </section>
      <section className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-ink-900 mb-1">How a sale is run, A to Z</h2>
        <p className="text-slate-600 text-sm mb-4">Every step has an owner, a rule and a screen in the CRM. Nothing lives in a mailbox or in memory.</p>
        <ol className="grid md:grid-cols-3 gap-3">{SALES_PROCESS.map((s) => (<li key={s.n} className="border rounded-xl p-3 relative"><span className="absolute -top-3 start-3 w-7 h-7 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">{s.n}</span><div className="font-bold mt-2">{s.title} <span className="text-xs text-slate-400 font-normal">· {s.owner}</span></div><p className="text-sm text-slate-600 mt-1">{s.text}</p><div className="text-xs text-brand-600 mt-2">{s.tool}</div></li>))}</ol>
      </section>
      <div className="text-xs text-slate-400">{OWNER.phone} · avshi@sapirim.com · silitex.marble-art.co.il</div>
      <ExportBar title="Sapirim — Silitex Israel team & sales process" text={text} />
    </div>
  );
}
