"use client";
// page.tsx (src/app/studio/page.tsx) · updated 18.10.2026 17:45 (Asia/Jerusalem) — language fix (no English override; Italian works) + scroll to the new posts · 17:20 — POST STUDIO (owner): pick a topic (industry / competitor code / product / D4-D5-D6 regulation / free) + brand mode (Sapirim only — safe before the contract / Silitex products) + languages → AI writes LinkedIn + Facebook post + 30 s reel script per language from partner-safe Silitex data only. Token meter + export bar + history.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, H1, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import StudioResult from "@/components/studio/StudioResult";
import { studioSources, STUDIO_INDUSTRIES, type StudioKind } from "@/lib/studio/context";
import { studioPrompt, STUDIO_LANGS, type StudioBrand } from "@/prompts/studio";
import { loadPacks, savePack, removePack, type StudioPack, type StudioItem } from "@/lib/studio/history";
import { parseJson } from "@/prompts/field";
import { fmtDateTime } from "@/lib/format";
import type { Usage } from "@/lib/types";
import { useLang } from "@/i18n";
const KINDS: [StudioKind, string][] = [["industry", "תעשייה / בעיה"], ["code", "קוד מתחרה → חלופה"], ["product", "מוצר / משפחת מוצרים"], ["regulation", "רגולציה D4 / D5 / D6"], ["free", "נושא חופשי"]];
export default function StudioPage() {
  const { t: tr } = useLang();
  const { state, ready, addSpend } = useStore();
  const [kind, setKind] = useState<StudioKind>("industry"); const [value, setValue] = useState(STUDIO_INDUSTRIES[0]?.key || "");
  const [brand, setBrand] = useState<StudioBrand>("sapirim"); const [langs, setLangs] = useState<string[]>(["he", "ru"]); const [angle, setAngle] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [usage, setUsage] = useState<Usage | null>(null);
  const [packs, setPacks] = useState<StudioPack[]>([]); const [cur, setCur] = useState<StudioPack | null>(null);
  useEffect(() => { const p = loadPacks(); setPacks(p); if (p[0]) setCur(p[0]); }, []);
  if (!ready) return null;
  const pickKind = (k: StudioKind) => { setKind(k); setValue(k === "industry" ? STUDIO_INDUSTRIES[0]?.key || "" : ""); };
  const toggle = (l: string) => setLangs((x) => (x.includes(l) ? x.filter((y) => y !== l) : [...x, l]));
  const run = async () => {
    setErr(""); setBusy(true);
    try {
      const src = studioSources(kind, value);
      if (!src.count && kind !== "free") throw new Error(tr("אין נתונים במקורות לנושא הזה — נסה ניסוח אחר."));
      const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context: src.context || "(no sources)", prompt: studioPrompt({ brand, langs, topic: src.topic, angle }), maxTokens: 1400 * langs.length + 600, lang: "any" }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "AI error");
      setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd);
      const out = parseJson<{ items: StudioItem[] }>(j.text);
      if (!out?.items?.length) throw new Error(j.usage?.mock ? "Demo mode — no ANTHROPIC_API_KEY" : tr("ה-AI לא החזיר מבנה תקין — נסה שוב."));
      const items = out.items.map((x) => ({ ...x, hashtags: x.hashtags || [], reel: { hook: x.reel?.hook || "", scenes: x.reel?.scenes || [], caption: x.reel?.caption || "" } }));
      const label = kind === "industry" ? tr(STUDIO_INDUSTRIES.find((i) => i.key === value)?.he || value) : kind === "regulation" ? "D4 / D5 / D6" : value;
      const pack: StudioPack = { id: "P" + Date.now(), at: new Date().toISOString(), topic: label + " · " + (brand === "sapirim" ? "Sapirim" : "Silitex"), brand, items };
      setPacks(savePack(pack)); setCur(pack); setTimeout(() => document.getElementById("studio-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
    setBusy(false);
  };
  const chip = (on: boolean) => "px-3 py-1.5 rounded-full border text-sm " + (on ? "bg-brand-500 text-white border-brand-500" : "bg-white");
  return (
    <div className="space-y-4">
      <H1 sub={tr("נושא + שפות → פוסט לינקדאין, פוסט פייסבוק ותסריט ריל 30 שניות — רק מנתוני Silitex, בלי שמות לקוחות.")}>✍️ {tr("סטודיו פוסטים")} <Link href="/campaign" className="text-sm font-normal text-brand-600 underline">↗ {tr("קמפיין — פניות ישירות ללקוחות")}</Link></H1>
      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2">{KINDS.map(([k, he]) => <button key={k} className={chip(kind === k)} onClick={() => pickKind(k)}>{tr(he)}</button>)}</div>
        {kind === "industry" && <select className={inputCls} value={value} onChange={(e) => setValue(e.target.value)}>{STUDIO_INDUSTRIES.map((i) => <option key={i.key} value={i.key}>{tr(i.he)}</option>)}</select>}
        {(kind === "code" || kind === "product" || kind === "free") && <input className={inputCls} dir="auto" value={value} onChange={(e) => setValue(e.target.value)} placeholder={kind === "code" ? "DOWSIL 1520 / Wacker SILFOAM SE 47…" : kind === "product" ? "ANTISCHIUMA 3 / amino softener…" : tr("למשל: קצף בקו מילוי, דחיית מים לאבן")} />}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-slate-500">{tr("מצב מותג")}</div>
            <div className="flex flex-wrap gap-2"><button className={chip(brand === "sapirim")} onClick={() => setBrand("sapirim")}>🛡️ {tr("Sapirim בלבד (בטוח לפני חוזה)")}</button><button className={chip(brand === "silitex")} onClick={() => setBrand("silitex")}>🧪 {tr("מוצרי Silitex (אחרי חוזה)")}</button></div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-500">{tr("שפות")}</div>
            <div className="flex flex-wrap gap-2">{STUDIO_LANGS.map(([l, n]) => <button key={l} className={chip(langs.includes(l))} onClick={() => toggle(l)}>{n}</button>)}</div>
          </div>
        </div>
        <input className={inputCls} dir="auto" value={angle} onChange={(e) => setAngle(e.target.value)} placeholder={tr("זווית (לא חובה) — למשל: חיסכון בזמן השבתה, ציות לרגולציה")} />
        <div className="flex flex-wrap items-center gap-3"><button className={btnPrimary + (cur || busy ? "" : " ai-pulse")} disabled={busy || !langs.length || (!value && kind !== "regulation")} onClick={run}>{busy ? tr("כותב…") : "✨ " + tr("צור פוסטים")}</button>{err && <span className="text-sm text-red-600">{err}</span>}</div>
        <TokenMeter usage={usage} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} busy={busy} />
        {brand === "silitex" && <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-2">⚠️ {tr("לפרסם תוכן עם מוצרי Silitex רק אחרי חתימת החוזה ואישור פדריקה לשימוש בשם ובלוגו.")}</div>}
      </Card>
      {cur && <div id="studio-result"><StudioResult key={cur.id} pack={cur} /></div>}
      {packs.length > 0 && (
        <Card>
          <div className="font-bold mb-2">🗂️ {tr("היסטוריה")} ({packs.length})</div>
          <ul className="divide-y text-sm">{packs.map((p) => <li key={p.id} className="py-1.5 flex items-center gap-2"><button className="flex-1 text-start hover:underline" dir="auto" onClick={() => setCur(p)}>{p.topic} <span className="text-xs text-slate-400">· {p.items.map((i) => i.lang.toUpperCase()).join("/")} · {fmtDateTime(p.at)}</span></button><button className={btnGhost + " text-xs"} onClick={() => { const n = removePack(p.id); setPacks(n); if (cur?.id === p.id) setCur(n[0] || null); }}>✕</button></li>)}</ul>
        </Card>
      )}
    </div>
  );
}
