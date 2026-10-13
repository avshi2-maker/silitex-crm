"use client";
// page.tsx (src/app/login/page.tsx) · updated 13.10.2026 06:40 (Asia/Jerusalem) — PIN gate screen + Silitex partner sign-in (name + PIN → knowledge pages only)
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
function Login() {
  const sp = useSearchParams(); const next = sp.get("next") || "/";
  const [pin, setPin] = useState(""); const [err, setErr] = useState(false); const [busy, setBusy] = useState(false); const [mode, setMode] = useState<"owner" | "partner">(sp.get("partner") ? "partner" : "owner"); const [name, setName] = useState("");
  const go = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr(false); const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mode === "partner" ? { partner: name, pin } : { pin }) }); setBusy(false); if (r.ok) location.href = mode === "partner" ? "/partner" : next; else setErr(true); };
  return (
    <div className="min-h-screen -m-6 bg-ink-900 flex items-center justify-center" dir="ltr">
      <form onSubmit={go} className="bg-white rounded-2xl p-8 w-[340px] shadow-xl text-center">
        <img src="/silitex-logo.png" alt="Silitex" className="h-12 mx-auto mb-2" />
        <div className="text-sm text-slate-500 mb-3">Silitex CRM · Israel — private area</div>
        <div className="flex rounded-lg border overflow-hidden mb-4 text-sm"><button type="button" onClick={() => setMode("owner")} className={"flex-1 py-1.5 " + (mode === "owner" ? "bg-ink-900 text-white" : "bg-white")}>Sapirim</button><button type="button" onClick={() => setMode("partner")} className={"flex-1 py-1.5 " + (mode === "partner" ? "bg-brand-500 text-white" : "bg-white")}>Silitex partner</button></div>
        {mode === "partner" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="your name (e.g. federica)" className="w-full text-center border rounded-lg py-2 mb-2" autoCapitalize="none" />}
        <input autoFocus type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" className="w-full text-center text-2xl tracking-[0.5em] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        {err && <div className="text-red-600 text-sm mt-2">{mode === "partner" ? "Unknown name or wrong PIN" : "Wrong PIN"}</div>}
        <button disabled={busy || !pin || (mode === "partner" && !name)} className="mt-4 w-full bg-brand-500 text-white rounded-lg py-2 disabled:opacity-50">{busy ? "…" : "Enter"}</button>
        {mode === "partner" && <div className="text-[11px] text-slate-500 mt-3">Knowledge tools only: Ask Silitex · Catalogue 2026 · Global equivalents · Formulations · FAQ</div>}
        <div className="text-[11px] text-slate-400 mt-4">Customers: <a className="underline" href="/request">request form</a> · <a className="underline" href="/survey">survey</a></div>
      </form>
    </div>
  );
}
export default function LoginPage() { return <Suspense><Login /></Suspense>; }
