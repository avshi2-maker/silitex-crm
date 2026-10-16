"use client";
// OwnerNote.tsx (src/components/OwnerNote.tsx) · updated 16.10.2026 09:35 (Asia/Jerusalem) — owner-only floating 📝 bubble on every page (bottom-left): quick note about the current page (tag + text, page + time auto) → /api/partner/feedback {owner:true} → stored + emailed to Avshi; listed in /partners inbox with mark-handled. Hidden for partners and on login/forms/teleprompter. Ctrl+Enter saves. Failed sends are kept locally and retried.
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PARTNER_NAME_COOKIE } from "@/lib/gate";
import { btnPrimary, btnGhost, inputCls } from "@/components/ui";
const TAGS = ["Silitex said", "To do", "Question", "Fix in app"];
const KEY = "silitex-owner-notes-queue";
type Q = { page: string; topic: string; message: string };
const readQ = (): Q[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const writeQ = (q: Q[]) => { try { localStorage.setItem(KEY, JSON.stringify(q)); } catch {} };
const post = (n: Q) => fetch("/api/partner/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...n, owner: true, lang: "en" }) }).then((r) => r.ok);
export default function OwnerNote() {
  const path = usePathname();
  const [show, setShow] = useState(false); const [open, setOpen] = useState(false); const [tag, setTag] = useState(TAGS[0]); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState<"" | "ok" | "queued">(""); const [count, setCount] = useState(0);
  useEffect(() => {
    let partner = false; try { partner = new RegExp("(?:^|; )" + PARTNER_NAME_COOKIE + "=").test(document.cookie); } catch {}
    setShow(!partner && !/^\/(login|request|survey|notes)/.test(path));
    const q = readQ(); if (q.length) Promise.all(q.map(post)).then((ok) => writeQ(q.filter((_, i) => !ok[i]))).catch(() => {});
  }, [path]);
  if (!show) return null;
  const save = async () => {
    if (msg.trim().length < 2) return; setBusy(true);
    const n: Q = { page: path, topic: tag, message: msg.trim() };
    let ok = false; try { ok = await post(n); } catch {}
    if (!ok) writeQ([...readQ(), n]);
    setDone(ok ? "ok" : "queued"); setCount((c) => c + 1); setMsg(""); setBusy(false); setTimeout(() => setDone(""), 1500);
  };
  return (
    <div dir="ltr" className="print:hidden">
      <button onClick={() => setOpen(!open)} title="My note on this page → Avshi's inbox" className="fixed bottom-5 left-5 z-50 w-11 h-11 rounded-full bg-ink-900 text-white shadow-lg text-lg hover:bg-ink-700 border border-slate-600">📝{count > 0 && <span className="absolute -top-1 -right-1 bg-brand-500 text-[10px] rounded-full px-1.5">{count}</span>}</button>
      {open && (<div className="fixed bottom-20 left-5 z-50 w-[340px] max-w-[92vw] bg-white rounded-2xl shadow-2xl border p-3 space-y-2 text-sm">
        <div className="flex items-center justify-between"><b>📝 Note · <code className="text-xs bg-slate-100 px-1 rounded">{path}</code></b><button className="text-slate-400" onClick={() => setOpen(false)}>✕</button></div>
        <div className="flex flex-wrap gap-1">{TAGS.map((t) => <button key={t} onClick={() => setTag(t)} className={"text-xs px-2 py-0.5 rounded-full border " + (t === tag ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{t}</button>)}</div>
        <textarea autoFocus className={inputCls + " h-24"} placeholder="Type the note… (Ctrl+Enter saves)" value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) save(); }} />
        <div className="flex items-center justify-between"><span className="text-xs">{done === "ok" ? <span className="text-emerald-700">✓ Saved — in /partners + email</span> : done === "queued" ? <span className="text-amber-700">Saved locally — will send automatically</span> : <span className="text-slate-400">Goes to /partners inbox + your email</span>}</span><div className="flex gap-1"><button className={btnGhost} onClick={() => setOpen(false)}>Close</button><button className={btnPrimary} disabled={busy || msg.trim().length < 2} onClick={save}>{busy ? "…" : "Save"}</button></div></div>
      </div>)}
    </div>
  );
}
