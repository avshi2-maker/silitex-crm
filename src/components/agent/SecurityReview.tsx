"use client";
// SecurityReview.tsx (src/components/agent/SecurityReview.tsx) · updated 16.11.2026 20:50 (Asia/Jerusalem) — v1.14.3 says what is still missing under the button (the note box was easy to miss) · created 16.11.2026 20:30 — v1.14.2 🚨 forced review of security events on /agent#security:
// each event: sender · reason · date · 📧 full mail → tick BOTH checks + write what you checked (min 5 chars) → only then "✓ checked — close". 🧪 test alarm button.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, btnPrimary, btnGhost, inputCls } from "@/components/ui";
import { fmtDate } from "@/lib/format";

type Ev = { id: string; sender: string; subject: string; summary: string; msg_at: string; thread_id?: string; lead_name?: string };
function One({ e, onDone }: { e: Ev; onDone: () => void }) {
  const [a, setA] = useState(false); const [b, setB] = useState(false); const [note, setNote] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const ok = a && b && note.trim().length >= 5;
  const close = async () => { setBusy(true); setErr(""); const r = await fetch("/api/agent/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: e.id, note }) }); const j = await r.json(); if (!r.ok) setErr(j.error || "error"); else onDone(); setBusy(false); };
  return (
    <div className="rounded-lg border-2 border-red-300 bg-white p-3 space-y-2">
      <div className="text-sm font-bold">{e.summary}</div>
      <div className="text-xs text-slate-600" dir="auto">✉ {e.sender} · {e.subject} · {fmtDate(e.msg_at)}{e.thread_id && <> · <Link href={"/hub?thread=" + e.thread_id} className="underline font-bold">📧 פתח את המייל המלא</Link></>}</div>
      <label className="flex items-center gap-2 text-sm min-h-[36px]"><input type="checkbox" className="w-5 h-5" checked={a} onChange={(x) => setA(x.target.checked)} /> פתחתי ובדקתי את המייל המלא ואת השולח</label>
      <label className="flex items-center gap-2 text-sm min-h-[36px]"><input type="checkbox" className="w-5 h-5" checked={b} onChange={(x) => setB(x.target.checked)} /> לא לחצתי על קישורים, לא שילמתי ולא עניתי לשולח</label>
      <input className={inputCls + (a && b && note.trim().length < 5 ? " ring-2 ring-red-400 border-red-400" : "")} value={note} onChange={(x) => setNote(x.target.value)} placeholder="מה בדקת / מה עשית (חובה) — למשל: ספאם, השולח נחסם ב-Outlook" dir="auto" />
      <button className={btnPrimary + " min-h-[44px]"} disabled={!ok || busy} onClick={close}>✓ בדקתי — סגור</button>
      {!ok && <span className="text-xs text-red-700 ms-2">{!a || !b ? "☐ סמן את שתי הבדיקות" : "✍ כתוב בתיבה מה בדקת (לפחות 5 תווים) — ואז הכפתור נפתח"}</span>}
      {err && <span className="text-xs text-red-700 ms-2">{err}</span>}
    </div>
  );
}
export default function SecurityReview() {
  const [items, setItems] = useState<Ev[] | null>(null); const [busy, setBusy] = useState(false);
  const load = useCallback(() => { fetch("/api/agent/alerts", { cache: "no-store" }).then((r) => r.json()).then((j) => setItems(j.items || [])).catch(() => setItems([])); window.dispatchEvent(new Event("silitex-security")); }, []);
  useEffect(() => { load(); }, [load]);
  const test = async () => { setBusy(true); await fetch("/api/agent/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ test: true }) }); load(); setBusy(false); };
  const list = items || [];
  return (
    <div id="security">
      <Card className={"space-y-2 " + (list.length ? "border-2 border-red-500 bg-red-50" : "")}>
        <div className="flex flex-wrap items-center gap-2"><b className="flex-1">🚨 אירועי אבטחה {list.length ? "(" + list.length + " ממתינים)" : "— אין"}</b><button className={btnGhost + " min-h-[40px]"} disabled={busy} onClick={test}>🧪 בדיקת אזעקה</button></div>
        {list.length === 0 && <div className="text-xs text-slate-500">✓ אין אירועים פתוחים. 🧪 יוצר אירוע בדיקה כדי לראות את האזעקה בפעולה.</div>}
        {list.map((e) => <One key={e.id} e={e} onDone={load} />)}
      </Card>
    </div>
  );
}
