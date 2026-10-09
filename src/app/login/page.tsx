"use client";
// page.tsx (src/app/login/page.tsx) · updated 09.10.2026 17:05 (Asia/Jerusalem) — PIN gate screen
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
function Login() {
  const sp = useSearchParams(); const next = sp.get("next") || "/";
  const [pin, setPin] = useState(""); const [err, setErr] = useState(false); const [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr(false); const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin }) }); if (r.ok) window.location.href = next; else { setErr(true); setBusy(false); } };
  return (
    <div className="min-h-screen -m-6 bg-ink-900 flex items-center justify-center" dir="ltr">
      <form onSubmit={go} className="bg-white rounded-2xl p-8 w-[340px] shadow-xl text-center">
        <img src="/silitex-logo.png" alt="Silitex" className="h-12 mx-auto mb-2" />
        <div className="text-sm text-slate-500 mb-6">Silitex CRM · Israel — private area</div>
        <input autoFocus type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" className="w-full text-center text-2xl tracking-[0.5em] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        {err && <div className="text-red-600 text-sm mt-2">Wrong PIN</div>}
        <button disabled={busy || !pin} className="mt-4 w-full bg-brand-500 text-white rounded-lg py-2 disabled:opacity-50">{busy ? "…" : "Enter"}</button>
        <div className="text-[11px] text-slate-400 mt-4">Customers: <a className="underline" href="/request">request form</a> · <a className="underline" href="/survey">survey</a></div>
      </form>
    </div>
  );
}
export default function LoginPage() { return <Suspense><Login /></Suspense>; }
