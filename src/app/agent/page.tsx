"use client";
// page.tsx (src/app/agent/page.tsx) · created 16.11.2026 19:25 (Asia/Jerusalem) — v1.14.0 🤖 Back-office agent — "only my last click". Mobile-first.
// Every new mail (synced from Outlook every 15 min) is read by the agent every 30 min → a card: who · what · urgency + ready actions:
// ✉ mail (opens prepared mail) · 📱 WhatsApp · 📞 call · 🔔 → task · 📦 draft order made from the mail. Each action: one click to do it, then ✓.
// Nothing is sent by itself. ▶ run now · token + cost meter · export bar of the open cards.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, H1, Badge, btnPrimary, btnGhost } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Usage } from "@/lib/types";

type Act = { kind: string; title: string; to?: string; cc?: string; subject?: string; body?: string; phone?: string; due?: string; done?: boolean };
type Item = { id: string; lead_id?: string; lead_name: string; project_id?: string; subject: string; sender: string; msg_at: string; intent: string; urgency: string; summary: string; actions: Act[]; order_id?: string; status: string; usage?: Usage; thread_id?: string };
const ICON: Record<string, string> = { mail_customer: "✉", mail_silitex: "🇮🇹", whatsapp: "📱", call: "📞", task: "🔔" };
const INTENT: Record<string, string> = { sample_request: "בקשת דוגמה", order: "הזמנה", rfq: "בקשת מחיר / נתונים", silitex_answer: "תשובת Silitex", logistics: "לוגיסטיקה", question: "שאלה", followup: "מעקב", other: "אחר", junk: "זבל" };
const intl = (p = "") => { const d = p.replace(/\D/g, ""); return d.startsWith("0") ? "972" + d.slice(1) : d; };
const link = (a: Act) => a.kind === "whatsapp" && a.phone ? "https://wa.me/" + intl(a.phone) + "?text=" + encodeURIComponent(a.body || "") : a.kind === "call" && a.phone ? "tel:" + a.phone : a.kind.startsWith("mail") ? "mailto:" + encodeURIComponent(a.to || "") + "?subject=" + encodeURIComponent(a.subject || "") + (a.cc ? "&cc=" + encodeURIComponent(a.cc) : "") + "&body=" + encodeURIComponent(a.body || "") : "";

