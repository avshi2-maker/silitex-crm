"use client";
// page.tsx (src/app/roadmap/page.tsx) · created 20.10.2026 13:20 (Asia/Jerusalem) — 6-MONTH ROADMAP tab: live A/B/C/D priority for every customer (score breakdown + reasons), grade × industry matrix, month-by-month plan (new accounts per month, expected first orders, milestones incl. son's hand-over), 🤖 AI strategy (Hebrew) + token meter + export bar + CSV. Rebuilds itself as leads / scans / steps change.
import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, H1, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { buildRoadmap, roadmapText } from "@/lib/roadmap";
import { GRADE_HE, type Grade } from "@/lib/priority";
import { todayIso, fmtDate } from "@/lib/format";
import type { Usage } from "@/lib/types";
import { useLang } from "@/i18n";
const TONE: Record<Grade, string> = { A: "green", B: "blue", C: "amber", D: "slate" };
export default function RoadmapPage() {
  const { t: tr } = useLang();
  const { state, ready, addSpend } = useStore();
  const [cap, setCap] = useState(12); const [view, setView] = useState<"plan" | "list">("plan"); const [g, setG] = useState<Grade | "">("");
  const [ai, setAi] = useState(""); const [busy, setBusy] = useState(false); const [usage, setUsage] = useState<Usage | null>(null); const [err, setErr] = useState("");
  const rm = useMemo(() => buildRoadmap(state.leads, state.tasks, cap), [state.leads, state.tasks, cap]);
  if (!ready) return null;
  const all = [...rm.ranked];
  const count = (x: Grade) => all.filter((r) => r.s.grade === x).length;
  const tons = (x: Grade) => all.filter((r) => r.s.grade === x).reduce((a, r) => a + r.s.tons, 0);
  const inds = Array.from(new Set(all.map((r) => r.lead.industry))).sort();
  const text = roadmapText(rm);
  const summary = () => {
    const top = all.slice(0, 30).map((r) => r.lead.name + " | " + r.lead.industry + " | " + r.s.grade + " " + r.s.total + " (vol " + r.s.vol + ", fit " + r.s.fit + ", access " + r.s.access + ", speed " + r.s.speed + ") | " + r.s.why.join("; ")).join("\n");
    const byInd = inds.map((i) => i + ": " + (["A", "B", "C", "D"] as Grade[]).map((x) => x + "=" + all.filter((r) => r.lead.industry === i && r.s.grade === x).length).join(" ")).join("\n");
    return "Today " + fmtDate(todayIso()) + ". Grades: A=" + count("A") + " B=" + count("B") + " C=" + count("C") + " D=" + count("D") + ". Est. annual potential tons A=" + tons("A").toFixed(1) + " B=" + tons("B").toFixed(1) + "\n\nINDUSTRIES\n" + byInd + "\n\nTOP 30\n" + top + "\n\nMONTH PLAN\n" + text;
  };
  const runAi = async () => { setBusy(true); setErr(""); try { const r = await fetch("/api/roadmap/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ summary: summary() }) }); const j = await r.json(); if (j.usage) { setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); } if (!r.ok) throw new Error(j.error || "error"); setAi(j.text); } catch (e) { setErr(e instanceof Error ? e.message : "error"); } setBusy(false); };
  const csv = () => { const esc = (s: string) => '"' + String(s ?? "").replace(/"/g, '""') + '"'; const rows = [["Grade", "Score", "Customer", "Industry", "Tier", "Volume", "Fit", "Access", "Speed", "Est tons/yr", "First-touch month", "Why"], ...all.map((r) => [r.s.grade, String(r.s.total), r.lead.name, r.lead.industry, r.lead.tier, String(r.s.vol), String(r.s.fit), String(r.s.access), String(r.s.speed), String(r.s.tons), r.month >= 0 ? rm.months[r.month].label : "watch", r.s.why.join("; ")])]; const blob = new Blob(["﻿" + rows.map((x) => x.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "roadmap_priorities_" + todayIso() + ".csv"; a.click(); };
  const tab = (on: boolean) => "px-4 py-2 rounded-lg text-sm border " + (on ? "bg-brand-500 text-white border-brand-500" : "bg-white");
  return (
    <div className="space-y-4">
      <H1 sub={tr("ציון 0–100 לכל לקוח = נפח + התאמת Silitex + גישה/חום + מהירות. A מתחילים עכשיו, B אחריהם, C לטפח, D מעקב. מתעדכן לבד עם כל ליד, סריקה וצעד.")}>🧭 {tr("מפת דרכים — 6 חודשים")}</H1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{(["A", "B", "C", "D"] as Grade[]).map((x) => (
        <button key={x} onClick={() => { setG(g === x ? "" : x); setView("list"); }} className={"text-start rounded-xl border p-3 bg-white " + (g === x ? "ring-2 ring-brand-500" : "")}><div className="flex items-center gap-2"><Badge tone={TONE[x]}>{x}</Badge><span className="text-2xl font-bold" dir="ltr">{count(x)}</span></div><div className="text-xs text-slate-500 mt-1">{tr(GRADE_HE[x])}</div><div className="text-xs text-slate-400" dir="ltr">~{tons(x).toFixed(1)} t/yr</div></button>))}</div>
      <Card className="flex flex-wrap items-center gap-2">
        <button className={tab(view === "plan")} onClick={() => setView("plan")}>📅 {tr("תוכנית חודשית")}</button><button className={tab(view === "list")} onClick={() => setView("list")}>📋 {tr("דירוג לקוחות")}</button>
        <label className="text-xs text-slate-500 flex items-center gap-1">{tr("לקוחות חדשים בחודש")}<select className={inputCls + " w-20"} value={cap} onChange={(e) => setCap(Number(e.target.value))}>{[6, 8, 10, 12, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <button className={btnGhost} onClick={csv}>⬇️ Excel (CSV)</button>
        <button className={btnPrimary} disabled={busy} onClick={runAi}>{busy ? tr("מנתח...") : "🤖 " + tr("אסטרטגיית AI ל-6 חודשים")}</button>
      </Card>
      {view === "plan" ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">{rm.months.map((m) => (
          <Card key={m.idx} className="space-y-2">
            <div className="flex items-center justify-between"><div className="font-bold">{tr("חודש")} {m.idx + 1} · {m.label}</div>{m.tons > 0 && <Badge tone="green">{tr("PO צפוי")} ~{m.tons.toFixed(1)} t</Badge>}</div>
            <ul className="text-xs space-y-0.5 text-slate-700">{m.milestones.map((x) => <li key={x}>🏁 {tr(x)}</li>)}</ul>
            <div className="text-xs text-slate-500">{tr("לקוחות חדשים")} ({m.leads.length})</div>
            <ul className="text-sm divide-y">{m.leads.map((r) => <li key={r.lead.id} className="flex items-center gap-2 py-1"><Badge tone={TONE[r.s.grade]}>{r.s.grade}</Badge><Link href={"/leads/" + r.lead.id} className="flex-1 truncate hover:underline">{r.lead.name}</Link><span className="text-xs text-slate-400" dir="ltr">{r.s.total}</span></li>)}</ul>
          </Card>))}
          <Card className="space-y-1"><div className="font-bold">👁️ {tr("מעקב בלבד (D)")} · {rm.watch.length}</div><div className="text-xs text-slate-500">{rm.watch.slice(0, 40).map((r) => r.lead.name).join(" · ")}</div></Card>
        </div>
      ) : (
        <Card className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-slate-500 border-b"><th className="text-start p-1">#</th><th className="text-start p-1">{tr("ציון")}</th><th className="text-start p-1">{tr("לקוח")}</th><th className="text-start p-1">{tr("תעשייה")}</th><th className="text-start p-1" dir="ltr">Vol · Fit · Acc · Spd</th><th className="text-start p-1">{tr("למה")}</th></tr></thead>
          <tbody>{all.filter((r) => !g || r.s.grade === g).map((r, i) => <tr key={r.lead.id} className="border-b align-top"><td className="p-1 text-slate-400">{i + 1}</td><td className="p-1"><Badge tone={TONE[r.s.grade]}>{r.s.grade} {r.s.total}</Badge></td><td className="p-1"><Link href={"/leads/" + r.lead.id} className="hover:underline font-medium">{r.lead.name}</Link></td><td className="p-1 text-xs">{r.lead.industry}</td><td className="p-1 text-xs font-mono" dir="ltr">{r.s.vol} · {r.s.fit} · {r.s.access} · {r.s.speed}</td><td className="p-1 text-xs text-slate-600">{r.s.why.join(" · ")}</td></tr>)}</tbody></table></Card>
      )}
      {err && <div className="text-sm text-red-600">{err}</div>}
      {ai && <Card><div className="font-bold mb-2">🤖 {tr("אסטרטגיית AI ל-6 חודשים")}</div><div className="whitespace-pre-wrap text-sm leading-relaxed">{ai}</div></Card>}
      <ExportBar title={tr("מפת דרכים — 6 חודשים") + " · " + fmtDate(todayIso())} text={ai ? ai + "\n\n— — —\n\n" + text : text} filename={"roadmap_" + todayIso() + ".txt"} />
      <TokenMeter usage={usage} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} busy={busy} />
    </div>
  );
}
