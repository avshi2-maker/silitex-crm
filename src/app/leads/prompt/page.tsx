"use client";
// page.tsx (src/app/leads/prompt/page.tsx) · updated 24.10.2026 05:40 (Asia/Jerusalem) — 🤖 default tool = Claude (web search) inside the CRM: one click → answer in box 3 → import (Comet / NotebookLM stay as options) · 23.10.2026 06:10 — pre-fill from the link (?industry=&sub=&similar=&notes=) · 22.10.2026 18:00 (Asia/Jerusalem) — + 📚 search history per industry (gaps in amber) + ✨ AI sharpen (meter + export bar) + hand-off carries industry / sub / tool for the log · created 17:40 — 🧲 search-prompt builder: industry / sub-industry / "similar to" / free notes → ready prompt for Comet / NotebookLM / Perplexity / Deep Research (excludes companies already in the CRM) → paste the CSV answer back → /leads/import preview (new vs update, Tier 3, source stamped). ?lead=ID pre-fills from a customer card.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useLang } from "@/i18n";
import { Card, H1, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { industryOptions, isUnclassified } from "@/config/industry-list";
import { HUNT_TOOLS, buildHuntPrompt, discoverQuery, extractCsv, PASTE_KEY, type HuntTool, type PastePayload } from "@/lib/hunt-prompt";
import { normName } from "@/lib/lead-import";
import { fmtDate } from "@/lib/format";
import HuntHistory from "@/components/hunt/HuntHistory";
import HuntSharpen, { type HuntFields } from "@/components/hunt/HuntSharpen";
import HuntClaude from "@/components/hunt/HuntClaude";

export default function HuntPromptPage() {
  const { t: tr } = useLang(); const router = useRouter();
  const { state, ready, addSpend } = useStore();
  const [industry, setIndustry] = useState(""); const [sub, setSub] = useState(""); const [similar, setSimilar] = useState("");
  const [notes, setNotes] = useState(""); const [region, setRegion] = useState("Israel"); const [rows, setRows] = useState(30);
  const [tool, setTool] = useState<HuntTool>("claude"); const [useEx, setUseEx] = useState(true);
  const [copied, setCopied] = useState(""); const [answer, setAnswer] = useState(""); const [err, setErr] = useState("");
  useEffect(() => {
    if (!ready) return; const q = new URLSearchParams(window.location.search);
    if (q.get("industry")) setIndustry(q.get("industry") || ""); if (q.get("sub")) setSub(q.get("sub") || ""); if (q.get("similar")) setSimilar(q.get("similar") || ""); if (q.get("notes")) setNotes(q.get("notes") || ""); // pre-filled search link (?industry=&sub=&similar=&notes=)
    const id = q.get("lead"); const l = id ? state.leads.find((x) => x.id === id) : undefined; if (!l) return;
    if (!isUnclassified(l.industry)) setIndustry(l.industry); setSub(l.sub_industry || ""); setSimilar(l.name + (l.website ? " (" + l.website + ")" : ""));
    if (l.use_case) setNotes(l.use_case);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const options = useMemo(() => industryOptions(state.leads.map((l) => l.industry)), [state.leads]);
  const known = useMemo(() => state.leads.filter((l) => industry && l.industry === industry).map((l) => l.name), [state.leads, industry]);
  if (!ready) return null;
  const input = { industry: industry || "(any industry)", sub, similar, notes, region, rows, tool, exclude: useEx ? known : [] };
  const prompt = industry || sub || notes ? buildHuntPrompt(input) : "";
  const t0 = HUNT_TOOLS.find((x) => x.id === tool)!;
  const copy = async (txt: string, what: string) => { try { await navigator.clipboard.writeText(txt); setCopied(what); setTimeout(() => setCopied(""), 2000); } catch { setCopied(""); } };
  const csv = extractCsv(answer); const csvRows = csv ? csv.split("\n").filter((l) => l.trim()).length - 1 : 0;
  const newCount = useEx && csv ? csv.split("\n").slice(1).filter((l) => l.trim() && !state.leads.some((x) => normName(x.name) && normName(l.split(",")[0].replace(/"/g, "")) === normName(x.name))).length : csvRows;
  const toImport = () => {
    if (csvRows < 1) return setErr(tr("לא זוהה CSV — הדבק את כל התשובה (כולל שורת הכותרת)"));
    const payload: PastePayload = { csv, src: t0.label + " — " + (sub || industry) + " " + fmtDate(new Date()), tier: "Tier 3 - New (to qualify)", industry: industry || "", sub, tool: t0.label };
    try { sessionStorage.setItem(PASTE_KEY, JSON.stringify(payload)); } catch {}
    router.push("/leads/import");
  };
  const applyAi = (p: Partial<HuntFields>) => { if (p.industry !== undefined) setIndustry(p.industry); if (p.sub !== undefined) setSub(p.sub); if (p.similar !== undefined) setSimilar(p.similar); if (p.notes !== undefined) setNotes(p.notes); };
  const step = "flex items-center justify-center w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold shrink-0";
  return (
    <div className="space-y-4">
      <Link href="/leads" className="text-sm text-brand-600 underline">← {tr("לקוחות פוטנציאליים")}</Link>
      <H1 sub={tr("ענף / תת-ענף / חברה דומה / מה שקראת → פרומפט מוכן ל-Comet או NotebookLM → מדביקים את ה-CSV חזרה → ייבוא ל-CRM")}>🧲 {tr("בונה פרומפט חיפוש לקוחות")}</H1>
      <Card><HuntHistory leads={state.leads} activities={state.activities} current={industry} onPick={(i) => { setIndustry(i); window.scrollTo({ top: 0, behavior: "smooth" }); }} /></Card>
      <Card className="space-y-3">
        <div className="flex items-center gap-2 font-bold"><span className={step}>1</span>{tr("מה מחפשים")}</div>
        <div className="grid md:grid-cols-3 gap-2">
          <label className="text-xs text-slate-500">{tr("תעשייה")} 🔽<input list="hunt-ind" className={inputCls + " mt-1"} value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder={tr("בחר מהרשימה")} /><datalist id="hunt-ind">{options.map((o) => <option key={o} value={o} />)}</datalist></label>
          <label className="text-xs text-slate-500">{tr("תת-ענף / תיאור")}<input className={inputCls + " mt-1"} value={sub} onChange={(e) => setSub(e.target.value)} placeholder="Masterbatch, additives & compounds for plastics" /></label>
          <label className="text-xs text-slate-500">{tr("חברות דומות ל-")}<input className={inputCls + " mt-1"} value={similar} onChange={(e) => setSimilar(e.target.value)} placeholder="Tosaf" /></label>
        </div>
        <label className="text-xs text-slate-500 block">{tr("מה בראש שלי / מה קראתי ברשת (חופשי — אפשר להדביק טקסט)")}<textarea rows={3} className={inputCls + " mt-1"} value={notes} onChange={(e) => setNotes(e.target.value)} dir="auto" /></label>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-slate-500">{tr("אזור")}<input className={inputCls + " mt-1 w-40"} value={region} onChange={(e) => setRegion(e.target.value)} /></label>
          <label className="text-xs text-slate-500">{tr("כמה שורות")}<select className={inputCls + " mt-1 w-24"} value={rows} onChange={(e) => setRows(Number(e.target.value))}>{[15, 20, 30, 40, 60].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
          <div className="text-xs text-slate-500">{tr("כלי")}<div className="flex flex-wrap gap-1 mt-1">{HUNT_TOOLS.map((x) => <button key={x.id} className={x.id === tool ? btnPrimary : btnGhost} onClick={() => setTool(x.id)}>{x.label}</button>)}</div></div>
          <label className="text-xs text-slate-600 flex items-center gap-1"><input type="checkbox" checked={useEx} onChange={(e) => setUseEx(e.target.checked)} />{tr("לא להחזיר חברות שכבר ב-CRM")} <Badge>{known.length}</Badge></label>
        </div>
        <div className="border-t pt-2"><HuntSharpen f={{ industry, sub, similar, notes }} onApply={applyAi} spend={state.spend} addSpend={addSpend} /></div>
      </Card>
      <Card className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 font-bold"><span className={step}>2</span>{tool === "claude" ? tr("החיפוש — Claude מחפש ברשת בתוך ה-CRM") : <>{tr("הפרומפט — העתק והדבק ב-")}{t0.label}</>}
          <span className="ms-auto flex flex-wrap gap-1 font-normal">
            {tool === "notebooklm" && prompt && <button className={btnGhost} onClick={() => copy(discoverQuery(input), "q")}>{copied === "q" ? "✓ " : "🔎 "}{tr("העתק חיפוש מקורות")}</button>}
            <button className={tool === "claude" ? btnGhost : btnPrimary} disabled={!prompt} onClick={() => copy(prompt, "p")}>{copied === "p" ? "✓ " + tr("הועתק") : "📋 " + tr("העתק פרומפט")}</button>
            {t0.url && <a className={btnGhost} href={t0.url} target="_blank" rel="noreferrer">↗ {tr("פתח")} {t0.label}</a>}
          </span></div>
        {tool === "claude" && <HuntClaude prompt={prompt} title={"Claude search — " + (sub || industry)} onAnswer={(t) => { setAnswer(t); setErr(""); }} spend={state.spend} addSpend={addSpend} />}
        {prompt ? <textarea readOnly rows={tool === "claude" ? 6 : 14} dir="ltr" className={inputCls + " font-mono text-[12px]"} value={prompt} /> : <div className="text-sm text-slate-500">{tr("בחר תעשייה או כתוב תת-ענף — הפרומפט ייבנה כאן")}</div>}
      </Card>
      <Card className="space-y-2">
        <div className="flex items-center gap-2 font-bold"><span className={step}>3</span>{tr("הדבק כאן את התשובה (כל הטקסט — ה-CSV יזוהה לבד)")}</div>
        <textarea rows={6} dir="ltr" className={inputCls + " font-mono text-[12px]"} value={answer} onChange={(e) => { setAnswer(e.target.value); setErr(""); }} placeholder="Company,Website,City,Industry,…" />
        <div className="flex flex-wrap items-center gap-2">
          {csvRows > 0 && <><Badge tone="green">{csvRows} {tr("שורות")}</Badge><Badge tone="amber">~{newCount} {tr("חדשות")}</Badge></>}
          {err && <span className="text-sm text-red-600">{err}</span>}
          <button className={btnPrimary + " ms-auto"} disabled={csvRows < 1} onClick={toImport}>📥 {tr("לתצוגה מקדימה וייבוא")}</button>
        </div>
        <p className="text-[11px] text-slate-500">{tr("בייבוא: חברה שכבר קיימת מתעדכנת (לא משוכפלת), חדשות נכנסות כ-Tier 3 עם מקור החיפוש והתאריך. אחר כך — סריקת אתרים משלימה התאמת מוצרי Silitex.")}</p>
      </Card>
    </div>
  );
}
