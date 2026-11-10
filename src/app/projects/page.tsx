"use client";
// page.tsx (src/app/projects/page.tsx) · created 10.11.2026 12:50 (Asia/Jerusalem) — v1.9.8 📁 Projects tab
// Every RFQ = one #SPR number (customer, Silitex and Sapirim see the same one). Opens itself from the customer's message; filter, search, → project card A–Z.
import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, H1, Badge } from "@/components/ui";
import { useProjects } from "@/lib/use-projects";
import { useStore } from "@/lib/store";
import { refLabel, stageText } from "@/lib/projects";
import { PROJECT_FILTERS } from "@/config/projects";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Project } from "@/lib/types";

const tone = (s: string) => (s === "silitex" ? "amber" : s === "closed" ? "green" : s === "lost" ? "slate" : s === "rfq" ? "red" : "blue");
const docs = (p: Project) => [p.po_sample && "PO דוגמה " + p.po_sample, p.po_product && "PO " + p.po_product].filter(Boolean).join(" · ") || "—";

export default function ProjectsPage() {
  const { t: tr } = useLang(); const { state } = useStore();
  const { list, opened, err } = useProjects(); const [f, setF] = useState("open"); const [q, setQ] = useState("");
  const nextTask = (p: Project) => state.tasks.filter((t) => t.lead_id === p.lead_id && !t.done).sort((a, b) => String(a.due).localeCompare(String(b.due)))[0];
  const rows = useMemo(() => {
    const fl = PROJECT_FILTERS.find((x) => x.id === f); const s = q.trim().toLowerCase();
    return (list || []).filter((p) => (!fl || fl.stages.includes(p.stage)) && (!s || [p.id, p.lead_name, p.description, p.request, p.po_sample, p.po_product, p.invoice, p.quote_ref].join(" ").toLowerCase().includes(s)));
  }, [list, f, q]);
  const count = (id: string) => (list || []).filter((p) => PROJECT_FILTERS.find((x) => x.id === id)?.stages.includes(p.stage)).length;
  return (
    <div className="space-y-4">
      <H1 sub={tr("מספר אחד לכל RFQ — הלקוח, סיליטקס וספירים רואים אותו מספר, מהפנייה ועד החשבונית.")}>📁 {tr("פרויקטים")}</H1>
      <Card className="bg-sky-50 border-sky-200 text-sm space-y-1">
        <div><b>⚡ {tr("פתיחה אוטומטית")}:</b> {tr("הודעה מלקוח שמבקשת נתונים טכניים / דוגמה / מחיר → מספר פרויקט חדש, צוות Silitex מצורף, משימת 🔔 מעקב, וכל ההתכתבות של הלקוח מסומנת במספר.")}</div>
        <div className="text-slate-600">{tr("נושא כל מייל מתחיל ב-")} <span dir="ltr" className="font-mono">[#SPR-0002 · v1]</span> · {tr("מייל נכנס עם המספר נקלט לפרויקט לבד.")}</div>
        {opened.length > 0 && <div className="text-emerald-700">✓ {tr("נפתחו עכשיו")}: {opened.map((x) => "#" + x).join(", ")}</div>}
      </Card>
      <div className="flex flex-wrap items-center gap-2">
        {PROJECT_FILTERS.map((x) => <button key={x.id} type="button" onClick={() => setF(x.id)} className={"text-sm px-3 py-1.5 rounded-full border min-h-[40px] " + (f === x.id ? "bg-ink-900 text-white border-ink-900" : "bg-white")}>{tr(x.he)} ({count(x.id)})</button>)}
        <button type="button" onClick={() => setF("")} className={"text-sm px-3 py-1.5 rounded-full border min-h-[40px] " + (f === "" ? "bg-ink-900 text-white border-ink-900" : "bg-white")}>{tr("הכל")} ({(list || []).length})</button>
        <input className="ms-auto border rounded-lg px-3 py-2 text-sm w-72 bg-white" placeholder={tr("חיפוש: #SPR / לקוח / מוצר / PO")} value={q} onChange={(e) => setQ(e.target.value)} aria-label={tr("חיפוש")} />
      </div>
      {err && <div className="text-sm text-red-600">{err}</div>}
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm min-w-[980px]">
          <thead className="bg-slate-50 text-slate-600"><tr className="text-start">
            {["מס׳ פרויקט", "לקוח", "תיאור קצר", "שלב", "PO", "חשבונית", "צוות", "🔔"].map((h) => <th key={h} className="p-3 text-start font-semibold">{tr(h)}</th>)}
          </tr></thead>
          <tbody>
            {list === null && <tr><td colSpan={8} className="p-4 text-slate-500">⏳ {tr("טוען…")}</td></tr>}
            {list !== null && rows.length === 0 && <tr><td colSpan={8} className="p-4 text-slate-400">{tr("אין פרויקטים בסינון הזה.")}</td></tr>}
            {rows.map((p) => { const nt = nextTask(p); return (
              <tr key={p.id} className="border-t align-top">
                <td className="p-3 whitespace-nowrap"><Link href={"/projects/" + p.id} dir="ltr" className="inline-block font-mono text-xs font-bold bg-ink-900 text-white rounded-lg px-2 py-1.5">{refLabel(p)}</Link></td>
                <td className="p-3"><Link href={"/leads/" + p.lead_id} className="underline">{p.lead_name}</Link></td>
                <td className="p-3 max-w-xs" dir="auto">{p.description || <span className="text-slate-400">{(p.request || "—").slice(0, 90)}</span>}</td>
                <td className="p-3 whitespace-nowrap"><Badge tone={tone(p.stage)}>{tr(stageText(p.stage))}</Badge></td>
                <td className="p-3 whitespace-nowrap text-slate-600" dir="auto">{docs(p)}</td>
                <td className="p-3 whitespace-nowrap text-slate-600">{p.invoice ? p.invoice + (p.invoice_at ? " · " + fmtDate(p.invoice_at) : "") : "—"}</td>
                <td className="p-3 whitespace-nowrap text-slate-600">{p.team.map((m) => m.name.split(" ")[0]).join(" · ") || "—"}</td>
                <td className="p-3 whitespace-nowrap text-slate-600">{nt ? fmtDate(nt.due) : "—"}</td>
              </tr>); })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