export default function AgentPage() {
  const { t: tr } = useLang(); const { state, addSpend } = useStore();
  const [st, setSt] = useState("pending"); const [items, setItems] = useState<Item[] | null>(null); const [busy, setBusy] = useState(""); const [msg, setMsg] = useState(""); const [open, setOpen] = useState<Record<string, boolean>>({});
  const load = useCallback(() => { fetch("/api/agent?status=" + st, { cache: "no-store" }).then((r) => r.json()).then((j) => setItems(j.items || [])).catch(() => setItems([])); }, [st]);
  useEffect(() => { load(); }, [load]);
  const patch = async (b: Record<string, unknown>) => { const r = await fetch("/api/agent", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); const j = await r.json(); if (j.item) setItems((cur) => (cur || []).map((x) => (x.id === j.item.id ? j.item : x)).filter((x) => st === "all" || x.status === st)); };
  const run = async () => { setBusy("run"); setMsg(""); try { const r = await fetch("/api/agent", { method: "POST" }); const j = await r.json(); setMsg(j.error || "🤖 " + tr("נקראו") + " " + j.read + " · " + tr("כרטיסים חדשים") + " " + j.cards + (j.orders?.length ? " · 📦 " + j.orders.join(", ") : "") + " · $" + Number(j.cost || 0).toFixed(3)); if (j.cost) addSpend(0, j.cost); load(); } catch (e) { setMsg(String(e)); } setBusy(""); };
  const list = items || []; const total = list.reduce((a, x) => a + (x.usage?.cost_usd || 0), 0); const toks = list.reduce((a, x) => a + (x.usage ? x.usage.input_tokens + x.usage.output_tokens : 0), 0);
  const text = list.map((x) => (x.urgency === "high" ? "🔴 " : "• ") + x.lead_name + " — " + x.summary + "\n" + x.actions.map((a) => "   " + (a.done ? "✓ " : "☐ ") + (ICON[a.kind] || "") + " " + a.title).join("\n") + (x.order_id ? "\n   📦 " + x.order_id : "")).join("\n\n");
  return (
    <div className="space-y-4 max-w-3xl">
      <H1 sub={tr("כל מייל חדש נקרא ע״י הסוכן — הוא מכין את הפעולות, טיוטות הזמנה ומיילים. שום דבר לא נשלח בלי הלחיצה שלך.")}>🤖 {tr("סוכן משרד")}</H1>
      <div className="flex flex-wrap gap-2 items-center">
        {[["pending", "ממתין לאישור"], ["done", "בוצע"], ["dismissed", "לא רלוונטי"], ["all", "הכל"]].map(([k, he]) => <button key={k} onClick={() => setSt(k)} className={"px-3 min-h-[40px] rounded-full text-sm border " + (st === k ? "bg-ink-900 text-white border-ink-900" : "bg-white")}>{tr(he)}{k === st && items ? " (" + list.length + ")" : ""}</button>)}
        <button className={btnPrimary + " min-h-[44px] ms-auto"} disabled={!!busy} onClick={run}>▶ {busy ? tr("קורא מיילים…") : tr("הרץ עכשיו")}</button>
      </div>
      {msg && <div className="text-sm text-slate-600">{msg}</div>}
      <TokenMeter usage={list[0]?.usage} sessionTokens={toks || state.spend.tokens} sessionCost={total || state.spend.cost} busy={busy === "run"} />
      {items !== null && list.length === 0 && <Card className="text-sm text-slate-500">{st === "pending" ? "✓ " + tr("אין פעולות ממתינות. הסוכן רץ כל 30 דקות.") : tr("אין כרטיסים.")}</Card>}
      {list.map((x) => (
        <Card key={x.id} className={"space-y-2 " + (x.urgency === "high" ? "border-2 border-red-300" : "")}>
          <div className="flex flex-wrap items-center gap-2">
            {x.urgency === "high" && <Badge tone="red">🔴 {tr("דחוף")}</Badge>}<Badge tone="blue">{tr(INTENT[x.intent] || x.intent)}</Badge>
            {x.lead_id ? <Link href={"/leads/" + x.lead_id} className="font-bold underline">{x.lead_name}</Link> : <b>{x.lead_name || x.sender.replace(/<[^>]+>/g, "")}</b>}
            {x.project_id && <Link href={"/projects/" + x.project_id} className="font-mono text-xs underline" dir="ltr">#{x.project_id}</Link>}
            <span className="text-xs text-slate-500 ms-auto">{fmtDate(x.msg_at)}</span>
          </div>
          <div className="text-sm">{x.summary || x.subject}</div>
          <div className="text-xs text-slate-500" dir="auto">✉ {x.sender} · {x.subject}{x.thread_id && <> · <Link href={"/hub?thread=" + x.thread_id} className="underline">{tr("המייל המלא")}</Link></>}</div>
          {x.order_id && <Link href={"/orders/" + x.order_id} className="flex items-center gap-2 rounded-lg border-2 border-violet-300 bg-violet-50 p-2 text-sm font-bold">📦 {tr("טיוטת הזמנה מוכנה")}: <span dir="ltr" className="font-mono">{x.order_id}</span> → {tr("לבדוק ולשלוח ללקוח לחתימה")}</Link>}
          <ul className="space-y-2">{x.actions.map((a, i) => (
            <li key={i} className={"rounded-lg border p-2 " + (a.done ? "bg-emerald-50 opacity-70" : "bg-white")}>
              <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium flex-1">{ICON[a.kind] || "•"} {a.title}{a.to ? <span className="text-xs text-slate-500" dir="ltr"> · {a.to}</span> : null}</span>
                {link(a) && <a href={link(a)} target={a.kind === "whatsapp" ? "_blank" : undefined} rel="noreferrer" className={btnPrimary + " min-h-[40px] inline-flex items-center"} onClick={() => !a.done && patch({ id: x.id, action: i, done: true })}>{a.kind === "call" ? tr("חייג") : a.kind === "whatsapp" ? "WhatsApp" : tr("פתח מייל")}</a>}
                {a.kind === "task" && !a.done && <button className={btnPrimary + " min-h-[40px]"} onClick={() => patch({ id: x.id, task: i })}>🔔 {tr("למשימות")}</button>}
                <button className={btnGhost + " min-h-[40px]"} onClick={() => patch({ id: x.id, action: i, done: !a.done })}>{a.done ? "↩" : "✓"}</button>
                {a.body && <button className={btnGhost + " min-h-[40px]"} onClick={() => setOpen({ ...open, [x.id + i]: !open[x.id + i] })}>{open[x.id + i] ? "▾" : "▸"}</button>}</div>
              {open[x.id + i] && a.body && <pre className="whitespace-pre-wrap font-[inherit] text-sm bg-slate-50 border rounded p-2 mt-2" dir="auto">{a.subject ? a.subject + "\n\n" : ""}{a.body}</pre>}
            </li>))}</ul>
          {x.status === "pending" && <div className="flex gap-2"><button className={btnGhost + " min-h-[40px]"} onClick={() => patch({ id: x.id, status: "done" })}>✓ {tr("סגור כרטיס")}</button><button className={btnGhost + " min-h-[40px]"} onClick={() => patch({ id: x.id, status: "dismissed" })}>✕ {tr("לא רלוונטי")}</button></div>}
          {x.status !== "pending" && <button className={btnGhost} onClick={() => patch({ id: x.id, status: "pending" })}>↩ {tr("החזר לממתינים")}</button>}
        </Card>
      ))}
      {list.length > 0 && <Card><ExportBar title={"🤖 " + tr("סוכן משרד") + " — " + fmtDate(new Date())} text={text} filename={"agent_" + new Date().toISOString().slice(0, 10)} /></Card>}
    </div>
  );
}
