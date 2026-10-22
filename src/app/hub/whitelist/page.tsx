"use client";
// page.tsx (src/app/hub/whitelist/page.tsx) · updated 22.10.2026 07:30 (Asia/Jerusalem) — e-mail / mobile / phone fields validated: green ✓ valid, red + hint invalid, amber when already used by another customer / contact (lib/validate.ts + ValidInput) · 11.10.2026 08:20 (Asia/Jerusalem) — 📒 WhatsApp directory: the allow-list (prospects with phone + Silitex contacts + extra allow-list + blocked) with kind filter, search, add/block/unblock/remove
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, H1, Badge, inputCls, btnGhost, btnPrimary } from "@/components/ui";
import { DEPTS } from "@/config/hub";
import { WA_KINDS, waKind } from "@/config/wa";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/i18n";
import ValidInput from "@/components/ValidInput";
type Row = { phone: string; name: string; company: string; kind: string; source: "lead" | "contact" | "list" | "block"; ref: string; dept: string; notes?: string; count: number; last: string | null };
const empty = { phone: "", name: "", company: "", kind: "partner", dept: "customer", notes: "" };
export default function WhitelistPage() {
  const { t: tr } = useLang(); const [rows, setRows] = useState<Row[]>([]); const [q, setQ] = useState(""); const [kind, setKind] = useState(""); const [form, setForm] = useState(empty); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const load = () => fetch("/api/hub/wa-admin?directory=1").then((r) => r.json()).then((j) => setRows(j.directory || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const post = async (b: Record<string, string>) => { setBusy(true); const r = await fetch("/api/hub/wa-admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((x) => x.json()).catch(() => ({ ok: false })); setBusy(false); await load(); return r; };
  const list = useMemo(() => rows.filter((r) => (!kind || r.kind === kind) && (!q || (r.name + " " + r.company + " " + r.phone).toLowerCase().includes(q.toLowerCase()))).sort((a, b) => (b.last || "").localeCompare(a.last || "") || a.name.localeCompare(b.name)), [rows, kind, q]);
  const counts = useMemo(() => Object.fromEntries(WA_KINDS.map((k) => [k.key, rows.filter((r) => r.kind === k.key).length])), [rows]);
  const add = async () => { if (!form.phone.trim()) return; const r = await post({ action: "allow", ...form }); setMsg(r.ok ? tr("נוסף לרשימה הלבנה") + (r.moved ? " · " + r.moved + tr(" הודעות ממתינות הועברו") : "") : tr("שגיאה")); if (r.ok) setForm(empty); };
  return (
    <div className="space-y-4">
      <H1 sub={tr("מי מורשה להיכנס ל-Hub דרך WhatsApp: לקוחות פוטנציאליים (טלפון בתיק), אנשי קשר של Silitex, ורשימה ידנית לכל השאר. מספר שאינו ברשימה מגיע ל-📥 לא מזוהים; חסום = לא נשמר בכלל.")}>📒 {tr("ספריית WhatsApp — רשימה לבנה")}</H1>
      <div className="flex flex-wrap gap-2 items-center text-sm"><Link href="/hub" className={btnGhost}>← Silitex Hub</Link><Badge tone="slate">{rows.filter((r) => r.kind !== "blocked").length} {tr("מורשים")}</Badge><Badge tone="red">{rows.filter((r) => r.kind === "blocked").length} {tr("חסומים")}</Badge><span className="text-xs text-slate-500" dir="ltr">Silitex line: +972 54-886-8195</span></div>
      <Card>
        <div className="font-bold mb-2">➕ {tr("הוסף מספר לרשימה הלבנה")}</div>
        <div className="grid md:grid-cols-6 gap-2 text-sm">
          <ValidInput kind="mobile" placeholder={tr("טלפון (05x / +972)")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <input className={inputCls} placeholder={tr("שם")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inputCls} placeholder={tr("חברה")} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <select className={inputCls} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>{WA_KINDS.filter((k) => k.key !== "customer" && k.key !== "supplier").map((k) => <option key={k.key} value={k.key}>{k.icon} {tr(k.he)}</option>)}</select>
          <select className={inputCls} value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })}>{DEPTS.map((d) => <option key={d.key} value={d.key}>{d.icon} {tr(d.he)}</option>)}</select>
          <button className={btnPrimary} disabled={busy || !form.phone.trim()} onClick={add}>{tr("הוסף")}</button>
        </div>
        <div className="text-xs text-slate-500 mt-1">{tr("לקוחות פוטנציאליים ואנשי קשר של Silitex נכנסים אוטומטית — מלא להם טלפון בתיק. כאן רק השאר: מתווכים, עמילי מכס, מעבדה, צוות.")}{msg && <span className="text-emerald-700 ms-2">{msg}</span>}</div>
      </Card>
      <Card className="flex flex-wrap gap-2 items-center">
        <input className={inputCls + " flex-1 min-w-[200px]"} placeholder={tr("חיפוש שם / חברה / טלפון")} value={q} onChange={(e) => setQ(e.target.value)} />
        <button className={btnGhost + (kind === "" ? " ring-2 ring-brand-500" : "")} onClick={() => setKind("")}>{tr("הכל")} {rows.length}</button>
        {WA_KINDS.map((k) => <button key={k.key} className={btnGhost + (kind === k.key ? " ring-2 ring-brand-500" : "")} onClick={() => setKind(kind === k.key ? "" : k.key)}>{k.icon} {tr(k.he)} {counts[k.key] || 0}</button>)}
        <button className={btnGhost + " text-red-600" + (kind === "blocked" ? " ring-2 ring-red-500" : "")} onClick={() => setKind(kind === "blocked" ? "" : "blocked")}>⛔ {tr("חסומים")} {rows.filter((r) => r.kind === "blocked").length}</button>
      </Card>
      <Card className="p-0 overflow-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-2 text-start">{tr("שם")}</th><th className="p-2 text-start">{tr("חברה")}</th><th className="p-2 text-start">{tr("טלפון")}</th><th className="p-2 text-start">{tr("סוג")}</th><th className="p-2 text-start">{tr("מחלקה ב-Hub")}</th><th className="p-2 text-start">{tr("מקור")}</th><th className="p-2 text-start">{tr("הודעות")}</th><th className="p-2 text-start">{tr("אחרונה")}</th><th className="p-2"></th></tr></thead>
          <tbody>{list.map((r) => { const k = waKind(r.kind); const d = DEPTS.find((x) => x.key === r.dept); return (
            <tr key={r.source + r.ref + r.phone} className={"border-t " + (r.kind === "blocked" ? "bg-red-50/40" : "")}>
              <td className="p-2 font-medium">{r.source === "lead" ? <Link href={"/leads/" + r.ref} className="text-brand-700 hover:underline">{r.name}</Link> : r.name || "—"}</td>
              <td className="p-2 text-slate-600">{r.company}</td>
              <td className="p-2" dir="ltr"><a className="text-emerald-700" href={"https://wa.me/" + r.phone} target="_blank" rel="noreferrer">+{r.phone}</a></td>
              <td className="p-2">{r.kind === "blocked" ? <Badge tone="red">⛔ {tr("חסום")}</Badge> : <Badge tone={r.kind === "customer" ? "green" : r.kind === "supplier" ? "blue" : "slate"}>{k.icon} {tr(k.he)}</Badge>}</td>
              <td className="p-2 text-xs text-slate-600">{d ? d.icon + " " + tr(d.he) : ""}</td>
              <td className="p-2 text-xs text-slate-500">{r.source === "lead" ? tr("תיק לקוח") : r.source === "contact" ? tr("איש קשר Silitex") : r.source === "list" ? tr("רשימה ידנית") : tr("חסימה")}</td>
              <td className="p-2 text-xs">{r.count || ""}</td>
              <td className="p-2 text-xs text-slate-500">{r.last ? fmtDateTime(r.last) : ""}</td>
              <td className="p-2 whitespace-nowrap">{r.count > 0 && r.kind !== "blocked" && <Link href={"/hub?thread=thr-wa-" + r.ref} className={btnGhost + " text-xs me-1"}>📬</Link>}{r.kind === "blocked" ? <button className={btnGhost + " text-xs"} disabled={busy} onClick={() => post({ action: "unblock", phone: r.phone })}>{tr("בטל חסימה")}</button> : <button className={btnGhost + " text-xs text-red-600"} disabled={busy} onClick={() => post({ action: "block", phone: r.phone })}>⛔</button>}{r.source === "list" && <button className={btnGhost + " text-xs ms-1"} disabled={busy} onClick={() => post({ action: "remove", phone: r.phone })}>🗑️</button>}</td>
            </tr>); })}{list.length === 0 && <tr><td colSpan={9} className="p-4 text-center text-slate-400 text-sm">{tr("אין רשומות")}</td></tr>}</tbody></table>
      </Card>
    </div>
  );
}
