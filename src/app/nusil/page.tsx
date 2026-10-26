"use client";
// page.tsx (src/app/nusil/page.tsx) · created 26.10.2026 10:50 (Asia/Jerusalem) — v0.98.0 — OWNER ONLY (not in partner paths: prices + volumes)
// 🧬 NuSil CareSil™ — the REAL range (codes, INCI, cyclic status, 2016 drum price, Dow equivalent) + Sapirim's Israeli Dow purchasing 2010–2013,
// to plan the D4/D5/D6 switch before the EU limit (D5 & D6 ≤ 0.1 % in leave-on cosmetics from 06/06/2027). Data: src/data/nusil_caresil.json.
import { useMemo, useState } from "react";
import { Card, H1, Badge, inputCls } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import { useLang } from "@/i18n";
import data from "@/data/nusil_caresil.json";

type Cs = { code: string; family: string; inci: string; viscosity: string; d4: string; cyclic: string; price_usd_kg_drum_2016: number; dow_equiv: string };
type Hist = { dc: string; inci: string; nusil: string; jeen: string; chemsil: string; kg_year: number; eur_kg: number | null; cyclic: boolean };
const CS = data.caresil as Cs[]; const HI = (data.israel_history as Hist[]).slice().sort((a, b) => b.kg_year - a.kg_year);
const t = (kg: number) => (kg >= 1000 ? (kg / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + " t" : kg ? kg + " kg" : "—");
const th = "border-b p-1.5 text-start bg-slate-50 font-semibold"; const td = "border-b p-1.5 align-top";

export default function NusilPage() {
  const { t: tr } = useLang(); const [q, setQ] = useState(""); const [onlyFree, setOnlyFree] = useState(false);
  const rows = useMemo(() => CS.filter((r) => (!onlyFree || r.cyclic === "free") && (r.code + r.inci + r.family + r.dow_equiv).toLowerCase().includes(q.toLowerCase())), [q, onlyFree]);
  const tot = HI.reduce((s, h) => s + h.kg_year, 0); const cyc = HI.filter((h) => h.cyclic).reduce((s, h) => s + h.kg_year, 0);
  const text = CS.map((r) => r.code + " · " + r.inci + " · " + (r.cyclic === "free" ? "cyclic-free" : r.cyclic) + " · $" + r.price_usd_kg_drum_2016 + "/kg (2016) · Dow: " + r.dow_equiv).join("\n");
  return (
    <div className="space-y-4">
      <H1 sub={tr("הטווח האמיתי של NuSil CareSil — INCI, מצב D4/D5/D6, מחיר תוף 2016 ומקבילת Dow · מול רכש Dow של ספירים 2010–2013. פנימי בלבד.")}>🧬 NuSil CareSil™ — {tr("מעבר ל-cyclic-free")}</H1>
      <div className="grid md:grid-cols-4 gap-2">
        <Card><div className="text-2xl font-bold text-brand-600">{t(tot)}</div><div className="text-xs text-slate-500">{tr("רכש Dow שנתי של ספירים 2010–2013")}</div></Card>
        <Card><div className="text-2xl font-bold text-red-600">{t(cyc)}</div><div className="text-xs text-slate-500">{tr("מזה ציקלי (D4/D5/D6)")} — {Math.round((cyc / tot) * 100)}%</div></Card>
        <Card><div className="text-2xl font-bold text-emerald-700">{CS.filter((r) => r.cyclic === "free").length} / {CS.length}</div><div className="text-xs text-slate-500">{tr("מוצרי CareSil נקיים מציקליים")}</div></Card>
        <Card><div className="text-2xl font-bold">06/06/2027</div><div className="text-xs text-slate-500">{tr("EU: D5 + D6 ≤ 0.1% במוצרי leave-on")}</div></Card>
      </div>
      <Card>
        <div className="flex flex-wrap items-center gap-2 mb-2"><b>{tr("טווח CareSil")}</b><input className={inputCls + " !w-60"} placeholder={tr("חיפוש: קוד / INCI / Dow")} value={q} onChange={(e) => setQ(e.target.value)} /><label className="text-sm flex items-center gap-1"><input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} />{tr("רק cyclic-free")}</label></div>
        <div className="overflow-auto"><table className="w-full text-xs" dir="ltr"><thead><tr><th className={th}>Code</th><th className={th}>Family</th><th className={th}>INCI</th><th className={th}>Cyclic</th><th className={th}>Viscosity</th><th className={th}>D4 spec</th><th className={th}>$/kg drum (2016)</th><th className={th}>Dow equivalent</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.code}><td className={td + " font-bold"}>{r.code}</td><td className={td}>{r.family}</td><td className={td}>{r.inci}</td><td className={td}><Badge tone={r.cyclic === "free" ? "green" : "red"}>{r.cyclic === "free" ? "cyclic-free" : r.cyclic}</Badge></td><td className={td}>{r.viscosity}</td><td className={td}>{r.d4}</td><td className={td}>{r.price_usd_kg_drum_2016}</td><td className={td}>{r.dow_equiv}</td></tr>)}</tbody></table></div>
        <ExportBar title="NuSil CareSil range — cyclic status" text={text} filename="nusil_caresil" />
      </Card>
      <Card>
        <b>{tr("רכש Dow של ספירים בישראל — ממוצע שנתי 2010–2013")}</b>
        <div className="overflow-auto mt-2"><table className="w-full text-xs" dir="ltr"><thead><tr><th className={th}>Dow product</th><th className={th}>INCI</th><th className={th}>kg / year</th><th className={th}>€/kg CIF Haifa</th><th className={th}>Cyclic</th><th className={th}>NuSil</th><th className={th}>Jeen</th><th className={th}>Chemsil</th></tr></thead>
          <tbody>{HI.map((h, i) => <tr key={i} className={h.cyclic ? "bg-red-50/50" : ""}><td className={td + " font-bold"}>{h.dc}</td><td className={td}>{h.inci}</td><td className={td + " text-end"}>{h.kg_year ? h.kg_year.toLocaleString("en-US") : "—"}</td><td className={td}>{h.eur_kg ?? "—"}</td><td className={td}>{h.cyclic ? <Badge tone="red">D4/D5/D6</Badge> : ""}</td><td className={td}>{h.nusil || "—"}</td><td className={td}>{h.jeen || "—"}</td><td className={td}>{h.chemsil || "—"}</td></tr>)}</tbody></table></div>
        <div className="text-[11px] text-slate-500 mt-2">{data.source}</div>
      </Card>
    </div>
  );
}
