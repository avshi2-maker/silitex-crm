"use client";
// InciChecker.tsx (src/portal/components/InciChecker.tsx) · created 20.10.2026 18:15 (Asia/Jerusalem) — PUBLIC PORTAL D4/D5/D6 INCI checker: paste an ingredient list, pick leave-on / rinse-off → status per cyclic siloxane under EU rules (2024/1328, 06/06/2027) + CTA (WhatsApp / form). Runs in the browser only.
import { useState } from "react";
import type { PLang } from "../config";
import { CONTACT } from "../config";
import { POP, checkInci, type Hit } from "../reg2027";
const TONE: Record<Hit["level"], string> = { ban: "border-red-300 bg-red-50", limit2027: "border-amber-300 bg-amber-50", ok2027: "border-emerald-300 bg-emerald-50" };
export default function InciChecker({ lang }: { lang: PLang }) {
  const [txt, setTxt] = useState(""); const [leave, setLeave] = useState(true); const [res, setRes] = useState<Hit[] | null>(null);
  const p = (k: string) => POP[k][lang];
  const wa = "https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent("D4/D5/D6 — " + (res || []).map((h) => h.found).join(", "));
  return (
    <section id="checker" className="rounded-2xl border-2 border-amber-400 bg-white p-5 space-y-3 scroll-mt-24">
      <div className="flex items-center gap-2"><span className="rounded-full bg-amber-400 text-ink-900 text-xs font-extrabold px-3 py-1">{p("badge")}</span><h2 className="text-xl font-bold">{p("checker")}</h2></div>
      <p className="text-sm text-slate-600">{p("checkerHint")}</p>
      <label className="block"><span className="sr-only">INCI</span><textarea dir="ltr" rows={4} className="w-full border rounded-xl p-3 text-sm font-mono" value={txt} onChange={(e) => { setTxt(e.target.value); setRes(null); }} placeholder="Aqua, Cyclopentasiloxane, Dimethicone, Glycerin, ..." /></label>
      <fieldset className="flex flex-wrap gap-4 text-sm"><legend className="sr-only">{p("type")}</legend>
        <label className="flex items-center gap-2"><input type="radio" checked={leave} onChange={() => { setLeave(true); setRes(null); }} /> {p("leave")}</label>
        <label className="flex items-center gap-2"><input type="radio" checked={!leave} onChange={() => { setLeave(false); setRes(null); }} /> {p("rinse")}</label>
      </fieldset>
      <button type="button" disabled={txt.trim().length < 3} onClick={() => setRes(checkInci(txt, leave))} className="px-5 py-2.5 rounded-xl bg-ink-900 text-amber-300 font-semibold disabled:opacity-40">{p("check")}</button>
      {res && (res.length === 0 ? <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm">✓ {p("clean")}</div> : (
        <div className="space-y-2">{res.map((h) => <div key={h.key} className={"rounded-xl border p-3 text-sm " + TONE[h.level]}><b dir="ltr">{h.found}</b> — {h.status[lang]}</div>)}
          <div className="flex flex-wrap gap-2 pt-1"><a href={wa} className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium" rel="nofollow">💬 {p("talk")}</a><a href={"/request?lang=" + lang} className="px-4 py-2 rounded-xl border text-sm">📝 {lang === "he" ? "טופס פנייה" : lang === "ru" ? "Форма" : lang === "it" ? "Modulo" : "Form"}</a></div>
        </div>))}
    </section>
  );
}
