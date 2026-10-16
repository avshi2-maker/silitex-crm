"use client";
// page.tsx (src/app/meetings/[id]/page.tsx) · updated 16.10.2026 18:40 · English UI (Asia/Jerusalem) — OWNER ONLY. One meeting: summary, decisions, open questions, actions per party (✓ / 📌 CRM task), export bar, ✨ follow-up email draft, transcript with find-and-highlight, delete (2-step).
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { H1, Card, Badge, inputCls, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import ExportBar from "@/components/ExportBar";
import ActionsBoard from "@/components/meetings/ActionsBoard";
import { useMeetingOps } from "@/components/meetings/useMeetingOps";
import { fmtDate } from "@/lib/format";
import { meetingText, type Meeting, type MeetingAction, type MeetingSummary } from "@/lib/meeting-types";
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export default function MeetingPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter();
  const { state, ready, addSpend } = useStore();
  const [m, setM] = useState<Meeting | null>(null); const [actions, setActions] = useState<MeetingAction[]>([]); const [err, setErr] = useState("");
  const [find, setFind] = useState(""); const [showT, setShowT] = useState(false); const [del, setDel] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q"); if (q) { setFind(q); setShowT(true); }
    fetch("/api/meetings/" + id).then(async (r) => { const j = await r.json(); if (!r.ok) setErr(j.error); else { setM(j.meeting); setActions(j.actions); } });
  }, [id]);
  const { onToggle, onTask } = useMeetingOps(setActions, () => m?.held_at || "");
  const lines = useMemo(() => (m?.transcript || "").split("\n"), [m]);
  const words = find.trim().split(/\s+/).filter((w) => w.length > 1);
  const re = words.length ? new RegExp("(" + words.map(esc).join("|") + ")", "gi") : null;
  const re1 = words.length ? new RegExp(words.map(esc).join("|"), "i") : null;
  const matchCount = re1 ? lines.filter((l) => re1.test(l)).length : 0;
  if (!ready) return null;
  if (err) return <Card className="text-sm">⚠️ {err} · <Link className="underline" href="/meetings">{"Back"}</Link></Card>;
  if (!m) return <div className="text-sm text-slate-400">{"Loading…"}</div>;
  const s: MeetingSummary = m.summary || { summary: [], decisions: [], open_questions: [], tags: [], actions: [] };
  const live: MeetingSummary = { ...s, actions: actions.map((a) => ({ party: a.party, owner: a.owner, task: a.task + (a.status === "done" ? " ✓ done" : ""), due: a.due || undefined })) };
  const text = meetingText(m, live, fmtDate);
  const List = ({ t, xs }: { t: string; xs: string[] }) => xs.length ? <div><h3 className="font-bold mb-1">{t}</h3><ul className="list-disc ps-5 space-y-0.5 text-sm" dir="ltr">{xs.map((x, i) => <li key={i}>{x}</li>)}</ul></div> : null;
  const remove = async () => { await fetch("/api/meetings/" + m.id, { method: "DELETE" }); router.push("/meetings"); };
  return (
    <div className="space-y-4" dir="ltr">
      <Link href="/meetings" className="text-sm text-brand-600 underline">← {"All meetings"}</Link>
      <H1 sub={m.participants}>{fmtDate(m.held_at)} · <span dir="ltr">{m.title}</span></H1>
      <div className="flex flex-wrap gap-1">{(m.tags || []).map((t) => <Badge key={t}>#{t}</Badge>)}<span className="text-xs text-slate-400 ms-2">{m.source}</span></div>
      <Card className="space-y-4" >
        <List t="Summary" xs={s.summary} />
        <div className="grid md:grid-cols-2 gap-4"><List t="Decisions" xs={s.decisions} /><List t="Open questions" xs={s.open_questions} /></div>
        <ExportBar title={m.title + " — " + fmtDate(m.held_at)} text={text} filename={"meeting_" + m.held_at} />
      </Card>
      <Card className="space-y-2"><h2 className="font-bold">✅ {"Tasks from this meeting"}</h2><ActionsBoard actions={actions} meetings={[m]} onToggle={onToggle} onTask={onTask} showDone linkMeeting={false} /></Card>
      <Card>
        <AiPanel title={"Follow-up email to Federica (draft)"} buttonLabel={"Draft follow-up email"} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)}
          buildPrompt={() => ({ prompt: "Write a short, warm, professional follow-up email in ENGLISH from Avshi Sapir (Sapirim) to Dr. Federica Biti and Eleonora Pravato (Silitex) after this meeting. Thank them, recap the key agreements in 3-5 bullets, list next steps for each side (Sapirim / Silitex) with dates if known, close politely. Facts only from the notes; no prices or promises not in the notes. Subject line first.", context: text })} />
      </Card>
      <Card className="space-y-2">
        <div className="flex flex-wrap items-center gap-2"><button className={btnGhost} onClick={() => setShowT(!showT)}>📜 {showT ? "Hide transcript" : "Show transcript"} ({lines.length.toLocaleString()} {"lines"})</button>
          {showT && <><input dir="ltr" className={inputCls + " max-w-xs"} placeholder={"Find in transcript…"} value={find} onChange={(e) => setFind(e.target.value)} />{re && <span className="text-xs text-slate-500">{matchCount} {"matching lines"}</span>}</>}</div>
        {showT && <div dir="ltr" className="max-h-[32rem] overflow-y-auto text-xs leading-5 bg-slate-50 border rounded-lg p-3 whitespace-pre-wrap">
          {lines.map((l, i) => {
            if (!re) return <div key={i}>{l || " "}</div>;
            const parts = l.split(re);
            return <div key={i} className={parts.length > 1 ? "bg-yellow-50" : ""}>{parts.map((p, k) => (k % 2 ? <mark key={k}>{p}</mark> : <span key={k}>{p}</span>)) }{!l && " "}</div>;
          })}
        </div>}
      </Card>
      <div className="text-end">{!del ? <button className="text-xs text-red-500 underline" onClick={() => setDel(true)}>{"Delete meeting"}</button> : <span className="text-xs">{"Delete this meeting, its transcript and tasks? "}<button className="text-red-600 font-bold underline" onClick={remove}>{"Yes, delete"}</button> · <button className="underline" onClick={() => setDel(false)}>{"Cancel"}</button></span>}</div>
    </div>
  );
}
