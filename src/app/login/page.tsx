"use client";
// page.tsx (src/app/login/page.tsx) · updated 18.10.2026 12:00 — partner sign-in from Expo (field host) lands on /expo · 15.10.2026 13:00 (Asia/Jerusalem) — PIN gate screen + Silitex partner sign-in (name + PIN → knowledge pages only); 👁 show PIN, no Chrome autofill, clear tab hints
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
function Login() {
  const sp = useSearchParams(); const next = sp.get("next") || "/";
  const [pin, setPin] = useState(""); const [err, setErr] = useState(false); const [busy, setBusy] = useState(false); const [mode, setMode] = useState<"owner" | "partner">(sp.get("partner") ? "partner" : "owner"); const [name, setName] = useState(""); const [show, setShow] = useState(false);
  const go = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr(false); const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mode === "partner" ? { partner: name, pin } : { pin }) }); setBusy(false); if (r.ok) location.href = mode === "partner" ? (next.startsWith("/expo") || location.hostname.startsWith("silitex-field.") ? "/expo" : "/partner") : next; else setErr(true); };
  const pinCls = "w-full text-center text-2xl tracking-[0.5em] border rounded-lg ps-3 pe-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500";
  return (
    <div className="min-h-screen -m-6 bg-ink-900 flex items-center justify-center" dir="ltr">
      <form onSubmit={go} autoComplete="off" className="bg-white rounded-2xl p-8 w-[340px] shadow-xl text-center">
        <img src="/silitex-logo.png" alt="Silitex" className="h-12 mx-auto mb-2" />
        <div className="text-sm text-slate-500 mb-3">Silitex CRM · Israel — private area</div>
        <div className="flex rounded-lg border overflow-hidden mb-4 text-sm"><button type="button" onClick={() => { setMode("owner"); setErr(false); }} className={"flex-1 py-1.5 " + (mode === "owner" ? "bg-ink-900 text-white" : "bg-white")}>Sapirim</button><button type="button" onClick={() => { setMode("partner"); setErr(false); }} className={"flex-1 py-1.5 " + (mode === "partner" ? "bg-brand-500 text-white" : "bg-white")}>Silitex partner</button></div>
        {mode === "partner" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="your name (e.g. federica)" className="w-full text-center border rounded-lg py-2 mb-2" autoCapitalize="none" />}
        <div className="relative"><input autoFocus type={show ? "text" : "password"} inputMode="numeric" autoComplete="off" name={"pin-" + mode} data-lpignore="true" value={pin} onChange={(e) => { setPin(e.target.value); setErr(false); }} placeholder="PIN" className={pinCls} /><button type="button" onClick={() => setShow(!show)} title={show ? "Hide PIN" : "Show PIN"} className="absolute end-2 top-1/2 -translate-y-1/2 text-xl px-1">{show ? "🙈" : "👁"}</button></div>
        <div className="text-[11px] text-slate-400 mt-1">{mode === "owner" ? "Sapirim = owner PIN (not a partner PIN)" : "Partner = name + personal PIN"}</div>
        {err && <div className="text-red-600 text-sm mt-2">{mode === "partner" ? "Unknown name or wrong PIN" : "Wrong PIN"}</div>}
        <button disabled={busy || !pin || (mode === "partner" && !name)} className="mt-4 w-full bg-brand-500 text-white rounded-lg py-2 disabled:opacity-50">{busy ? "…" : "Enter"}</button>
        {mode === "partner" && <div className="text-[11px] text-slate-500 mt-3">Knowledge tools only: Ask Silitex · Catalogue 2026 · Global equivalents · Formulations · FAQ</div>}
        <div className="text-[11px] text-slate-400 mt-4">Customers: <a className="underline" href="/request">request form</a> · <a className="underline" href="/survey">survey</a></div>
      </form>
    </div>
  );
}
export default function LoginPage() { return <Suspense><Login /></Suspense>; }
