"use client";
// Certifications.tsx (src/components/Certifications.tsx) · updated 15.10.2026 13:35 (Asia/Jerusalem) — Silitex certifications block (ISO 9001 / 14001 / 45001 + kosher) for /pitch and /partner; PDF link when public/certs/<file> is set in config/certs.ts, else "PDF on request".
import { CERTS } from "@/config/certs";
import { useLang } from "@/i18n";
export default function Certifications({ compact = false }: { compact?: boolean }) {
  const { t: tr } = useLang();
  const box = "bg-white border rounded-2xl shadow-sm " + (compact ? "p-4" : "p-6");
  return (
    <section className={box} dir="ltr">
      <h2 className={(compact ? "text-lg" : "text-xl") + " font-bold text-ink-900 mb-1"}>🛡️ {tr("Silitex certifications")}</h2>
      <p className="text-sm text-slate-500 mb-3">{tr("Company-level management systems certified by Certiquality (Italy), plus product-level kosher. Israeli procurement asks for these certificates in supplier approval.")}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CERTS.map((c) => (
          <div key={c.code} className="border rounded-xl p-3 flex flex-col">
            <div className="flex items-center justify-between gap-2"><span className="font-bold text-ink-900">{c.code}</span><span className="text-[10px] uppercase tracking-wide text-slate-400">{tr(c.level === "company" ? "company" : "product")}</span></div>
            <div className="text-sm font-medium text-brand-600">{tr(c.title)}</div>
            <div className="text-xs text-slate-600 mt-1">{tr(c.scope)}</div>
            <div className="text-xs text-slate-500 mt-1 flex-1">✔ {tr(c.why)}</div>
            <div className="text-[11px] text-slate-400 mt-2">{tr(c.body)}{c.expiry && " · " + tr("valid to") + " " + c.expiry}</div>
            {c.pdf ? <a href={c.pdf} target="_blank" rel="noreferrer" className="text-xs text-brand-600 underline mt-1">📄 {tr("Certificate PDF")}</a> : <span className="text-xs text-slate-400 mt-1">📄 {tr("PDF on request")}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
