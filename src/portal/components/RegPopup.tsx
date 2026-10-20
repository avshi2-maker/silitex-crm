"use client";
// RegPopup.tsx (src/portal/components/RegPopup.tsx) · created 20.10.2026 18:15 (Asia/Jerusalem) — PUBLIC PORTAL announcement pop-up "NEW! Ready for the 2027 EU regulation" (D4/D5/D6): shows once per visitor (remembered in the browser), not on the regulation page itself; CTA → the INCI checker.
import { useEffect, useState } from "react";
import Link from "next/link";
import type { PLang } from "../config";
import { POP } from "../reg2027";
const KEY = "sapirim-reg2027-popup-v1";
export default function RegPopup({ lang, path }: { lang: PLang; path: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (path.startsWith("/regulation")) return; let seen = false; try { seen = !!localStorage.getItem(KEY); } catch {} if (!seen) { const t = setTimeout(() => setOpen(true), 1500); return () => clearTimeout(t); } }, [path]);
  const close = () => { setOpen(false); try { localStorage.setItem(KEY, "1"); } catch {} };
  if (!open) return null;
  const p = (k: string) => POP[k][lang];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="reg-pop-title">
      <div className="relative max-w-lg w-full rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-ink-900 text-white px-6 py-5">
          <span className="inline-block rounded-full bg-amber-400 text-ink-900 text-xs font-extrabold px-3 py-1 animate-pulse">{p("badge")}</span>
          <h2 id="reg-pop-title" className="mt-2 text-2xl font-extrabold">{p("title")}</h2>
          <div className="text-amber-300 font-mono text-sm mt-1" dir="ltr">D4 · D5 · D6 — Regulation (EU) 2024/1328</div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-slate-700 leading-relaxed">{p("text")}</p>
          <div className="flex flex-wrap gap-2">
            <Link href={"/" + lang + "/regulation#checker"} onClick={close} className="px-4 py-2.5 rounded-xl bg-brand-500 text-white font-semibold">{p("cta")}</Link>
            <button type="button" onClick={close} className="px-4 py-2.5 rounded-xl border">{p("later")}</button>
          </div>
        </div>
        <button type="button" onClick={close} aria-label="close" className="absolute top-3 end-3 text-white/80 hover:text-white text-xl w-11 h-11">✕</button>
      </div>
    </div>
  );
}
