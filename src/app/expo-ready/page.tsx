"use client";
// page.tsx (src/app/expo-ready/page.tsx) · created 28.10.2026 08:30 (Asia/Jerusalem) — v1.3.0 🎪 Expo Ready — research packs for Federica's 2 shows (Fi Europe Frankfurt 17–19/11 · Paint & Coatings Barcelona 18–19/11): show facts, day route, stand briefs, distributors / competitors, English PDF + export bar. OWNER ONLY. Data: src/data/expo-ready/*.json
import { useState } from "react";
import { Card, H1 } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import StandCard from "@/components/expo-ready/StandCard";
import RouteTable from "@/components/expo-ready/RouteTable";
import { PACKS, packText, where } from "@/lib/expo-ready";
import { useLang } from "@/i18n";

export default function ExpoReadyPage() {
  const { t: tr } = useLang();
  const [id, setId] = useState(PACKS[0].id);
  const p = PACKS.find((x) => x.id === id) || PACKS[0];
  const a = p.top.filter((s) => s.grade === "A").length;
  const unverified = p.top.filter((s) => s.stand_verified === false || !s.stand).length;
  const tabCls = (on: boolean) => "px-3 py-1.5 rounded-lg border text-sm " + (on ? "bg-brand-600 text-white border-brand-600" : "bg-white hover:bg-slate-50");
  return (
    <div className="space-y-4">
      <H1 sub={tr("חבילות מחקר באנגלית לפדריקה לשתי התערוכות — מסלול יומי, תדריך לכל דוכן, מה Silitex מציעה ו-3 שאלות פתיחה. PDF מוכן לשליחה.")}>🎪 Expo Ready — Federica</H1>
      <div className="flex flex-wrap gap-2 print:hidden">{PACKS.map((x) => <button key={x.id} className={tabCls(x.id === id)} onClick={() => setId(x.id)}>{x.show.name} · {x.show.city}</button>)}</div>
      <div className="grid md:grid-cols-4 gap-2" dir="ltr">
        <Card><div className="font-bold">{p.show.dates}</div><div className="text-xs text-slate-500">{p.show.venue}{p.show.hours ? " · " + p.show.hours : ""}</div>{p.show.own_stand && <div className="text-sm font-bold text-brand-700 mt-1">★ Silitex stand: {p.show.own_stand}</div>}</Card>
        <Card><div className="text-2xl font-bold text-brand-600">{p.screened_count}</div><div className="text-xs text-slate-500">exhibitors screened</div></Card>
        <Card><div className="text-2xl font-bold text-emerald-700">{p.top.length} <span className="text-base">({a} A)</span></div><div className="text-xs text-slate-500">stand briefs</div></Card>
        <Card><div className={"text-2xl font-bold " + (unverified ? "text-amber-600" : "text-emerald-700")}>{unverified}</div><div className="text-xs text-slate-500">stands to confirm ⚠</div></Card>
      </div>
      <div className="flex flex-wrap gap-2 print:hidden">
        <a className="px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-slate-50" href={p.pdf} target="_blank" rel="noreferrer">⬇️ PDF (English) — {p.show.name}</a>
      </div>
      {p.show.notes && <Card><div className="text-sm" dir="ltr">{p.show.notes}</div></Card>}
      <Card><div className="font-bold mb-2" dir="ltr">🗺️ Day route — hall by hall</div><RouteTable top={p.top} /></Card>
      <div className="grid md:grid-cols-2 gap-3">{p.top.map((s, i) => <StandCard key={s.company + i} s={s} n={i + 1} />)}</div>
      {!!p.distributors?.length && <Card><div className="font-bold mb-1" dir="ltr">🤝 Distributors on the floor</div><ul className="text-sm space-y-0.5" dir="ltr">{p.distributors.map((d) => <li key={d.company}><b>{d.company}</b>{d.country ? " (" + d.country + ")" : ""} — {where(d)} — {d.one_line}</li>)}</ul></Card>}
      {!!p.competitors?.length && <Card><div className="font-bold mb-1" dir="ltr">🥊 Additive competitors exhibiting (know where they are)</div><ul className="text-sm space-y-0.5" dir="ltr">{p.competitors.map((d) => <li key={d.company}><b>{d.company}</b> — {where(d)} — {d.one_line}</li>)}</ul></Card>}
      {!!p.others?.length && <Card><div className="font-bold mb-1" dir="ltr">Also screened ({p.others.length})</div><ul className="text-xs space-y-0.5 columns-1 md:columns-2" dir="ltr">{p.others.map((d) => <li key={d.company}><b>{d.company}</b> · {d.grade || ""} · {where(d)} — {d.one_line}</li>)}</ul></Card>}
      {!!p.show.sources?.length && <div className="text-xs text-slate-500" dir="ltr">Sources: {p.show.sources.map((u) => <a key={u} className="underline me-2" href={u} target="_blank" rel="noreferrer">{u.replace(/^https?:\/\//, "").slice(0, 50)}</a>)}</div>}
      <ExportBar title={"Silitex Expo Ready — " + p.show.name + " " + p.show.city} text={packText(p)} filename={"Silitex_Expo_Ready_" + p.id} />
    </div>
  );
}
