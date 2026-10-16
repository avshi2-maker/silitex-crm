"use client";
// page.tsx (src/app/meetings/page.tsx) · updated 16.10.2026 18:20 (Asia/Jerusalem) — OWNER ONLY. Silitex weekly meetings: open actions per party (carried over), smart search across all transcripts + ✨ Ask AI, meeting list, ➕ new meeting (transcript → AI summary + tasks). Stored server-side (Supabase, service role).
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { H1, Card, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import ActionsBoard from "@/components/meetings/ActionsBoard";
import NewMeeting from "@/components/meetings/NewMeeting";
import { useMeetingOps } from "@/components/meetings/useMeetingOps";
import { fmtDate } from "@/lib/format";
import type { Meeting, MeetingAction } from "@/lib/meeting-types";
import { useLang } from "@/i18n";
type Row = Omit<Meeting, "transcript">;
type Hit = { meeting_id: string; title: string; held_at: string; text: string };
export default function MeetingsPage() {
  const { t: tr } = useLang();
  const { state, ready, addSpend } = useStore();
  const [meetings, setMeetings] = useState<Row[]>([]); const [actions, setActions] = useState<MeetingAction[]>([]);
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(true); const [adding, setAdding] = useState(false); const [seeding, setSeeding] = useState(false);
  const [q, setQ] = useState(""); const [tag, setTag] = useState(""); const [hits, setHits] = useState<Hit[] | null>(null); const [searching, setSearching] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/meetings"); const j = await r.json().catch(() => ({}));
    if (!r.ok) setErr(j.error || "error"); else { setErr(""); setMeetings(j.meetings); setActions(j.actions); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const heldAt = (mid: string) => meetings.find((m) => m.id === mid)?.held_at || "";
  const { onToggle, onTask } = useMeetingOps(setActions, heldAt);
  const tags = useMemo(() => Array.from(new Set(meetings.flatMap((m) => m.tags || []))).sort(), [meetings]);
  const shown = tag ? meetings.filter((m) => (m.tags || []).includes(tag)) : meetings;
  const search = async () => {
    if (q.trim().length < 2) return; setSearching(true);
    const r = await fetch("/api/meetings/search?q=" + encodeURIComponent(q)); const j = await r.json().catch(() => ({}));
    setHits(j.hits || []); setSearching(false);
  };
  const seed = async () => { setSeeding(true); const r = await fetch("/api/meetings/seed", { method: "POST" }); const j = await r.json().catch(() => ({})); if (!r.ok) setErr(j.error || "error"); await load(); setSeeding(false); };
  if (!ready) return null;
  const open = actions.filter((a) => a.status === "open");
  return (
    <div className="space-y-4">
      <H1 sub={tr("פגישות שבועיות עם Silitex — תמליל Teams → סיכום AI, החלטות ומשימות לכל צד · חיפוש חכם בכל הפגישות · נראה רק לך")}>🗓️ {tr("פגישות Silitex")}</H1>
      {err && (
        <Card className="border-amber-300 bg-amber-50 text-sm space-y-1">
          <div className="font-bold">⚠️ {err}</div>
          <div>{tr("הפעלה חד-פעמית: Supabase → SQL Editor → הדבק את הקובץ supabase/meetings.sql → Run. אחר כך רענן את הדף.")}</div>
        </Card>
      )}
      <div className="flex flex-wrap gap-2">
        <button className={btnPrimary} onClick={() => setAdding(true)} disabled={adding}>➕ {tr("פגישה חדשה (תמליל)")}</button>
        {!loading && !err && !meetings.some((m) => m.id === "mtg-20261016") && <button className={btnGhost} onClick={seed} disabled={seeding}>{seeding ? tr("טוען…") : "📥 " + tr("טען פגישה #1 — 16/10/2026")}</button>}
      </div>
      {adding && <NewMeeting open={actions} onCancel={() => setAdding(false)} onSaved={async () => { setAdding(false); await load(); }} />}
      <Card className="space-y-2">
        <div className="flex items-center justify-between"><h2 className="font-bold">✅ {tr("משימות פתוחות — מכל הפגישות")} <span className="text-slate-400 font-normal">({open.length})</span></h2><label className="text-xs flex items-center gap-1"><input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />{tr("הצג גם שבוצעו")}</label></div>
        <ActionsBoard actions={actions} meetings={meetings} onToggle={onToggle} onTask={onTask} showDone={showDone} />
        <p className="text-[11px] text-slate-400">{tr("📌 = צור משימה ב-CRM (מופיעה בלוח הבקרה וביומן). ✓ סוגר גם את משימת ה-CRM. משימות פתוחות נשלחות ל-AI בסיכום הפגישה הבאה.")}</p>
      </Card>
      <Card className="space-y-3">
        <h2 className="font-bold">🔎 {tr("חיפוש חכם בכל הפגישות")}</h2>
        <div className="flex gap-2"><input dir="ltr" className={inputCls} placeholder={tr("למשל: exclusivity · D5 · food · WhatsApp · antifoam · NuSil")} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} /><button className={btnGhost} onClick={search} disabled={searching}>{searching ? "…" : tr("🔎 חפש")}</button>{q && <button className={btnGhost} onClick={() => { setQ(""); setHits(null); }}>✕</button>}</div>
        {hits && hits.length === 0 && <div className="text-sm text-slate-400">{tr("לא נמצא.")}</div>}
        {hits && hits.length > 0 && <ul className="space-y-2 max-h-80 overflow-y-auto" dir="ltr">{hits.map((h, i) => (
          <li key={i} className="border rounded-lg p-2 text-xs"><Link href={"/meetings/" + h.meeting_id + "?q=" + encodeURIComponent(q)} className="font-bold text-brand-700 underline">{fmtDate(h.held_at)} · {h.title}</Link><div className="text-slate-600 whitespace-pre-wrap mt-1 line-clamp-6">{h.text}</div></li>
        ))}</ul>}
        {hits && hits.length > 0 && (
          <AiPanel title={tr("תשובת AI מהפגישות")} buttonLabel={tr("שאל AI על הפגישות")} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)}
            buildPrompt={() => ({ prompt: "Answer the question using ONLY these excerpts from Sapirim–Silitex meetings. Quote who said what and the meeting date. If the excerpts don't answer it, say so. Question: " + q, context: hits.map((h) => "[" + fmtDate(h.held_at) + " · " + h.title + "]\n" + h.text).join("\n\n---\n\n") })} />
        )}
      </Card>
      <Card className="space-y-2">
        <div className="flex flex-wrap items-center gap-1"><h2 className="font-bold me-2">📚 {tr("פגישות")} ({meetings.length})</h2>{tags.map((t) => <button key={t} onClick={() => setTag(tag === t ? "" : t)} className={"text-xs px-2 py-0.5 rounded-full border " + (tag === t ? "bg-brand-500 text-white" : "bg-slate-50 hover:bg-brand-50")}>#{t}</button>)}</div>
        {loading && <div className="text-sm text-slate-400">{tr("טוען…")}</div>}
        {!loading && !err && meetings.length === 0 && <div className="text-sm text-slate-400">{tr("אין פגישות עדיין.")}</div>}
        <ul className="divide-y">{shown.map((m) => {
          const ma = actions.filter((a) => a.meeting_id === m.id); const o = ma.filter((a) => a.status === "open");
          return (<li key={m.id} className="py-2"><Link href={"/meetings/" + m.id} className="flex flex-wrap items-center gap-2 hover:bg-slate-50 rounded-lg p-1">
            <span className="font-bold tabular-nums">{fmtDate(m.held_at)}</span><span dir="ltr" className="font-medium">{m.title}</span>
            <Badge tone={o.length ? "amber" : "green"}>{o.length}/{ma.length} {tr("פתוחות")}</Badge>
            <span className="flex flex-wrap gap-1">{(m.tags || []).slice(0, 8).map((t) => <span key={t} className="text-[11px] text-slate-400">#{t}</span>)}</span>
          </Link>{m.summary?.summary?.[0] && <div dir="ltr" className="text-xs text-slate-500 ps-1 line-clamp-2">{m.summary.summary[0]}</div>}</li>);
        })}</ul>
      </Card>
    </div>
  );
}
