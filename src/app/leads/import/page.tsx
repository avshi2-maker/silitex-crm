"use client";
// page.tsx (src/app/leads/import/page.tsx) · updated 22.10.2026 18:00 (Asia/Jerusalem) — 🔎 after import: companies with a website (new / never scanned) go straight to the server scan queue (est. cost shown) · search rounds from 🧲 logged for the search history · 17:40 — + paste CSV (answer from Comet / NotebookLM) + hand-off from 🧲 /leads/prompt (source + Tier 3 carried over) · 17.10.2026 07:55 (Asia/Jerusalem) — import leads from Excel / CSV / SAP export: auto column mapping (HE/EN/SAP headers), preview, new vs update (same company name), skip; template + export-all in the SAME format
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, H1, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { FIELDS, autoMap, buildRows, toLead, leadsToSheet, type FieldKey, type ImportRow } from "@/lib/lead-import";
import { LEAD_SOURCES } from "@/config/sales";
import { todayIso } from "@/lib/format";
import { useLang } from "@/i18n";
import { PASTE_KEY, extractCsv, HUNT_LEAD, huntLogText, type PastePayload } from "@/lib/hunt-prompt";
import { useScanJobs } from "@/lib/use-scan-jobs";
import { scanOf } from "@/lib/scan";
type Sheet = { name: string; headers: string[]; data: unknown[][] };
async function xlsx() { return await import("xlsx"); }
async function download(rows: (string | number)[][], file: string) {
  const X = await xlsx(); const ws = X.utils.aoa_to_sheet(rows); ws["!cols"] = rows[0].map(() => ({ wch: 22 }));
  const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, "Leads"); X.writeFile(wb, file);
}
export default function ImportLeadsPage() {
  const { t: tr } = useLang();
  const { state, ready, importLeads, upsertLead, addActivity } = useStore();
  const jobs = useScanJobs(state.leads, upsertLead, ready);
  const [hunt, setHunt] = useState<PastePayload | null>(null); const [autoScan, setAutoScan] = useState(true); const [busy, setBusy] = useState(false);
  const [sheets, setSheets] = useState<Sheet[]>([]); const [si, setSi] = useState(0);
  const [map, setMap] = useState<Record<number, FieldKey | "">>({});
  const [src, setSrc] = useState("SAP — לקוחות Dow Corning"); const [err, setErr] = useState(""); const [done, setDone] = useState("");
  const [skip, setSkip] = useState<Record<number, boolean>>({});
  const [tier, setTier] = useState("Tier 2 - Old account"); const [paste, setPaste] = useState("");
  useEffect(() => { if (!ready) return; try { const raw = sessionStorage.getItem(PASTE_KEY); if (!raw) return; sessionStorage.removeItem(PASTE_KEY); const p = JSON.parse(raw) as PastePayload; setSrc(p.src); setTier(p.tier); setHunt(p); loadText(p.csv); } catch {} }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return null;
  const sheet = sheets[si];
  const load = async (f?: File | null) => {
    if (!f) return; setErr(""); setDone(""); setSkip({});
    try {
      const X = await xlsx(); parse(X, X.read(await f.arrayBuffer(), { type: "array", cellDates: false }));
    } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
  };
  const loadText = async (text: string) => {
    const csv = extractCsv(text); if (!csv) return; setErr(""); setDone(""); setSkip({});
    try { const X = await xlsx(); parse(X, X.read(csv, { type: "string", raw: true })); } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
  };
  const parse = (X: typeof import("xlsx"), wb: import("xlsx").WorkBook) => {
    {
      const out: Sheet[] = wb.SheetNames.map((n) => { const aoa = X.utils.sheet_to_json<unknown[]>(wb.Sheets[n], { header: 1, defval: "", blankrows: false }); const hi = aoa.findIndex((r) => r.filter((c) => String(c).trim()).length >= 2); const headers = (aoa[hi] || []).map((c) => String(c)); return { name: n, headers, data: aoa.slice(hi + 1) }; }).filter((s) => s.headers.length);
      if (!out.length) throw new Error(tr("לא נמצאו נתונים בקובץ"));
      setSheets(out); setSi(0); setMap(autoMap(out[0].headers));
    }
  };
  const rows: ImportRow[] = sheet ? buildRows(sheet.data, map, state.leads) : [];
  const active = rows.map((r, i) => ({ r, i })).filter(({ r, i }) => r.action !== "skip" && !skip[i]);
  const nNew = active.filter(({ r }) => r.action === "new").length, nUpd = active.filter(({ r }) => r.action === "update").length;
  const hasName = Object.values(map).includes("name");
  const scanable = active.filter(({ r }) => r.row.website && (r.action === "new" || !scanOf(state.leads.find((l) => l.id === r.existingId) || ({} as never)))).length;
  const run = async () => {
    setBusy(true);
    const leads = active.map(({ r }) => toLead(r, state.leads, src, tier));
    importLeads(leads);
    let sent = 0;
    if (autoScan) { const toScan = leads.filter((l) => l.website && !scanOf(l)); if (toScan.length) { try { sent = await jobs.enqueue(toScan); } catch { sent = 0; } } }
    if (hunt) addActivity(HUNT_LEAD(hunt.industry || "—"), "import", huntLogText(hunt.tool || "search", [hunt.industry, hunt.sub].filter(Boolean).join(" → ") || "—", nNew, nUpd, sent));
    setDone(tr("יובאו ") + nNew + tr(" חדשים · עודכנו ") + nUpd + (sent ? " · 🔎 " + sent + tr(" נשלחו לסריקת שרת") : "")); setSheets([]); setHunt(null); setBusy(false);
  };
  return (
    <div className="space-y-4">
      <Link href="/leads" className="text-sm text-brand-600 underline">← {tr("לקוחות פוטנציאליים")}</Link>
      <H1 sub={tr("Excel / CSV / ייצוא SAP → לקוחות. עמודות מזוהות אוטומטית; חברה שכבר קיימת מתעדכנת, לא משוכפלת.")}>📥 {tr("ייבוא לקוחות")}</H1>
      <Card className="flex flex-wrap items-center gap-2">
        <button className={btnGhost} onClick={() => download(leadsToSheet([]).concat([["דוגמה בע\"מ", "ישראל ישראלי", "מנהל רכש", "050-0000000", "buyer@example.co.il", "נייר", "Paper mill", "Antifoam (silicone emulsion)", "Dow / XIAMETER", "בקרת קצף במכונת נייר", 12, 60000, "חדרה", "100234", "15/03/2019", "", "", "SAP"]]), "silitex_leads_template.xlsx")}>⬇️ {tr("תבנית Excel ריקה")}</button>
        <button className={btnGhost} onClick={() => download(leadsToSheet(state.leads), "silitex_leads_" + todayIso() + ".xlsx")}>⬇️ {tr("ייצוא כל הלקוחות")} ({state.leads.length})</button>
        <span className="text-xs text-slate-500">{tr("אותו פורמט לייבוא ולייצוא — אפשר לייצא, להשלים ב-Excel ולייבא חזרה.")}</span>
      </Card>
      <Card className="space-y-3">
        <div className="grid md:grid-cols-3 gap-2 items-end">
          <label className="text-xs text-slate-500 md:col-span-2">{tr("קובץ Excel / CSV")}<input type="file" accept=".xlsx,.xls,.csv" className={inputCls + " mt-1"} onChange={(e) => load(e.target.files?.[0])} /></label>
          <label className="text-xs text-slate-500">{tr("מקור (לכל השורות)")}<input list="srcs" className={inputCls + " mt-1"} value={src} onChange={(e) => setSrc(e.target.value)} /><datalist id="srcs">{["SAP — לקוחות Dow Corning", "NuSil spot", "Univar spot", ...LEAD_SOURCES].map((s) => <option key={s} value={s} />)}</datalist></label>
        </div>
        <div className="flex flex-wrap items-end gap-2"><label className="text-xs text-slate-500 flex-1 min-w-[16rem]">{tr("או הדבק CSV (תשובה מ-Comet / NotebookLM)")} · <Link className="underline text-brand-600" href="/leads/prompt">🧲 {tr("בונה פרומפט חיפוש לקוחות")}</Link><textarea rows={2} dir="ltr" className={inputCls + " mt-1 font-mono text-[12px]"} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Company,Website,City,…" /></label><button className={btnGhost} disabled={!paste.trim()} onClick={() => { setTier("Tier 3 - New (to qualify)"); loadText(paste); }}>📋 {tr("טען CSV מודבק")}</button></div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        {done && <div className="text-sm text-green-700 font-bold">✓ {done} · <Link className="underline" href="/scan">🔎 {tr("סריקת אתרי לקוחות")}</Link> · <Link className="underline" href="/leads">{tr("לרשימת הלקוחות")}</Link> · <Link className="underline" href="/today">{tr("להיום שלי")}</Link></div>}
      </Card>
      {sheet && (
        <>
          <Card className="space-y-2">
            <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{tr("התאמת עמודות")}</h3>{sheets.length > 1 && <select className={inputCls + " w-56"} value={si} onChange={(e) => { const i = Number(e.target.value); setSi(i); setMap(autoMap(sheets[i].headers)); }}>{sheets.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}</select>}<span className="text-xs text-slate-500">{tr("עמודה שלא צריך — השאר ריק")}</span></div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-2">{sheet.headers.map((h, i) => (
              <label key={i} className="text-xs text-slate-500 border rounded-lg p-2" dir="auto"><div className="font-medium text-slate-700 truncate" title={h}>{h || "—"}</div>
                <select className={inputCls + " mt-1"} value={map[i] || ""} onChange={(e) => setMap({ ...map, [i]: e.target.value as FieldKey | "" })}><option value="">{tr("— לא לייבא —")}</option>{FIELDS.map((f) => <option key={f.key} value={f.key}>{tr(f.he)}</option>)}</select></label>
            ))}</div>
            {!hasName && <div className="text-sm text-red-600">{tr("חובה לבחור עמודת חברה")}</div>}
          </Card>
          <Card className="space-y-2">
            <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{tr("תצוגה מקדימה")}</h3><Badge tone="green">{nNew} {tr("חדשים")}</Badge><Badge tone="amber">{nUpd} {tr("עדכון קיים")}</Badge><Badge>{rows.length - active.length} {tr("דילוג")}</Badge>
              <label className="ms-auto text-xs text-slate-600 flex items-center gap-1" title={tr("החברות עם אתר נסרקות בשרת: תעשייה, תת-ענף והתאמת מוצרי Silitex — אפשר לסגור את הדפדפן")}><input type="checkbox" checked={autoScan} onChange={(e) => setAutoScan(e.target.checked)} />🔎 {tr("לשלוח לסריקת שרת")} ({scanable}{jobs.st?.avgCost ? " · ≈ $" + (scanable * jobs.st.avgCost).toFixed(2) : ""})</label>
              <button className={btnPrimary} disabled={!hasName || !active.length || busy} onClick={run}>📥 {tr("ייבא")} {active.length}</button></div>
            <div className="overflow-x-auto max-h-[28rem] overflow-y-auto"><table className="w-full text-xs"><thead className="bg-slate-50 sticky top-0"><tr><th className="p-1"></th><th className="p-1 text-start">{tr("פעולה")}</th>{FIELDS.filter((f) => Object.values(map).includes(f.key)).map((f) => <th key={f.key} className="p-1 text-start whitespace-nowrap">{tr(f.he)}</th>)}</tr></thead>
              <tbody>{rows.slice(0, 300).map((r, i) => (
                <tr key={i} className={"border-t " + (r.action === "skip" || skip[i] ? "opacity-40" : "")}>
                  <td className="p-1"><input type="checkbox" disabled={r.action === "skip"} checked={r.action !== "skip" && !skip[i]} onChange={() => setSkip({ ...skip, [i]: !skip[i] })} /></td>
                  <td className="p-1 whitespace-nowrap">{r.action === "new" ? <Badge tone="green">{tr("חדש")}</Badge> : r.action === "update" ? <Badge tone="amber">{tr("עדכון")}</Badge> : <Badge>{tr(r.problem === "duplicate in file" ? "כפול בקובץ" : "אין חברה")}</Badge>}</td>
                  {FIELDS.filter((f) => Object.values(map).includes(f.key)).map((f) => <td key={f.key} className="p-1 max-w-[14rem] truncate" dir="auto" title={r.row[f.key]}>{r.row[f.key]}</td>)}
                </tr>))}</tbody></table></div>
            {rows.length > 300 && <div className="text-xs text-slate-500">{tr("מוצגות 300 שורות ראשונות — כולן ייובאו.")}</div>}
            <p className="text-[11px] text-slate-500">{tr("עדכון = החברה כבר קיימת (לפי שם): שדות מהקובץ ממלאים/מעדכנים, השלב, ההיסטוריה והמשימות נשמרים. מס' SAP ורכישה אחרונה נשמרים בהערות הלקוח.")}</p>
          </Card>
        </>
      )}
    </div>
  );
}
