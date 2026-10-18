"use client";
// AskSapirim.tsx (src/components/AskSapirim.tsx) · updated 18.10.2026 12:30 — on /expo lifted above the bottom tab bar · 13.10.2026 07:30 — yellow (Asia/Jerusalem) — floating 💬 button for Silitex partners on every page: short note (page auto-filled, optional topic) → /api/partner/feedback → email to Avshi + stored. Shown only when the partner cookie is present.
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PARTNER_NAME_COOKIE } from "@/lib/gate";
import { btnPrimary, btnGhost, inputCls } from "@/components/ui";
import { useLang } from "@/i18n";
export default function AskSapirim() {
  const path = usePathname(); const { t: tr } = useLang();
  const [partner, setPartner] = useState(""); const [open, setOpen] = useState(false); const [topic, setTopic] = useState(""); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState<"" | "ok" | "err">("");
  useEffect(() => { try { const m = document.cookie.match(new RegExp("(?:^|; )" + PARTNER_NAME_COOKIE + "=([^;]*)")); setPartner(m ? decodeURIComponent(m[1]) : ""); } catch {} }, [path]);
  if (!partner || path.startsWith("/login")) return null;
  const send = async () => {
    setBusy(true); setDone("");
    try { const r = await fetch("/api/partner/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page: path, topic, message: msg, lang: "en" }) }); setDone(r.ok ? "ok" : "err"); if (r.ok) { setMsg(""); setTopic(""); setTimeout(() => { setOpen(false); setDone(""); }, 1800); } } catch { setDone("err"); }
    setBusy(false);
  };
  return (
    <div dir="ltr" className="print:hidden">
      <button onClick={() => setOpen(!open)} title={tr("Ask Sapirim — a question or a correction about this page")} className={"fixed right-5 z-50 rounded-full " + (path.startsWith("/expo") ? "bottom-24 w-12 h-12 text-xl " : "bottom-5 px-4 py-3 text-sm ") + " bg-amber-400 text-ink-900 shadow-lg font-bold hover:bg-amber-300 border-2 border-amber-500"}>💬{!path.startsWith("/expo") && " " + tr("Ask Sapirim")}</button>
      {open && (<div className={"fixed right-5 z-50 w-[360px] " + (path.startsWith("/expo") ? "bottom-40" : "bottom-20") + " max-w-[92vw] bg-white rounded-2xl shadow-2xl border p-4 space-y-2 text-sm"}>
        <div className="font-bold">{tr("Ask Sapirim")} <span className="font-normal text-slate-500">· {partner}</span></div>
        <div className="text-xs text-slate-500">{tr("About page")} <code className="bg-slate-100 px-1 rounded">{path}</code>. {tr("A question, a missing product, a wrong equivalent — anything. Goes straight to Avshi's inbox.")}</div>
        <input className={inputCls} placeholder={tr("Topic / product (optional)")} value={topic} onChange={(e) => setTopic(e.target.value)} />
        <textarea className={inputCls + " h-28"} placeholder={tr("Your note…")} value={msg} onChange={(e) => setMsg(e.target.value)} />
        <div className="flex items-center justify-between"><button className={btnGhost} onClick={() => setOpen(false)}>{tr("Close")}</button><button className={btnPrimary} disabled={busy || msg.trim().length < 3} onClick={send}>{busy ? tr("Sending…") : tr("Send to Avshi")}</button></div>
        {done === "ok" && <div className="text-emerald-700 text-xs">{tr("✓ Sent. Avshi answers within 24 hours.")}</div>}
        {done === "err" && <div className="text-red-600 text-xs">{tr("Could not send — please email avshi@sapirim.com")}</div>}
      </div>)}
    </div>
  );
}
