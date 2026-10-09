"use client";
// page.tsx (src/app/products/page.tsx) · updated 09.10.2026 09:10 (Asia/Jerusalem) — catalog filtered by industry + spec + INCI + certification
import { useMemo, useState } from "react";
import { PRODUCTS, INDUSTRIES, industriesOf, offsetForProduct } from "@/lib/data";
import { Card, H1, Badge, inputCls, certTone } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import type { Product } from "@/lib/types";
const CATS = Array.from(new Set(PRODUCTS.map((p) => p.category_sector)));
const IONS = ["Non-ionic", "Cationic", "Anionic"];
export default function ProductsPage() {
  const [q, setQ] = useState(""); const [ind, setInd] = useState(""); const [cat, setCat] = useState(""); const [ion, setIon] = useState(""); const [cert, setCert] = useState(""); const [visc, setVisc] = useState("");
  const [sel, setSel] = useState<Product | null>(null);
  const list = useMemo(() => PRODUCTS.filter((p) => {
    if (ind && !industriesOf(p).includes(ind)) return false;
    if (cat && p.category_sector !== cat) return false;
    if (ion && !p.ionicity.toLowerCase().includes(ion.toLowerCase())) return false;
    if (visc && !p.viscosity.toLowerCase().startsWith(visc.toLowerCase())) return false;
    if (cert === "kosher" && !/kosher/i.test(p.food_grade_certifications)) return false;
    if (cert === "fda" && !/fda|e900/i.test(p.food_grade_certifications)) return false;
    if (cert === "eco" && !/eco|gots|bio|plant/i.test(p.food_grade_certifications + p.key_features)) return false;
    if (q) { const h = Object.values(p).join(" ").toLowerCase(); if (!h.includes(q.toLowerCase())) return false; }
    return true;
  }), [q, ind, cat, ion, cert, visc]);
  return (
    <div className="space-y-4">
      <H1 sub="סינון לפי תעשייה · מפרט · INCI · אישורים">קטלוג Silitex — {list.length} / {PRODUCTS.length} מוצרים</H1>
      <Card className="grid md:grid-cols-6 gap-2">
        <input className={inputCls + " md:col-span-2"} placeholder="חיפוש חופשי: שם, INCI, יישום, מקבילה (Dow / Wacker…)" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">כל התעשיות</option>{INDUSTRIES.map((i) => <option key={i.key} value={i.key}>{i.he}</option>)}</select>
        <select className={inputCls} value={cat} onChange={(e) => setCat(e.target.value)}><option value="">כל הקטגוריות</option>{CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        <select className={inputCls} value={ion} onChange={(e) => setIon(e.target.value)}><option value="">יוניות: הכל</option>{IONS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        <select className={inputCls} value={cert} onChange={(e) => setCert(e.target.value)}><option value="">אישורים: הכל</option><option value="kosher">כשר</option><option value="fda">FDA / E900</option><option value="eco">אקולוגי / ביו</option></select>
        <select className={inputCls} value={visc} onChange={(e) => setVisc(e.target.value)}><option value="">צמיגות: הכל</option><option value="ultra">Ultra-Low</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
      </Card>
      <div className="grid lg:grid-cols-[1fr_420px] gap-4 items-start">
        <div className="grid md:grid-cols-2 gap-3">
          {list.map((p) => (
            <button key={p.id} onClick={() => setSel(p)} className={"text-right border rounded-xl p-3 bg-white hover:border-brand-500 " + (sel?.id === p.id ? "border-brand-500 ring-2 ring-brand-100" : "")}>
              <div className="flex justify-between items-start gap-2"><div className="font-bold">{p.product_name}</div><Badge tone="slate">{p.id}</Badge></div>
              <div className="text-xs text-slate-500">{p.category_sector}</div>
              <div className="text-xs mt-1 line-clamp-2">{p.application_field}</div>
              <div className="flex flex-wrap gap-1 mt-2"><Badge tone="blue">{p.active_content_pct}</Badge><Badge>{p.ionicity}</Badge><Badge tone={certTone(p.food_grade_certifications)}>{p.food_grade_certifications.split(",")[0]}</Badge></div>
            </button>
          ))}
        </div>
        <Card className="sticky top-4">{sel ? <Detail p={sel} /> : <p className="text-sm text-slate-500">בחר מוצר להצגת מפרט, INCI ומקבילות.</p>}</Card>
      </div>
    </div>
  );
}
function Detail({ p }: { p: Product }) {
  const off = offsetForProduct(p);
  const rows: [string, string][] = [["משפחה", p.brand_family], ["INCI", p.inci_chemical_name], ["חומר פעיל", p.active_matter_type], ["ריכוז", p.active_content_pct], ["מראה", p.appearance], ["צמיגות", p.viscosity], ["יוניות", p.ionicity], ["pH", p.ph_range], ["מסיסות", p.dilution_solubility], ["אישורים", p.food_grade_certifications], ["תכונות", p.key_features], ["יישומים", p.application_field], ["מקבילה Dow / אחרים", p.dow_corning_offset_benchmark]];
  const text = rows.map(([k, v]) => k + ": " + v).join("\n") + (off ? "\n\nמקבילות עולמיות (" + off.category_id + "):\n" + Object.entries(off.offsets).filter(([, v]) => v !== "N/A").map(([k, v]) => k + " → " + v).join("\n") : "");
  return (
    <div>
      <div className="font-bold text-lg">{p.product_name}</div>
      <div className="text-xs text-slate-500 mb-2">{p.id} · {p.category_sector}</div>
      <dl className="text-sm space-y-1">{rows.map(([k, v]) => (<div key={k} className="grid grid-cols-[110px_1fr] gap-1"><dt className="text-slate-500">{k}</dt><dd>{v}</dd></div>))}</dl>
      {off && (<div className="mt-3"><div className="font-medium text-sm mb-1">מקבילות יצרנים ({off.category_id})</div><div className="flex flex-wrap gap-1">{Object.entries(off.offsets).filter(([, v]) => v !== "N/A").slice(0, 12).map(([k, v]) => <Badge key={k}>{k}: {v}</Badge>)}</div></div>)}
      <ExportBar title={"Silitex " + p.product_name + " — מפרט"} text={text} />
    </div>
  );
}
