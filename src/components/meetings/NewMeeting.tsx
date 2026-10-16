"use client";
// NewMeeting.tsx (src/components/meetings/NewMeeting.tsx) · updated 16.10.2026 18:40 · English UI (Asia/Jerusalem) — add a weekly meeting: paste / upload Teams transcript (.txt .vtt .docx) → ✨ AI summary (JSON) → review & edit action items per party → save (+ Sapirim items become CRM tasks). Token meter + export bar on the AI output.
import { useState } from "react";
import { useStore } from "@/lib/store";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import { meetingText, type MeetingAction, type MeetingActionDraft, type MeetingSummary, type Party } from "@/lib/meeting-types";
import type { Usage } from "@/lib/types";
import { readTranscriptFile, actionTask } from "./client";
type Props = { open: MeetingAction[]; onSaved: (id: string) => void; onCancel: () => void };
export default function NewMeeting({ open, onSaved, onCancel }: Props) {
  const { state, addSpend, addTask } = useStore();
  const [heldAt, setHeldAt] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("Silitex × Sapirim — weekly online");
  const [participants, setParticipants] = useState("Dr. Federica Biti, Eleonora Pravato (Silitex) · Avshi Sapir (Sapirim)");
  const [transcript, setTranscript] = useState("");
  const [busy, setBusy] = useState(""); const [err, setErr] = useState("");
  const [sum, setSum] = useState<MeetingSummary | null>(null); const [usage, setUsage] = useState<Usage | null>(null);
  const [mkTasks, setMkTasks] = useState(true);
  const file = async (f?: File | null) => { if (!f) return; setErr(""); try { setTranscript(await readTranscriptFile(f)); } catch (e) { setErr("Could not read file: " + (e instanceof Error ? e.message : "")); } };
  const summarize = async () => {
    setBusy("ai"); setErr("");
    try {
      const r = await fetch("/api/meetings/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript, open: open.filter((a) => a.status === "open").map((a) => ({ party: a.party, owner: a.owner, task: a.task })) }) });
      const j = await r.json(); if (j.usage) { setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); }
      if (!r.ok) throw new Error(j.error); setSum(j.summary);
    } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
    setBusy("");
  };
  const setAct = (i: number, patch: Partial<MeetingActionDraft> | null) => sum && setSum({ ...sum, actions: patch === null ? sum.actions.filter((_, k) => k !== i) : sum.actions.map((a, k) => (k === i ? { ...a, ...patch } : a)) });
  const setList = (key: "summary" | "decisions" | "open_questions", v: string) => sum && setSum({ ...sum, [key]: v.split("\n").map((x) => x.replace(/^[•\-]\s*/, "").trim()).filter(Boolean) });
  const save = async () => {
    if (!sum) return; setBusy("save"); setErr("");
    const task_ids: Record<number, string> = {};
    if (mkTasks) sum.actions.forEach((a, i) => { if (a.party === "sapirim") task_ids[i] = addTask(actionTask({ task: a.task, due: a.due || null }, heldAt)).id; });
    const r = await fetch("/api/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ held_at: heldAt, title, participants, tags: sum.tags, source: "Teams transcript", transcript, summary: sum, usage, task_ids }) });
    const j = await r.json(); setBusy("");
    if (!r.ok) { setErr(j.error || "error"); return; }
    onSaved(j.id);
  };
  const ta = (key: "summary" | "decisions" | "open_questions", label: string) => sum && (
    <label className="block text-xs text-slate-500">{label}<textarea dir="ltr" rows={Math.min(10, sum[key].length + 1)} className={inputCls + " mt-1 font-[inherit]"} defaultValue={sum[key].map((x) => "• " + x).join("\n")} onBlur={(e) => setList(key, e.target.value)} /></label>
  );
  return (
    <div dir="ltr" className="bg-white border-2 border-brand-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between"><h2 className="font-bold text-lg">➕ {"New meeting"}</h2><button className={btnGhost} onClick={onCancel}>✕</button></div>
      <div className="grid md:grid-cols-4 gap-2">
        <label className="text-xs text-slate-500">{"Date"}<input type="date" className={inputCls + " mt-1"} value={heldAt} onChange={(e) => setHeldAt(e.target.value)} /></label>
        <label className="text-xs text-slate-500 md:col-span-3">{"Title"}<input dir="ltr" className={inputCls + " mt-1"} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="text-xs text-slate-500 md:col-span-4">{"Participants"}<input dir="ltr" className={inputCls + " mt-1"} value={participants} onChange={(e) => setParticipants(e.target.value)} /></label>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{"Teams transcript: paste below, or upload a file"}</span>
        <input type="file" accept=".txt,.vtt,.docx" onChange={(e) => file(e.target.files?.[0])} />
        <span className="text-slate-400">{"(Teams: Recordings & transcripts → Transcript → Download .docx or .vtt)"}</span>
      </div>
      <textarea dir="ltr" rows={sum ? 4 : 10} className={inputCls + " font-mono text-xs"} placeholder="Avshi Sapir   0:03 …" value={transcript} onChange={(e) => setTranscript(e.target.value)} />
      <div className="flex flex-wrap items-center gap-2">
        <button className={btnPrimary + (!sum && transcript.length > 200 ? " ai-pulse" : "")} disabled={transcript.length < 200 || !!busy} onClick={summarize}>{busy === "ai" ? "Summarizing… (up to 1 min)" : "✨ " + (sum ? "Summarize again" : "Summarize with AI + tasks per party")}</button>
        <span className="text-xs text-slate-400">{transcript.length.toLocaleString()} {"chars"}{open.filter((a) => a.status === "open").length ? " · " + "AI also receives open tasks from previous meetings" : ""}</span>
      </div>
      <TokenMeter usage={usage} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} busy={busy === "ai"} />
      {err && <div className="text-sm text-red-600">{err}</div>}
      {sum && (
        <div className="space-y-3 border-t pt-3">
          <div className="flex flex-wrap gap-1">{sum.tags.map((t) => <Badge key={t}>#{t}</Badge>)}</div>
          {ta("summary", "Summary (one line per point — editable)")}
          <div className="grid md:grid-cols-2 gap-2">{ta("decisions", "Decisions")}{ta("open_questions", "Open questions")}</div>
          <div>
            <div className="text-xs text-slate-500 mb-1">{"Tasks per party — check, edit, remove"}</div>
            <ul className="space-y-1" dir="ltr">{sum.actions.map((a, i) => (
              <li key={i} className="flex flex-wrap md:flex-nowrap gap-1 items-center">
                <select className={inputCls + " md:w-28"} value={a.party} onChange={(e) => setAct(i, { party: e.target.value as Party })}><option value="sapirim">Sapirim</option><option value="silitex">Silitex</option></select>
                <input className={inputCls + " md:w-40"} value={a.owner} onChange={(e) => setAct(i, { owner: e.target.value })} />
                <input className={inputCls} value={a.task} onChange={(e) => setAct(i, { task: e.target.value })} />
                <input type="date" className={inputCls + " md:w-40"} value={a.due || ""} onChange={(e) => setAct(i, { due: e.target.value || undefined })} />
                <button className="text-red-500 px-2" title={"Remove"} onClick={() => setAct(i, null)}>✕</button>
              </li>))}</ul>
            <button className={btnGhost + " mt-1 text-xs"} onClick={() => setSum({ ...sum, actions: [...sum.actions, { party: "sapirim", owner: "Avshi", task: "" }] })}>+ {"Task"}</button>
          </div>
          <ExportBar title={title + " — " + fmtDate(heldAt)} text={meetingText({ title, held_at: heldAt, participants }, sum, fmtDate)} filename={"meeting_" + heldAt} />
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={mkTasks} onChange={(e) => setMkTasks(e.target.checked)} />{"Create CRM tasks for Sapirim items"}</label>
            <button className={btnPrimary} disabled={!!busy} onClick={save}>{busy === "save" ? "Saving…" : "💾 " + "Save meeting"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
