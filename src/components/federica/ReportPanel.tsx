"use client";
// ReportPanel.tsx (src/components/federica/ReportPanel.tsx) · updated 22.10.2026 08:40 (Asia/Jerusalem) — all UI text through tr() (EN / IT / RU) · created 21.10.2026 17:00 (Asia/Jerusalem) — Friday report builder: week numbers from the CRM (new leads since the last report, scans, contacts, samples, offers, actions) + your highlights / next-week lines + all open Silitex questions by priority → one plain English e-mail (Outlook / Word friendly) with the 5-button export bar. "Mark as sent" stamps every open question as asked today, so the ticker counts how many Fridays each one has waited.
import { useEffect, useMemo, useState } from "react";
import { Card, btnPrimary, btnGhost, inputCls } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import { useStore } from "@/lib/store";
import { scanOf } from "@/lib/scan";
import { buildReport, isOpen, fmtD, type Fq, type Week } from "@/lib/fq-types";
import { useLang } from "@/i18n";
const KEY = "silitex-fq-report-v1";
type Draft = { sinceId: number; highlights: string; next: string; lastSent: string };
const num = (id: string) => Number(id.replace(/\D/g, "")) || 0;
export default function ReportPanel({ issues, onMarkSent }: { issues: Fq[]; onMarkSent: () => Promise<void> }) {
  const { state } = useStore();
  const { t: tr } = useLang();
  const [d, setD] = useState<Draft>({ sinceId: 56, highlights: "", next: "", lastSent: "" }); const [busy, setBusy] = useState(false); const [copied, setCopied] = useState(false);
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s) setD(s); } catch {} }, []);
  const put = (n: Draft) => { setD(n); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} };
  const week: Week = useMemo(() => {
    const ago = new Date(Date.now() - 7 * 864e5).toISOString(); const fresh = state.leads.filter((l) => num(l.id) > d.sinceId);
    const by = new Map<string, number>(); fresh.forEach((l) => by.set(l.industry, (by.get(l.industry) || 0) + 1));
    return { since: ago, leadsNew: Array.from(by, ([industry, n]) => ({ industry, n })).sort((a, b) => b.n - a.n), leadsTotal: state.leads.length,
      scans: state.leads.filter((l) => { const s = scanOf(l); return !!s && s.at >= ago; }).length,
      samples: state.samples.filter((s) => (s.sent_at || "") >= ago.slice(0, 10)).length, docs: state.docs.filter((x) => (x.sent_at || "") >= ago.slice(0, 10)).length,
      contacts: state.activities.filter((a) => a.at >= ago && a.text.includes("איש קשר נמצא בחיפוש")).length, acts: state.activities.filter((a) => a.at >= ago).length, highlights: d.highlights, next: d.next };
  }, [state, d]);
  const text = buildReport(issues, week);
  const openN = issues.filter((f) => f.party === "silitex" && isOpen(f)).length;
  const sent = async () => { setBusy(true); await onMarkSent(); const maxId = Math.max(...state.leads.map((l) => num(l.id))); put({ ...d, sinceId: maxId, highlights: "", next: "", lastSent: new Date().toISOString() }); setBusy(false); };
  const copy = () => navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold flex-1">📮 {tr("הדוח של יום שישי — טיוטה")}</h3>{d.lastSent && <span className="text-xs text-slate-500">{tr("נשלח לאחרונה:")} {fmtD(d.lastSent)}</span>}</div>
      <div className="grid md:grid-cols-[10rem_1fr_1fr] gap-2">
        <label className="text-xs text-slate-500">{tr("לידים חדשים מאז")}<input type="number" className={inputCls + " mt-1"} dir="ltr" value={d.sinceId} onChange={(e) => put({ ...d, sinceId: Number(e.target.value) || 0 })} /><span className="text-[10px]">{tr("LEAD-# (מתעדכן לבד אחרי שליחה)")}</span></label>
        <label className="text-xs text-slate-500">{tr("נקודות בולטות השבוע (באנגלית, שורה = נקודה)")}<textarea className={inputCls + " mt-1"} rows={4} dir="ltr" placeholder={"www.sapirim.com is live and indexed by Google\nFirst call with Taro purchasing"} value={d.highlights} onChange={(e) => put({ ...d, highlights: e.target.value })} /></label>
        <label className="text-xs text-slate-500">{tr("השבוע הבא (באנגלית)")}<textarea className={inputCls + " mt-1"} rows={4} dir="ltr" placeholder={"Lab calls: Epolac, Denber\nSample request: Rose Chemicals"} value={d.next} onChange={(e) => put({ ...d, next: e.target.value })} /></label>
      </div>
      <pre className="whitespace-pre-wrap text-xs leading-relaxed bg-slate-50 border rounded-lg p-3 max-h-[28rem] overflow-auto" dir="ltr">{text}</pre>
      <div className="flex flex-wrap gap-2">
        <button className={btnGhost} onClick={copy}>{copied ? tr("✓ הועתק") : tr("📋 העתק לאאוטלוק")}</button>
        <button className={btnPrimary} disabled={busy} onClick={sent}>{busy ? "⏳" : "✅"} {tr("שלחתי — סמן")} {openN} {tr("שאלות כ\"נשאלו היום\"")}</button>
      </div>
      <ExportBar title={"Sapirim → Silitex · Weekly report · " + fmtD(new Date().toISOString())} text={text} filename={"Friday_Federica_report_" + new Date().toISOString().slice(0, 10) + ".txt"} />
    </Card>
  );
}
