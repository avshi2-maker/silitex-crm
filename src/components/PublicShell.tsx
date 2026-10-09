"use client";
// PublicShell.tsx (src/components/PublicShell.tsx) · updated 09.10.2026 13:20 (Asia/Jerusalem) — header/footer for customer-facing pages (no CRM sidebar)
import LangSwitch from "./LangSwitch";
import { OWNER } from "@/config/app";
import { useLang } from "@/i18n";
export default function PublicShell({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  const { t: tr } = useLang();
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6"><img src="/silitex-logo.png" alt="Silitex" className="h-12 bg-white rounded px-2 py-1" /><div className="bg-ink-900 rounded p-1"><LangSwitch /></div></div>
      <h1 className="text-2xl font-bold text-ink-900">{title}</h1>{sub && <p className="text-slate-500 mb-4">{sub}</p>}
      {children}
      <div className="text-xs text-slate-400 mt-8">{tr(OWNER.name)} · {OWNER.phone} · {OWNER.brand} · Silitex S.r.l. official distribution, Israel</div>
    </div>
  );
}
