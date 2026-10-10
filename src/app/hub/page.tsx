"use client";
// page.tsx (src/app/hub/page.tsx) · updated 10.10.2026 05:50 (Asia/Jerusalem) — Silitex Hub: department boxes → threads (filter dept/status/ref) → thread view; paste-mail intake; Graph ingest sync (Phase B)
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, H1, Badge, inputCls, btnGhost } from "@/components/ui";
import DeptBoxes from "@/components/hub/DeptBoxes";
import PasteMail from "@/components/hub/PasteMail";
import ThreadView from "@/components/hub/ThreadView";
import { DEPTS, THREAD_STATUS } from "@/config/hub";
import { isLate, waitingDays } from "@/lib/hub";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Thread, HubMsg } from "@/lib/types";
export default function HubPage() {
  const { t: tr } = useLang();
  const { state, ready, addSpend, upsertContact, removeContact, addThread, updateThread, removeThread, addMsg, addTask } = useStore();
  const [dept, setDept] = useState(""); const [status, setStatus] = useState(""); const [q, setQ] = useState(""); const [sel, setSel] = useState(""); const [synced, setSynced] = useState<string>("");
  useEffect(() => { try { const l = new URLSearchParams(window.location.search).get("lead"); if (l) setQ(l); } catch {} }, []);
  // Phase B: merge threads/messages ingested server-side (Outlook → /api/hub/ingest → Supabase) into the browser state
  useEffect(() => { fetch("/api/hub/ingest").then((r) => r.json()).then((j) => { if (!j.threads?.length) return; let n = 0; (j.threads as Thread[]).forEach((t) => { if (!state.threads.some((x) => x.id === t.id)) { addThread({ ...t, refs: t.refs || {} }); n++; } }); (j.msgs as HubMsg[]).forEach((m) => { if (!state.msgs.some((x) => x.id === m.id)) addMsg(m); }); if (n) setSynced(tr("סונכרנו ") + n + tr(" שרשורים מ-Outlook")); }).catch(() => {}); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return null;
  const list = state.threads.filter((t) => (!dept || t.dept === dept) && (!status || t.status === status) && (!q || (t.subject + " " + JSON.stringify(t.refs)).toLowerCase().includes(q.toLowerCase()))).sort((a, b) => Number(isLate(b)) - Number(isLate(a)) || b.last_at.localeCompare(a.last_at));
  const cur = state.threads.find((t) => t.id === sel);
  const late = state.threads.filter(isLate);
  return (
    <div className="space-y-4">
      <H1 sub={tr("כל ההתכתבות עם Silitex לפי מחלקה, מקושרת להזמנות, משלוחים ולקוחות — במקום לרדוף אחרי מיילים. ") + state.threads.length + tr(" שרשורים · ") + late.length + tr(" ממתינים מעל 2 ימים")}>📬 Silitex Hub</H1>
      {synced && <div className="text-xs text-emerald-700">{synced}</div>}
      <DeptBoxes contacts={state.contacts} threads={state.threads} sel={dept} onSel={setDept} onSave={upsertContact} onRemove={removeContact} />
      <PasteMail leads={state.leads} shipments={state.shipments} threads={state.threads} current={cur} onNewThread={(t, m) => { const th = addThread(t); addMsg({ ...m, thread_id: th.id }); setSel(th.id); }} onAppend={(tid, m) => { addMsg({ ...m, thread_id: tid }); setSel(tid); }} />
      <Card className="flex flex-wrap gap-2 items-center"><input className={inputCls + " flex-1 min-w-[200px]"} placeholder={tr("חיפוש נושא / SHP / P/O / לקוח")} value={q} onChange={(e) => setQ(e.target.value)} /><select className={inputCls + " w-48"} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">{tr("כל הסטטוסים")}</option>{THREAD_STATUS.map((s) => <option key={s.key} value={s.key}>{tr(s.he)}</option>)}</select>{dept && <button className={btnGhost} onClick={() => setDept("")}>{tr("כל המחלקות")} ✕</button>}</Card>
      <div className="grid lg:grid-cols-[360px_1fr] gap-4 items-start">
        <Card className="p-0 divide-y max-h-[70vh] overflow-auto">
          {list.map((t) => { const d = DEPTS.find((x) => x.key === t.dept); const st = THREAD_STATUS.find((s) => s.key === t.status); const n = state.msgs.filter((m) => m.thread_id === t.id).length; return (
            <button key={t.id} onClick={() => setSel(t.id)} className={"w-full text-start p-2 text-sm hover:bg-slate-50 " + (sel === t.id ? "bg-brand-50" : "")}>
              <div className="flex items-center gap-1"><span>{d?.icon}</span><span className="font-medium truncate flex-1">{t.subject}</span>{isLate(t) && <Badge tone="red">⏰{waitingDays(t)}</Badge>}<Badge tone={st?.tone}>{tr(st?.he || t.status)}</Badge></div>
              <div className="text-xs text-slate-500 truncate">{[t.refs.shipment_ref, t.refs.lead_name, t.refs.po && "P/O " + t.refs.po, t.refs.sku].filter(Boolean).join(" · ") || tr("ללא קישור")} · {n} · {fmtDate(t.last_at)}</div>
            </button>); })}
          {list.length === 0 && <div className="p-3 text-xs text-slate-400">{tr("אין שרשורים. הדבק מייל למעלה — או חבר את Outlook (שלב B).")}</div>}
        </Card>
        {cur ? <ThreadView key={cur.id} th={cur} msgs={state.msgs.filter((m) => m.thread_id === cur.id)} leads={state.leads} shipments={state.shipments} spend={state.spend} addSpend={addSpend} onUpdate={(p) => updateThread(cur.id, p)} onDelete={() => { removeThread(cur.id); setSel(""); }} onTask={(title, due) => addTask({ lead_id: cur.refs.lead_id || "silitex", lead_name: cur.refs.lead_name || "Silitex", title, due, cadence: "once", kind: "hub" })} /> : <Card className="text-sm text-slate-500">{tr("בחר שרשור מהרשימה, או הדבק מייל חדש.")}</Card>}
      </div>
    </div>
  );
}
