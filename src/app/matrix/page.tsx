"use client";
// page.tsx (src/app/matrix/page.tsx) · created 20.10.2026 09:40 (Asia/Jerusalem) — MARKET MATRIX tab: builds itself from all customers + website scans (grows as sources are added). Tab 1 Pini: industry → factory → products → Silitex grades + blanks for supplier / volume. Tab 2 Federica: industry → product category → Silitex grade → gap yes/no, NO company names + 🇬🇧 English draft (AI). CSV + export bar + token meter.
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, H1, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { piniRows, federica, piniText, fedText, GAP_HE } from "@/lib/matrix";
import { scanOf } from "@/lib/scan";
import { fmtDate, todayIso } from "@/lib/format";
import type { Usage } from "@/lib/types";
import { useLang } from "@/i18n";
const esc = (s: string) => '"' + String(s || "").replace(/"/g, '""') + '"';
function download(name: string, rows: string[][]) { const blob = new Blob(["﻿" + rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); }
export default function MatrixPage() {
  const { t: tr } = useLang();
  const { state, ready, addSpend } = useStore();
  const [tab, setTab] = useState<"pini" | "fed">("pini"); const [ind, setInd] = useState(""); const [noT4, setNoT4] = useState(false); const [onlyScanned, setOnlyScanned] = useState(false);
  const [en, setEn] = useState(""); const [busy, setBusy] = useState(false); const [usage, setUsage] = useState<Usage | null>(null); const [err, setErr] = useState("");
  if (!ready) return null;
  const inds = Array.from(new Set(state.leads.map((l) => l.industry))).sort();
  const leads = state.leads.filter((l) => (!ind || l.industry === ind) && (!noT4 || !/^Tier 4/.test(l.tier || "")) && (!onlyScanned || scanOf(l))).sort((a, b) => a.industry.localeCompare(b.industry) || a.name.localeCompare(b.name));
  const rows = piniRows(leads); const fed = federica(leads);
  const scannedN = rows.filter((r) => r.scanned).length; const date = fmtDate(todayIso());
  const pText = piniText(rows); const fText = fedText(fed);
  const tabCls = (on: boolean) => "px-4 py-2 rounded-lg text-sm border " + (on ? "bg-brand-500 text-white border-brand-500" : "bg-white");
  const toEnglish = async () => {
    setBusy(true); setErr("");
    try { const r = await fetch("/api/matrix/en", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: fText }) }); const j = await r.json(); if (j.usage) { setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); } if (!r.ok) throw new Error(j.error || "error"); setEn(j.text); } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
    setBusy(false);
  };
  const piniCsv = () => download("pini_list_" + todayIso() + ".csv", [["Industry", "Factory", "City", "Tier", "Scanned", "Products", "Silitex grades", "To check", "Current supplier (Pini)", "Volume t/y (Pini)", "Notes (Pini)", "R&D questions"], ...rows.map((r) => [r.lead.industry, r.lead.name, r.lead.city || "", (r.lead.tier || "").split(" - ")[0], r.scanned ? "yes" : "no", r.products.join(" · "), r.grades.join(" · "), r.toCheck.join(" · "), r.supplier, "", "", r.questions.join(" | ")])]);
  const fedCsv = () => download("federica_market_map_" + todayIso() + ".csv", [["Industry", "Producers mapped", "Producers scanned", "Product category", "Producers", "Silitex grade(s)", "Gap"], ...fed.flatMap((i) => i.rows.map((r) => [i.industry, String(i.mapped), String(i.scanned), r.category, String(r.producers), r.grades.join(" · "), r.gap]))]);
  return (
    <div className="space-y-4">
      <H1 sub={tr("נבנה אוטומטית מכל הלקוחות וסריקות האתרים — כל מקור חדש וכל סריקה מתווספים לבד. פיני: לפי מפעל. פדריקה: לפי מוצר, בלי שמות מפעלים.")}>🗺️ {tr("מפת שוק — פיני ופדריקה")}</H1>
      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2"><button className={tabCls(tab === "pini")} onClick={() => setTab("pini")}>🧪 {tr("רשימת פיני — לפי מפעל")}</button><button className={tabCls(tab === "fed")} onClick={() => setTab("fed")}>🇮🇹 {tr("פדריקה — לפי מוצר, ללא שמות")}</button></div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <select className={inputCls + " max-w-xs"} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">{tr("כל התעשיות")}</option>{inds.map((i) => <option key={i} value={i}>{i}</option>)}</select>
          <label className="flex items-center gap-1"><input type="checkbox" checked={noT4} onChange={(e) => setNoT4(e.target.checked)} /> {tr("בלי Tier 4")}</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={onlyScanned} onChange={(e) => setOnlyScanned(e.target.checked)} /> {tr("רק נסרקו")}</label>
          <span className="text-slate-500" dir="ltr">{leads.length} · {scannedN} {tr("נסרקו")}</span>
          <Link href="/scan" className="text-brand-600 underline">🔎 {tr("לסרוק עוד")}</Link>
        </div>
      </Card>
      {tab === "pini" ? (
        <>
          <div className="flex gap-2"><button className={btnGhost} onClick={piniCsv}>⬇️ Excel (CSV)</button></div>
          {Array.from(new Set(rows.map((r) => r.lead.industry))).map((g) => (
            <Card key={g} className="space-y-2">
              <div className="font-bold">{g} <span className="font-normal text-slate-500 text-sm">({rows.filter((r) => r.lead.industry === g).length})</span></div>
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-slate-500 text-start border-b"><th className="text-start p-1">{tr("מפעל")}</th><th className="text-start p-1">{tr("מוצרים")}</th><th className="text-start p-1">{tr("מוצרי Silitex")}</th><th className="text-start p-1">{tr("ספק נוכחי")}</th></tr></thead>
                <tbody>{rows.filter((r) => r.lead.industry === g).map((r) => (
                  <tr key={r.lead.id} className="border-b align-top"><td className="p-1 min-w-[10rem]"><Link href={"/leads/" + r.lead.id} className="font-medium hover:underline">{r.lead.name}</Link><div className="text-xs text-slate-500">{r.lead.city} · {(r.lead.tier || "").split(" - ")[0]}{!r.scanned && <> · <Badge tone="amber">{tr("לא נסרק")}</Badge></>}</div></td>
                    <td className="p-1 text-xs" dir="auto">{r.products.join(" · ") || "—"}</td>
                    <td className="p-1 text-xs" dir="ltr">{r.grades.join(" · ") || "—"}{r.toCheck.length > 0 && <div className="text-amber-700">{tr("לבדוק")}: {r.toCheck.join(", ")}</div>}</td>
                    <td className="p-1 text-xs text-slate-500" dir="auto">{r.supplier || "—"}</td></tr>))}</tbody></table></div>
            </Card>))}
          <ExportBar title={tr("רשימת פיני — מפעלים, מוצרים ו-Silitex") + " · " + date} text={pText} filename={"pini_list_" + todayIso() + ".txt"} />
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2"><button className={btnGhost} onClick={fedCsv}>⬇️ Excel (CSV)</button><button className={btnPrimary} disabled={busy || !fText} onClick={toEnglish}>{busy ? tr("מכין...") : "🇬🇧 " + tr("טיוטה באנגלית לפדריקה")}</button></div>
          {fed.map((i) => (
            <Card key={i.industry} className="space-y-2">
              <div className="font-bold">{i.industry} <span className="font-normal text-slate-500 text-sm">· {i.mapped} {tr("יצרנים ממופים")} · {i.scanned} {tr("נסרקו")}</span></div>
              {i.rows.length === 0 ? <div className="text-xs text-slate-500">{tr("עדיין אין סריקות בתעשייה הזו")}</div> : (
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-slate-500 border-b"><th className="text-start p-1">{tr("קטגוריית מוצר")}</th><th className="text-start p-1">{tr("יצרנים")}</th><th className="text-start p-1">{tr("מוצרי Silitex")}</th><th className="text-start p-1">{tr("פער")}</th></tr></thead>
                  <tbody>{i.rows.map((r) => (<tr key={r.category} className="border-b align-top"><td className="p-1" dir="auto">{r.category}</td><td className="p-1" dir="ltr">{r.producers}</td><td className="p-1 text-xs" dir="ltr">{r.grades.join(" · ") || "—"}</td><td className="p-1"><Badge tone={r.gap === "yes" ? "red" : r.gap === "no" ? "green" : "amber"}>{tr(GAP_HE[r.gap])}</Badge></td></tr>))}</tbody></table></div>)}
            </Card>))}
          {err && <div className="text-sm text-red-600">{err}</div>}
          {en && <Card><div className="font-bold mb-2">🇬🇧 {tr("טיוטה לפדריקה")}</div><pre className="whitespace-pre-wrap text-sm" dir="ltr">{en}</pre></Card>}
          <ExportBar title={en ? "Israel market map — Silitex · " + date : tr("מפת שוק לפדריקה (ללא שמות)") + " · " + date} text={en || fText} filename={"federica_market_map_" + todayIso() + ".txt"} />
        </>
      )}
      <TokenMeter usage={usage} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} busy={busy} />
    </div>
  );
}
