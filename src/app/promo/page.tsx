"use client";
// page.tsx (src/app/promo/page.tsx) · created 21.10.2026 11:15 (Asia/Jerusalem) — 📣 PROMOTION & GOOGLE (owner): #1 is Google indexing sapirim.com (1-click site: checks + Search Console / Bing / PageSpeed), 📣 IndexNow ping (Bing picks up changes in hours), #4 competition + link opportunities, ✅ off-site links checklist (saved in this browser), 🎯 daily lead hunting by industry (LinkedIn roles + leads still without a contact person). Free — no API cost.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, H1, Badge, btnPrimary, btnGhost } from "@/components/ui";
import { useStore } from "@/lib/store";
import { g, INDEX_QUERIES, LINK_QUERIES, LINK_TASKS, rolesFor, type Q } from "@/lib/google-tricks";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
const KEY = "silitex-promo-checklist-v1";
const TOOLS = [
  { label: "Google Search Console", url: "https://search.google.com/search-console?resource_id=sc-domain:sapirim.com" },
  { label: "Bing Webmaster", url: "https://www.bing.com/webmasters" },
  { label: "PageSpeed (מהירות)", url: "https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.sapirim.com%2Fhe" },
  { label: "Rich Results (נתונים מובנים)", url: "https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.sapirim.com%2Fhe" },
  { label: "sitemap.xml", url: "https://www.sapirim.com/sitemap.xml" },
];
function QList({ items }: { items: Q[] }) {
  const { t: tr } = useLang();
  return <ul className="grid md:grid-cols-2 gap-2">{items.map((q) => (
    <li key={q.label}><a href={g(q.q)} target="_blank" rel="noreferrer" className="flex items-start gap-2 rounded-lg border bg-white px-3 py-2 text-sm hover:border-brand-400 overflow-hidden" title={q.q}>
      <span>{q.icon}</span><span className="flex-1 min-w-0"><span className="font-medium">{tr(q.label)}</span>{q.tip && <span className="block text-[11px] text-slate-500">{tr(q.tip)}</span>}<code className="block text-[10px] text-slate-400 truncate" dir="ltr">{q.q}</code></span><span className="text-slate-400">↗</span>
    </a></li>))}</ul>;
}
export default function Promo() {
  const { t: tr } = useLang(); const { state } = useStore();
  const [done, setDone] = useState<Record<string, string>>({}); const [ping, setPing] = useState(""); const [busy, setBusy] = useState(false); const [ind, setInd] = useState("");
  useEffect(() => { try { setDone(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {} }, []);
  const toggle = (id: string) => setDone((d) => { const n = { ...d }; if (n[id]) delete n[id]; else n[id] = new Date().toISOString(); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} return n; });
  const doPing = async () => { setBusy(true); setPing(""); try { const r = await fetch("/api/portal/indexnow", { method: "POST" }); const j = await r.json(); setPing(j.ok ? "✓ " + j.sent + " " + tr("כתובות נשלחו ל-Bing / Yandex") + " (" + j.status + ")" : "⚠️ " + (j.detail || j.error || j.status)); } catch { setPing("⚠️ " + tr("שגיאה")); } setBusy(false); };
  const industries = useMemo(() => Array.from(new Set(state.leads.map((l) => l.industry))).sort(), [state.leads]);
  const cur = ind || industries[0] || "";
  const noContact = state.leads.filter((l) => l.industry === cur && !l.contact_name && !l.status?.startsWith("lost")).sort((a, b) => a.tier.localeCompare(b.tier));
  const huntQ: Q[] = cur ? [
    { icon: "👤", label: "אנשי מפתח בתעשייה (ישראל)", q: "site:linkedin.com/in " + rolesFor(cur) + ' (Israel OR ישראל) "' + cur.split(/[,&]/)[0].trim() + '"' },
    { icon: "🏭", label: "מפעלים בתעשייה שעוד לא ב-CRM", q: '"' + cur.split(/[,&]/)[0].trim() + '" (manufacturer OR מפעל OR יצרן) Israel -jobs' },
    { icon: "📰", label: "חדשות בתעשייה — 3 חודשים", q: '"' + cur.split(/[,&]/)[0].trim() + '" Israel (factory OR expansion OR מפעל OR הרחבה) after:' + new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10) },
  ] : [];
  const doneCount = LINK_TASKS.filter((x) => done[x.id] || x.how.startsWith("✓")).length;
  return (
    <div className="space-y-4">
      <H1 sub={tr("גוגל, קישורים וציד לקוחות — כל הכלים בלחיצה, בחינם")}>📣 {tr("קידום אתר וגוגל")}</H1>
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold flex-1">1️⃣ {tr("האם גוגל מכיר את sapirim.com?")}</h3>{TOOLS.map((x) => <a key={x.label} href={x.url} target="_blank" rel="noreferrer" className={btnGhost + " text-xs"}>{tr(x.label)} ↗</a>)}</div>
        <QList items={INDEX_QUERIES} />
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2">
          <button className={btnPrimary} disabled={busy} onClick={doPing}>{busy ? "⏳" : "📣"} {tr("עדכן את Bing עכשיו (IndexNow)")}</button>
          <span className="text-xs text-slate-600 flex-1">{ping || tr("לחצו אחרי כל שינוי באתר — Bing (וגם ChatGPT / Copilot) קולטים עמודים חדשים תוך שעות במקום שבועות.")}</span>
        </div>
      </Card>
      <Card className="space-y-3">
        <h3 className="font-bold">4️⃣ {tr("מתחרים ומקומות שיכולים לקשר אלינו")}</h3>
        <QList items={LINK_QUERIES} />
      </Card>
      <Card className="space-y-2">
        <div className="flex items-center gap-2"><h3 className="font-bold flex-1">✅ {tr("קישורים חיצוניים — מה שמזיז את גוגל")}</h3><Badge tone={doneCount === LINK_TASKS.length ? "green" : "amber"}>{doneCount}/{LINK_TASKS.length}</Badge></div>
        <ul className="divide-y">{LINK_TASKS.map((x) => { const ok = !!done[x.id] || x.how.startsWith("✓"); return (
          <li key={x.id} className="py-2 flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={ok} disabled={x.how.startsWith("✓")} onChange={() => toggle(x.id)} />
            <div className="flex-1"><div className={"font-medium " + (ok ? "line-through text-slate-400" : "")}>{tr(x.label)}</div><div className="text-xs text-slate-500">{tr(x.how)}{done[x.id] && " · " + fmtDate(done[x.id])}</div></div>
            {x.url && <a href={x.url} target="_blank" rel="noreferrer" className="text-xs text-brand-700 underline">↗</a>}
          </li>); })}</ul>
      </Card>
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold flex-1">🎯 {tr("ציד יומי לפי תעשייה")}</h3>
          <select className="border rounded-lg px-2 py-1.5 text-sm bg-white" value={cur} onChange={(e) => setInd(e.target.value)}>{industries.map((i) => <option key={i} value={i}>{tr(i)}</option>)}</select></div>
        <QList items={huntQ} />
        <div className="text-sm font-medium">{tr("לידים בתעשייה בלי איש קשר")} ({noContact.length}) — {tr("פתחו כרטיס → 🔎 חיפוש חכם → שמור")}</div>
        <div className="flex flex-wrap gap-2">{noContact.slice(0, 40).map((l) => <Link key={l.id} href={"/leads/" + l.id} className="px-2 py-1 rounded-full border bg-white text-xs hover:border-brand-500">{l.name} <span className="text-slate-400">· {l.tier.split(" - ")[0]}</span></Link>)}</div>
      </Card>
    </div>
  );
}
