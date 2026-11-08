"use client";
// InsightCard.tsx (src/components/leads/InsightCard.tsx) · created 08.11.2026 16:20 (Asia/Jerusalem) — v1.8.0
// 🕵️ Customer insight on the customer page: one tap → the agent reads all mails / WhatsApp (customer + Silitex), activity log and tasks
// → short report: status · temperature · who we wait for · open requests · promises ✓/✗ · risks · potential · next step (+ one-tap task).
import { useEffect, useState } from "react";
import { Card, Badge, btnPrimary, btnGhost } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { fmtDateTime, addDays, todayIso } from "@/lib/format";
import { TEMP, WAIT, WHO, RISK, insightText, type InsightRow } from "@/lib/insight-types";
import type { Lead, Usage } from "@/lib/types";

type Props = { lead: Lead; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void; onTask: (title: string, due: string) => void };
export default function InsightCard({ lead, spend, addSpend, onTask }: Props) {
  const [row, setRow] = useState<InsightRow | null>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [usage, setUsage] = useState<Usage | null>(null); const [added, setAdded] = useState(false);
  useEffect(() => { fetch("/api/insight?lead=" + encodeURIComponent(lead.id), { cache: "no-store" }).then((r) => r.json()).then((j) => setRow(j.row || null)).catch(() => {}); }, [lead.id]);
  const run = async () => {
    setBusy(true); setErr(""); setAdded(false);
    try { const r = await fetch("/api/insight", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lead_id: lead.id }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error || "error"); setRow(j.row); setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); }
    catch (e) { setErr(e instanceof Error ? e.message : "error"); }
    setBusy(false);
  };
  const r = row?.report; const t = r ? TEMP[r.temperature] : null;
  return (
    <Card className="border-brand-100">
      <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold flex-1">🕵️ תובנות לקוח</h3>{row && <span className="text-xs text-slate-500">ניתוח אחרון: {fmtDateTime(row.created_at)}</span>}<button className={btnPrimary + (!row && !busy ? " ai-pulse" : "")} disabled={busy} onClick={run}>{busy ? "קורא את כל ההתכתבות…" : row ? "🔄 נתח מחדש" : "✨ נתח לקוח"}</button></div>
      {!row && !busy && <p className="text-xs text-slate-500 mt-1">הסוכן קורא את כל המיילים והוואטסאפ (לקוח + Silitex), יומן הפעילות והמשימות — ומחזיר דוח קצר במקום לקרוא הכל.</p>}
      <div className="mt-2"><TokenMeter usage={usage} sessionTokens={spend.tokens} sessionCost={spend.cost} busy={busy} /></div>
      {err && <div className="text-sm text-red-600 mt-1">{err}</div>}
      {r && t && <div className="mt-2 space-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-2"><Badge tone={t.tone}>{t.icon} {t.he}</Badge><Badge tone={r.waiting_on === "us" ? "red" : "slate"}>{WAIT[r.waiting_on]}</Badge>{r.last_contact?.date && <span className="text-xs text-slate-500">קשר אחרון: {r.last_contact.date} · {r.last_contact.by === "customer" ? "הלקוח" : r.last_contact.by === "silitex" ? "Silitex" : "אתה"}</span>}</div>
        <div className="font-medium">{r.status}</div>
        {r.open_requests.length > 0 && <div><b className="text-xs text-slate-500">בקשות פתוחות של הלקוח</b><ul className="list-disc ps-5">{r.open_requests.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
        {r.promises.length > 0 && <div><b className="text-xs text-slate-500">התחייבויות שלנו</b><ul>{r.promises.map((p, i) => <li key={i} className={p.done ? "text-emerald-700" : "text-red-700"}>{p.done ? "✓" : "✗"} {p.text}</li>)}</ul></div>}
        {r.risks.length > 0 && <div><b className="text-xs text-slate-500">סיכונים</b><ul>{r.risks.map((x, i) => <li key={i}>{RISK[x.level]} {x.text}</li>)}</ul></div>}
        {r.potential && <div><b className="text-xs text-slate-500">פוטנציאל אמיתי</b><div>{r.potential}</div></div>}
        {r.next_action.text && <div className="bg-brand-50 rounded-lg p-2 flex flex-wrap items-center gap-2"><span className="flex-1">👉 <b>צעד הבא</b> ({WHO[r.next_action.who]}, תוך {r.next_action.due_days} ימים): {r.next_action.text}</span><button className={btnGhost + " text-xs"} disabled={added} onClick={() => { onTask("🕵️ " + r.next_action.text, addDays(todayIso(), r.next_action.due_days)); setAdded(true); }}>{added ? "✓ נוספה משימה" : "➕ משימה"}</button></div>}
        <ExportBar title={"תובנות — " + lead.name} text={insightText(lead.name, r, fmtDateTime(row!.created_at))} />
      </div>}
    </Card>
  );
}
