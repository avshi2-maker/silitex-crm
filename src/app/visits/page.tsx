"use client";
// page.tsx (src/app/visits/page.tsx) · updated 20.10.2026 05:20 (Asia/Jerusalem) — VISIT PLANNER: start point (my location / saved address) → pick region or a customer → nearest customers → shortest route order with drive times and meeting slots → 🗺️ Google Maps route · 🚗 Waze per stop · 📅 book all visits as tasks on the chosen date · export bar.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, H1, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import RouteMap from "@/components/visits/RouteMap";
import { hasGeo, km, driveMin, REGIONS, regionOf, orderRoute, gmapsRoute, wazeUrl, type Pt } from "@/lib/geo";
import { addDays, todayIso, fmtDate } from "@/lib/format";
import { isClosed } from "@/config/stages";
import { useLang } from "@/i18n";
const LS = "silitex-visit-start-v1";
const hm = (m: number) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
export default function VisitsPage() {
  const { t: tr } = useLang();
  const { state, ready, addTask } = useStore();
  const [start, setStart] = useState<(Pt & { label: string }) | null>(null); const [q, setQ] = useState(""); const [hits, setHits] = useState<{ lat: number; lon: number; label: string }[]>([]);
  const [region, setRegion] = useState(""); const [sel, setSel] = useState<string[]>([]); const [date, setDate] = useState(addDays(todayIso(), 1)); const [t0, setT0] = useState("09:00"); const [meet, setMeet] = useState(60); const [msg, setMsg] = useState("");
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(LS) || "null"); if (s) setStart(s); } catch {} }, []);
  const saveStart = (s: Pt & { label: string }) => { setStart(s); setHits([]); try { localStorage.setItem(LS, JSON.stringify(s)); } catch {} };
  const geoMe = () => navigator.geolocation?.getCurrentPosition((p) => saveStart({ lat: Number(p.coords.latitude.toFixed(5)), lon: Number(p.coords.longitude.toFixed(5)), label: tr("המיקום שלי") }), () => setMsg(tr("אין הרשאת מיקום — הקלד כתובת")));
  const findStart = async () => { const r = await fetch("/api/geo?q=" + encodeURIComponent(q)); const j = await r.json(); setHits(j.results || []); };
  const geoLeads = useMemo(() => state.leads.filter((l) => hasGeo(l) && !isClosed(l.stage)).map((l) => ({ id: l.id, name: l.name, lat: l.lat as number, lon: l.lon as number, lead: l })), [state.leads]);
  // ?with=LEAD → that customer + its 4 nearest
  useEffect(() => { if (!ready) return; try { const w = new URLSearchParams(window.location.search).get("with"); const c = w && geoLeads.find((x) => x.id === w); if (c) setSel([c.id, ...geoLeads.filter((x) => x.id !== c.id).sort((a, b) => km(c, a) - km(c, b)).slice(0, 4).map((x) => x.id)]); } catch {} }, [ready, geoLeads]);
  if (!ready) return null;
  const list = geoLeads.filter((l) => !region || regionOf(l) === region).sort((a, b) => (start ? km(start, a) - km(start, b) : a.name.localeCompare(b.name)));
  const chosen = geoLeads.filter((l) => sel.includes(l.id));
  const route = start ? orderRoute(start, chosen) : chosen;
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  // timeline
  let clock = Number(t0.split(":")[0]) * 60 + Number(t0.split(":")[1] || 0); let prev: Pt | null = start; let totalKm = 0;
  const rows = route.map((r) => { const d = prev ? km(prev, r) * 1.3 : 0; const m = prev ? driveMin(prev, r) : 0; totalKm += d; clock += m; const at = clock; clock += meet; prev = r; return { r, d, m, at }; });
  const noGeo = state.leads.filter((l) => !hasGeo(l) && !isClosed(l.stage));
  const book = () => { rows.forEach(({ r, at }) => addTask({ lead_id: r.id, lead_name: r.name, title: tr("ביקור") + " " + hm(at) + (r.lead.address ? " · " + r.lead.address : r.lead.city ? " · " + r.lead.city : ""), due: date, cadence: "once", kind: "visit" })); setMsg(tr("נקבעו ") + rows.length + tr(" ביקורים ב-") + fmtDate(date) + " ✓"); };
  const text = tr("יום ביקורים") + " " + fmtDate(date) + "\n" + rows.map(({ r, at, d }, i) => (i + 1) + ". " + hm(at) + " " + r.name + " — " + (r.lead.address || r.lead.city || "") + " (" + Math.round(d) + " km)\n   " + wazeUrl(r.lead)).join("\n") + "\n" + tr("סה\"כ") + " ~" + Math.round(totalKm) + " km";
  const chip = (on: boolean) => "px-3 py-1 rounded-full border text-sm " + (on ? "bg-brand-500 text-white border-brand-500" : "bg-white");
  return (
    <div className="space-y-4">
      <H1 sub={tr("בוחרים אזור או לקוח → הלקוחות הקרובים → מסלול קצר, שעות ונסיעה → Waze / Google Maps → שיבוץ כל הביקורים ביומן בלחיצה.")}>🚗 {tr("תכנון ביקורים")}</H1>
      <Card className="space-y-2">
        <div className="font-bold">1. {tr("נקודת יציאה")}{start && <span className="font-normal text-sm text-slate-500"> · {start.label}</span>}</div>
        <div className="flex flex-wrap gap-2"><button className={btnGhost} onClick={geoMe}>📍 {tr("המיקום שלי")}</button><input className={inputCls + " max-w-sm"} dir="auto" placeholder={tr("או כתובת: רחוב, עיר")} value={q} onChange={(e) => setQ(e.target.value)} /><button className={btnGhost} disabled={q.trim().length < 3} onClick={findStart}>{tr("מצא")}</button></div>
        {hits.length > 0 && <ul className="text-xs border rounded-lg divide-y max-w-xl">{hits.map((h, i) => <li key={i}><button className="w-full text-start p-2 hover:bg-slate-50" onClick={() => saveStart(h)}>✓ {h.label}</button></li>)}</ul>}
      </Card>
      <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="space-y-4">
          <Card className="space-y-2">
            <div className="font-bold">2. {tr("בחר לקוחות")} <span className="text-sm font-normal text-slate-500">({sel.length} {tr("נבחרו")})</span></div>
            <div className="flex flex-wrap gap-1"><button className={chip(!region)} onClick={() => setRegion("")}>{tr("הכל")}</button>{REGIONS.map((r) => <button key={r.key} className={chip(region === r.key)} onClick={() => setRegion(r.key)}>{tr(r.he)} <span className="opacity-70">{geoLeads.filter((l) => regionOf(l) === r.key).length}</span></button>)}</div>
            <ul className="divide-y text-sm max-h-80 overflow-auto">{list.map((l) => <li key={l.id} className="flex items-center gap-2 py-1.5"><input type="checkbox" checked={sel.includes(l.id)} onChange={() => toggle(l.id)} /><Link href={"/leads/" + l.id} className="flex-1 truncate hover:underline">{l.name}</Link><span className="text-xs text-slate-400 truncate max-w-[10rem]">{l.lead.address || l.lead.city}</span>{start && <span className="text-xs text-slate-500 w-14 text-end" dir="ltr">{Math.round(km(start, l) * 1.3)} km</span>}</li>)}</ul>
            {noGeo.length > 0 && <div className="text-xs text-amber-700">{noGeo.length} {tr("לקוחות בלי מיקום — הוסף כתובת בכרטיס הלקוח:")} {noGeo.slice(0, 8).map((l) => <Link key={l.id} href={"/leads/" + l.id} className="underline me-2">{l.name}</Link>)}</div>}
          </Card>
          <Card className="space-y-2">
            <div className="flex flex-wrap items-end gap-2"><div className="font-bold flex-1">3. {tr("המסלול")}</div>
              <label className="text-xs text-slate-500">{tr("תאריך")}<input type="date" className={inputCls + " mt-1"} value={date} onChange={(e) => setDate(e.target.value)} /></label>
              <label className="text-xs text-slate-500">{tr("יציאה")}<input type="time" className={inputCls + " mt-1"} value={t0} onChange={(e) => setT0(e.target.value)} /></label>
              <label className="text-xs text-slate-500">{tr("דקות לפגישה")}<select className={inputCls + " mt-1"} value={meet} onChange={(e) => setMeet(Number(e.target.value))}>{[30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m}</option>)}</select></label></div>
            {!start && <div className="text-xs text-amber-700">{tr("בחר נקודת יציאה כדי לקבל סדר מסלול וזמני נסיעה")}</div>}
            {rows.length === 0 ? <div className="text-sm text-slate-400">{tr("סמן לקוחות ברשימה או על המפה")}</div> :
              <table className="w-full text-sm"><thead><tr className="text-xs text-slate-500"><th className="text-start p-1">#</th><th className="text-start p-1">{tr("שעה")}</th><th className="text-start p-1">{tr("לקוח")}</th><th className="text-start p-1">{tr("נסיעה")}</th><th></th></tr></thead>
                <tbody>{rows.map(({ r, d, m, at }, i) => <tr key={r.id} className="border-t"><td className="p-1">{i + 1}</td><td className="p-1 font-medium" dir="ltr">{hm(at)}</td><td className="p-1"><div>{r.name}</div><div className="text-xs text-slate-400">{r.lead.address || r.lead.city}</div></td><td className="p-1 text-xs text-slate-500" dir="ltr">{Math.round(d)} km · {m} min</td><td className="p-1"><a className={btnGhost + " text-xs"} href={wazeUrl(r.lead)} target="_blank" rel="noreferrer">🚗 Waze</a></td></tr>)}</tbody></table>}
            {rows.length > 0 && <div className="text-xs text-slate-500">{tr("סה\"כ")} ~<span dir="ltr">{Math.round(totalKm)} km</span> · {tr("סיום משוער")} <span dir="ltr">{hm(clock)}</span> · {tr("הערכת נסיעה לפי מרחק — זמן אמיתי ב-Waze")}</div>}
            <div className="flex flex-wrap gap-2">
              {start && rows.length > 0 && <a className={btnGhost} href={gmapsRoute(start, route)} target="_blank" rel="noreferrer">🗺️ {tr("מסלול מלא ב-Google Maps")}</a>}
              <button className={btnPrimary} disabled={!rows.length} onClick={book}>📅 {tr("שבץ את כל הביקורים ביומן")}</button>
            </div>
            {msg && <div className="text-sm text-emerald-700">{msg}</div>}
          </Card>
          {rows.length > 0 && <ExportBar title={tr("יום ביקורים") + " " + fmtDate(date)} text={text} filename={"visits_" + date + ".txt"} />}
        </div>
        <Card><RouteMap start={start} all={list} route={route} onToggle={toggle} /><div className="text-[11px] text-slate-400 mt-1">{tr("לחיצה על נקודה = הוספה / הסרה מהמסלול")}</div></Card>
      </div>
    </div>
  );
}
