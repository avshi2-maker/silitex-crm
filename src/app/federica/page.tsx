"use client";
// page.tsx (src/app/federica/page.tsx) · updated 23.10.2026 05:30 (Asia/Jerusalem) — + 📊 one-picture management chart (copy picture / PNG / caption) · 22.10.2026 08:40 (Asia/Jerusalem) — all UI text through tr() (EN / IT / RU) · created 21.10.2026 17:05 (Asia/Jerusalem) — 📮 FRIDAY REPORT TO FEDERICA (owner): ticker (blockers · oldest waiting · days to Friday) + Silitex open-questions register (add / edit / answer / close, filters) + weekly report builder. The register lives in Supabase, so nothing is lost between weeks and every question shows how long it has waited.
import { useEffect, useState } from "react";
import { Card, H1, Badge, btnPrimary, inputCls } from "@/components/ui";
import FqRow from "@/components/federica/FqRow";
import ReportPanel from "@/components/federica/ReportPanel";
import PotentialChart from "@/components/federica/PotentialChart";
import { CATS, WHO, PRIO, isOpen, daysOpen, nextFriday, fmtD, type Fq } from "@/lib/fq-types";
import { useLang } from "@/i18n";
type Tab = "open" | "ours" | "answered" | "closed" | "all";
const TABS: [Tab, string][] = [["open", "פתוחות — Silitex"], ["ours", "פתוחות — אצלנו"], ["answered", "נענו"], ["closed", "סגורות"], ["all", "הכל"]];
const blank = (): Fq => ({ id: "fq-" + Date.now().toString(36), q: "", cat: CATS[1], who: "Federica", prio: "important", party: "silitex", status: "new", asked: [], answer: "", answered_at: null, leads: [], note: "", created_at: new Date().toISOString(), due: null });
export default function FedericaPage() {
  const { t: tr } = useLang();
  const [items, setItems] = useState<Fq[]>([]); const [err, setErr] = useState(""); const [tab, setTab] = useState<Tab>("open"); const [n, setN] = useState<Fq>(blank()); const [busy, setBusy] = useState(false);
  const load = () => fetch("/api/federica", { cache: "no-store" }).then((r) => r.json()).then((j) => { if (j.items) setItems(j.items); else setErr(j.error || "error"); }).catch(() => setErr("network"));
  useEffect(() => { load(); }, []);
  const save = async (list: Fq[]) => { setItems((cur) => cur.map((x) => list.find((y) => y.id === x.id) || x).concat(list.filter((y) => !cur.some((x) => x.id === y.id)))); const r = await fetch("/api/federica", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: list }) }); if (!r.ok) setErr((await r.json()).error || "save failed"); };
  const add = async () => { if (!n.q.trim()) return; setBusy(true); await save([{ ...n, q: n.q.trim() }]); setN(blank()); setBusy(false); };
  const markSent = async () => { const today = new Date().toISOString().slice(0, 10); const list = items.filter((f) => f.party === "silitex" && isOpen(f)).map((f) => ({ ...f, status: "asked" as const, asked: f.asked.some((a) => a.slice(0, 10) === today) ? f.asked : [...f.asked, new Date().toISOString()] })); if (list.length) await save(list); };
  const openS = items.filter((f) => f.party === "silitex" && isOpen(f)); const blockers = openS.filter((f) => f.prio === "blocker");
  const oldest = openS.reduce((m, f) => Math.max(m, daysOpen(f)), 0); const fri = nextFriday(); const toFri = Math.round((fri.getTime() - Date.now()) / 864e5);
  const shown = items.filter((f) => tab === "all" ? true : tab === "open" ? f.party === "silitex" && isOpen(f) : tab === "ours" ? f.party === "sapirim" && isOpen(f) : f.status === tab)
    .sort((a, b) => PRIO[a.prio].rank - PRIO[b.prio].rank || a.created_at.localeCompare(b.created_at));
  return (
    <div className="space-y-4">
      <H1 sub={tr("כל מה שצריך לברר מול Silitex — במקום אחד, עם מעקב שבועי. כל שישי: דוח אחד מרוכז לפדריקה.")}>📮 {tr("דוח שבועי לפדריקה")}</H1>
      <div className="flex flex-wrap gap-2 text-sm">
        <Badge tone="red">🔴 {blockers.length} {tr("חוסמים")}</Badge><Badge tone="amber">{openS.length} {tr("שאלות פתוחות ל-Silitex")}</Badge><Badge tone="slate">{tr("הוותיקה ביותר:")} {oldest} {tr("ימים")}</Badge>
        <Badge tone={toFri === 0 ? "green" : "blue"}>📅 {toFri === 0 ? tr("היום שישי — זמן לשלוח!") : tr("שישי ") + fmtD(fri.toISOString()) + tr(" · עוד ") + toFri + tr(" ימים")}</Badge>
      </div>
      {err && <Card className="text-sm text-red-700">⚠️ {err === "no-db" ? tr("אין חיבור ל-Supabase") : err} — {tr("הרשימה לא נשמרה. נסו לרענן.")}</Card>}
      <Card className="space-y-2">
        <div className="flex flex-wrap gap-1">{TABS.map(([k, he]) => <button key={k} onClick={() => setTab(k)} className={"text-xs px-3 py-1 rounded-full border " + (tab === k ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{tr(he)} ({items.filter((f) => k === "all" ? true : k === "open" ? f.party === "silitex" && isOpen(f) : k === "ours" ? f.party === "sapirim" && isOpen(f) : f.status === k).length})</button>)}</div>
        <ul className="divide-y">{shown.map((f) => <FqRow key={f.id + f.status + f.answer} f={f} onSave={(x) => save([x])} />)}{!shown.length && <li className="py-4 text-sm text-slate-500">{tr("אין פריטים ✓")}</li>}</ul>
      </Card>
      <Card className="space-y-2">
        <h3 className="font-bold">➕ {tr("שאלה חדשה ל-Silitex")}</h3>
        <textarea className={inputCls} rows={2} dir="ltr" placeholder="Write the question in English, the way Federica will read it" value={n.q} onChange={(e) => setN({ ...n, q: e.target.value })} />
        <div className="grid md:grid-cols-5 gap-2">
          <select className={inputCls} value={n.cat} onChange={(e) => setN({ ...n, cat: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
          <select className={inputCls} value={n.who} onChange={(e) => setN({ ...n, who: e.target.value, party: e.target.value === "Avshi" ? "sapirim" : "silitex" })}>{WHO.map((c) => <option key={c}>{c}</option>)}</select>
          <select className={inputCls} value={n.prio} onChange={(e) => setN({ ...n, prio: e.target.value as Fq["prio"] })}>{Object.entries(PRIO).map(([k, v]) => <option key={k} value={k}>{v.icon} {tr(v.he)}</option>)}</select>
          <input className={inputCls} dir="ltr" placeholder="LEAD-169 (optional)" value={n.leads.join(", ")} onChange={(e) => setN({ ...n, leads: e.target.value.split(/[,\s]+/).filter(Boolean) })} />
          <button className={btnPrimary} disabled={busy || !n.q.trim()} onClick={add}>+ {tr("הוסף")}</button>
        </div>
      </Card>
      <ReportPanel issues={items} onMarkSent={markSent} />
      <PotentialChart />
    </div>
  );
}
