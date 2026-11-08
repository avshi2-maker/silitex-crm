"use client";
// page.tsx (src/app/insight/page.tsx) · created 08.11.2026 16:20 (Asia/Jerusalem) — v1.8.0
// 🕵️ Customer insights board: every customer with correspondence / activity, ranked by "needs your attention first"
// (risks · ball in your court · hot / stalled · open promises). "Analyse all" runs the agent one by one (meter adds up).
// A weekly run (Sunday 05:30, /api/cron/insight) refreshes active customers automatically.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, H1, Badge, btnPrimary } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { useStore } from "@/lib/store";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { TEMP, WAIT, RISK, WHO, attention, type InsightRow } from "@/lib/insight-types";
import type { Usage } from "@/lib/types";

type L = { id: string; name: string; stage: string; industry: string };
export default function InsightBoard() {
  const { state, addSpend } = useStore();
  const [rows, setRows] = useState<InsightRow[]>([]); const [cand, setCand] = useState<string[]>([]); const [leads, setLeads] = useState<L[]>([]);
  const [busy, setBusy] = useState(""); const [done, setDone] = useState(0); const [usage, setUsage] = useState<Usage | null>(null); const [err, setErr] = useState("");
  const load = () => fetch("/api/insight?board=1", { cache: "no-store" }).then((r) => r.json()).then((j) => { setRows(j.rows || []); setCand(j.candidates || []); setLeads(j.leads || []); }).catch(() => {});
  useEffect(() => { load(); }, []);
  const name = (id: string) => leads.find((l) => l.id === id)?.name || id;
  const ranked = useMemo(() => [...rows].sort((a, b) => attention(b.report) - attention(a.report) || b.created_at.localeCompare(a.created_at)), [rows]);
  const stale = cand.filter((id) => { const r = rows.find((x) => x.lead_id === id); return !r || Date.now() - new Date(r.created_at).getTime() > 3 * 864e5; });
  const runAll = async () => {
    setErr(""); setDone(0); let tot: Usage = { input_tokens: 0, output_tokens: 0, cost_usd: 0, model: "" };
    for (let i = 0; i < stale.length; i++) {
      setBusy(name(stale[i]));
      try { const r = await fetch("/api/insight", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lead_id: stale[i] }) }); const j = await r.json();
        if (r.ok) { tot = { ...tot, input_tokens: tot.input_tokens + j.usage.input_tokens, output_tokens: tot.output_tokens + j.usage.output_tokens, cost_usd: tot.cost_usd + j.usage.cost_usd, model: j.usage.model }; setUsage({ ...tot }); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); setRows((cur) => [j.row, ...cur.filter((x) => x.lead_id !== j.row.lead_id)]); }
        else setErr((e) => e + name(stale[i]) + ": " + (j.error || r.status) + " · "); } catch { setErr((e) => e + name(stale[i]) + ": network · "); }
      setDone(i + 1);
    }
    setBusy("");
  };
  const text = ranked.map((r, i) => (i + 1) + ". " + name(r.lead_id) + " — " + TEMP[r.report.temperature].icon + " " + WAIT[r.report.waiting_on] + "\n   " + r.report.status + "\n   👉 " + r.report.next_action.text).join("\n\n");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2"><H1 sub="כל לקוח עם התכתבות / פעילות — מדורג לפי מי צריך את תשומת הלב שלך קודם. הסוכן קורא הכל ומחזיר שורה אחת + צעד הבא.">🕵️ תובנות לקוחות</H1>
        <button className={btnPrimary} disabled={!!busy || stale.length === 0} onClick={runAll}>{busy ? `מנתח ${done + 1}/${stale.length}: ${busy}` : stale.length ? `✨ נתח ${stale.length} לקוחות שלא נותחו 3 ימים` : "✓ הכל מעודכן"}</button></div>
      <TokenMeter usage={usage} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} busy={!!busy} />
      {err && <div className="text-sm text-red-600">{err}</div>}
      <Card>
        {ranked.length === 0 && <p className="text-sm text-slate-500">עוד אין דוחות. לחץ ״נתח״ למעלה, או ״✨ נתח לקוח״ בכרטיס לקוח. ריצה אוטומטית: כל יום ראשון 05:30.</p>}
        <ul className="divide-y">{ranked.map((r, i) => { const t = TEMP[r.report.temperature]; const top = [...r.report.risks].sort((a, b) => (a.level === "high" ? 0 : a.level === "medium" ? 1 : 2) - (b.level === "high" ? 0 : b.level === "medium" ? 1 : 2))[0]; return (
          <li key={r.id} className="py-2 text-sm">
            <div className="flex flex-wrap items-center gap-2"><span className="text-slate-400 w-5">{i + 1}</span><Link href={"/leads/" + r.lead_id} className="font-bold text-brand-700 hover:underline">{name(r.lead_id)}</Link><Badge tone={t.tone}>{t.icon} {t.he}</Badge><Badge tone={r.report.waiting_on === "us" ? "red" : "slate"}>{WAIT[r.report.waiting_on]}</Badge><span className="text-xs text-slate-400 ms-auto">{fmtDate(r.created_at.slice(0, 10))}</span></div>
            <div className="ps-7">{r.report.status}</div>
            {top && <div className="ps-7 text-xs">{RISK[top.level]} {top.text}</div>}
            {r.report.next_action.text && <div className="ps-7 text-xs text-brand-700">👉 {r.report.next_action.text} ({WHO[r.report.next_action.who]}, {r.report.next_action.due_days} ימים)</div>}
          </li>); })}</ul>
      </Card>
      {ranked.length > 0 && <ExportBar title={"תובנות לקוחות — " + fmtDateTime(new Date().toISOString())} text={text} />}
    </div>
  );
}
