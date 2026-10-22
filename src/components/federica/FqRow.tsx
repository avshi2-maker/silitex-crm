"use client";
// FqRow.tsx (src/components/federica/FqRow.tsx) · updated 22.10.2026 08:40 (Asia/Jerusalem) — all UI text through tr() (EN / IT / RU) · created 21.10.2026 16:55 (Asia/Jerusalem) — one issue in the Silitex register: priority, question, category · who answers, days open, Fridays asked, linked leads; edit / answer / close / reopen inline.
import { useState } from "react";
import Link from "next/link";
import { Badge, btnGhost, btnPrimary, inputCls } from "@/components/ui";
import { PRIO, STATUS_HE, CATS, WHO, daysOpen, isOpen, fmtD, type Fq } from "@/lib/fq-types";
import { useLang } from "@/i18n";
export default function FqRow({ f, onSave }: { f: Fq; onSave: (f: Fq) => void }) {
  const { t: tr } = useLang();
  const [mode, setMode] = useState<"" | "edit" | "answer">(""); const [d, setD] = useState<Fq>(f);
  const tone = f.status === "answered" ? "green" : f.status === "closed" ? "slate" : f.prio === "blocker" ? "red" : f.prio === "important" ? "amber" : "blue";
  const save = (n: Fq) => { onSave(n); setMode(""); };
  return (
    <li className={"py-2 space-y-1 " + (isOpen(f) ? "" : "opacity-70")}>
      <div className="flex items-start gap-2">
        <span className="text-lg leading-6">{PRIO[f.prio].icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm" dir="ltr">{f.q}</div>
          <div className="flex flex-wrap items-center gap-1 mt-1 text-[11px] text-slate-500">
            <Badge tone={tone}>{tr(STATUS_HE[f.status])}</Badge><span>{f.cat} · {f.who}</span>
            {isOpen(f) && <span>· {tr("פתוח")} {daysOpen(f)} {tr("ימים")}</span>}{f.asked.length > 0 && <span>· {tr("נשאל")} {f.asked.length}× ({tr("ראשון")} {fmtD(f.asked[0])})</span>}{f.due && <span>· {tr("יעד")} {fmtD(f.due)}</span>}
            {f.leads.map((id) => <Link key={id} href={"/leads/" + id} className="px-1.5 rounded bg-slate-100 hover:bg-slate-200">{id}</Link>)}
          </div>
          {f.answer && <div className="mt-1 text-xs rounded bg-emerald-50 border border-emerald-200 px-2 py-1" dir="ltr">↳ {f.answer}{f.answered_at && " · " + fmtD(f.answered_at)}</div>}
        </div>
        <div className="flex flex-wrap gap-1 shrink-0">
          {isOpen(f) && <button className={btnGhost + " text-xs"} onClick={() => { setD(f); setMode(mode === "answer" ? "" : "answer"); }}>💬 {tr("תשובה")}</button>}
          <button className={btnGhost + " text-xs"} onClick={() => { setD(f); setMode(mode === "edit" ? "" : "edit"); }}>✏️</button>
          {isOpen(f) ? <button className={btnGhost + " text-xs"} title={tr("סגור בלי תשובה")} onClick={() => save({ ...f, status: "closed" })}>✕</button> : <button className={btnGhost + " text-xs"} onClick={() => save({ ...f, status: f.asked.length ? "asked" : "new", answered_at: null })}>↺</button>}
        </div>
      </div>
      {mode === "answer" && <div className="ms-7 space-y-1"><textarea className={inputCls} rows={2} dir="ltr" placeholder="Federica's answer (short)" value={d.answer} onChange={(e) => setD({ ...d, answer: e.target.value })} /><button className={btnPrimary + " text-xs"} onClick={() => save({ ...d, status: "answered", answered_at: new Date().toISOString() })}>✓ {tr("סמן כנענה")}</button></div>}
      {mode === "edit" && <div className="ms-7 grid md:grid-cols-4 gap-2">
        <textarea className={inputCls + " md:col-span-4"} rows={2} dir="ltr" value={d.q} onChange={(e) => setD({ ...d, q: e.target.value })} />
        <select className={inputCls} value={d.cat} onChange={(e) => setD({ ...d, cat: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <select className={inputCls} value={d.who} onChange={(e) => setD({ ...d, who: e.target.value, party: e.target.value === "Avshi" ? "sapirim" : "silitex" })}>{WHO.map((c) => <option key={c}>{c}</option>)}</select>
        <select className={inputCls} value={d.prio} onChange={(e) => setD({ ...d, prio: e.target.value as Fq["prio"] })}>{Object.entries(PRIO).map(([k, v]) => <option key={k} value={k}>{v.icon} {tr(v.he)}</option>)}</select>
        <input className={inputCls} placeholder="LEAD-169, LEAD-170" dir="ltr" value={d.leads.join(", ")} onChange={(e) => setD({ ...d, leads: e.target.value.split(/[,\s]+/).filter(Boolean) })} />
        <button className={btnPrimary + " text-xs md:col-span-4"} onClick={() => save(d)}>💾 {tr("שמור")}</button>
      </div>}
    </li>
  );
}
