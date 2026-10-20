"use client";
// LocationCard.tsx (src/components/visits/LocationCard.tsx) · updated 20.10.2026 05:20 (Asia/Jerusalem) — CUSTOMER LOCATION box on the customer page: exact site address → 📍 find on map (GPS) → save; 🚗 Waze / Google Maps buttons; 5 nearest other customers (km) → plan a visit day around this customer.
import { useState } from "react";
import Link from "next/link";
import { Card, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { hasGeo, km, wazeUrl, gmapsUrl, regionOf, REGIONS } from "@/lib/geo";
import type { Lead } from "@/lib/types";
import { useLang } from "@/i18n";
type Hit = { lat: number; lon: number; label: string };
export default function LocationCard({ lead, leads, onSave }: { lead: Lead; leads: Lead[]; onSave: (l: Lead) => void }) {
  const { t: tr } = useLang();
  const [addr, setAddr] = useState(lead.address || ""); const [hits, setHits] = useState<Hit[]>([]); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const find = async () => { setBusy(true); setMsg(""); try { const r = await fetch("/api/geo?q=" + encodeURIComponent(addr)); const j = await r.json(); setHits(j.results || []); if (!j.results?.length) setMsg(tr("לא נמצא — נסה כתובת מלאה: רחוב, מספר, עיר")); } catch { setMsg(tr("שגיאה")); } setBusy(false); };
  const pick = (h: Hit) => { onSave({ ...lead, address: addr.trim(), lat: h.lat, lon: h.lon, city: lead.city || h.label.split(",").slice(-3, -2)[0]?.trim() || lead.city }); setHits([]); setMsg(tr("נשמר ✓")); };
  const saveText = () => { onSave({ ...lead, address: addr.trim() }); setMsg(tr("נשמר ✓")); };
  const near = hasGeo(lead) ? leads.filter((l) => l.id !== lead.id && hasGeo(l)).map((l) => ({ l, d: km(lead as { lat: number; lon: number }, l as { lat: number; lon: number }) })).sort((a, b) => a.d - b.d).slice(0, 5) : [];
  const reg = REGIONS.find((r) => r.key === regionOf(lead))?.he;
  return (
    <Card className="space-y-2">
      <div className="flex items-center gap-2"><div className="font-bold flex-1">📍 {tr("כתובת ומיקום")}</div>{reg && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100">{tr(reg)}</span>}</div>
      <div className="flex gap-2"><input className={inputCls + " text-sm"} dir="auto" placeholder={tr("רחוב, מספר, עיר / אזור תעשייה")} value={addr} onChange={(e) => setAddr(e.target.value)} /><button className={btnGhost + " whitespace-nowrap"} disabled={busy || addr.trim().length < 3} onClick={find}>{busy ? "…" : "📍 " + tr("מצא")}</button></div>
      {hits.length > 0 && <ul className="text-xs border rounded-lg divide-y">{hits.map((h, i) => <li key={i}><button className="w-full text-start p-2 hover:bg-slate-50" onClick={() => pick(h)}>✓ {h.label}</button></li>)}<li><button className="w-full text-start p-2 text-slate-500 hover:bg-slate-50" onClick={saveText}>{tr("שמור רק את הטקסט (בלי מיקום)")}</button></li></ul>}
      {msg && <div className="text-xs text-slate-500">{msg}</div>}
      <div className="flex flex-wrap gap-2">
        <a className={btnPrimary + " text-sm"} href={wazeUrl(lead)} target="_blank" rel="noreferrer">🚗 Waze</a>
        <a className={btnGhost + " text-sm"} href={gmapsUrl(lead)} target="_blank" rel="noreferrer">🗺️ Google Maps</a>
        {hasGeo(lead) && <Link className={btnGhost + " text-sm"} href={"/visits?with=" + lead.id}>📅 {tr("תכנן יום ביקורים סביב הלקוח")}</Link>}
      </div>
      {!hasGeo(lead) && <div className="text-xs text-amber-700">{tr("אין מיקום מדויק — הקלד כתובת ולחץ מצא, כדי לתכנן מסלול")}</div>}
      {near.length > 0 && <div className="text-xs"><div className="text-slate-500 mb-1">{tr("לקוחות קרובים")}</div><ul className="space-y-0.5">{near.map(({ l, d }) => <li key={l.id} className="flex gap-2"><Link href={"/leads/" + l.id} className="text-brand-700 hover:underline flex-1 truncate">{l.name}</Link><span className="text-slate-400" dir="ltr">{Math.round(d)} km</span></li>)}</ul></div>}
    </Card>
  );
}
