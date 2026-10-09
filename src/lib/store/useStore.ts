"use client";
// useStore.ts (src/lib/store/useStore.ts) · updated 09.10.2026 18:30 (Asia/Jerusalem)
// React hook exposing state + mutations. Each mutation: update local → save → sync to Supabase.
import { useEffect, useState, useCallback } from "react";
import { EMPTY, loadState, saveState, clearState, sync, type State } from "./state";
import { buildSchedule } from "./cadence";
import { stageHe } from "@/config/stages";
import { uid, todayIso, addDays } from "@/lib/format";
import type { Lead, Task, Activity, KbDoc, KbChunk, Stage, Sample, Doc } from "@/lib/types";
import { FOLLOWUP_DAYS } from "@/config/sales";
import { buildDemo } from "@/data/demo";

export function useStore() {
  const [state, setState] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  useEffect(() => { setState(loadState()); setReady(true); }, []);
  const update = useCallback((fn: (s: State) => State) => { setState((prev) => { const next = fn(prev); saveState(next); return next; }); }, []);

  const addActivity = (lead_id: string, kind: string, text: string) => {
    const a: Activity = { id: uid("act"), lead_id, at: new Date().toISOString(), kind, text };
    update((s) => ({ ...s, activities: [a, ...s.activities] })); sync("activities", a);
  };
  const upsertLead = (lead: Lead) => {
    update((s) => ({ ...s, leads: s.leads.some((l) => l.id === lead.id) ? s.leads.map((l) => (l.id === lead.id ? lead : l)) : [lead, ...s.leads] }));
    sync("leads", lead);
  };
  const setStage = (id: string, stage: Stage) => {
    update((s) => ({ ...s, leads: s.leads.map((l) => (l.id === id ? { ...l, stage } : l)) }));
    addActivity(id, "stage", "שלב עודכן: " + stageHe(stage));
  };
  const addTask = (t: Omit<Task, "id" | "done">) => { const task: Task = { ...t, id: uid("task"), done: false }; update((s) => ({ ...s, tasks: [task, ...s.tasks] })); sync("tasks", task); return task; };
  const toggleTask = (id: string) => update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  const addSpend = (tokens: number, cost: number) => update((s) => ({ ...s, spend: { tokens: s.spend.tokens + tokens, cost: s.spend.cost + cost } }));
  const addKbDoc = (doc: KbDoc, chunks: KbChunk[]) => { update((s) => ({ ...s, kbDocs: [doc, ...s.kbDocs], kbChunks: [...chunks, ...s.kbChunks] })); sync("kb_docs", doc); chunks.forEach((c) => sync("kb_chunks", c)); };
  const removeKbDoc = (id: string) => update((s) => ({ ...s, kbDocs: s.kbDocs.filter((d) => d.id !== id), kbChunks: s.kbChunks.filter((c) => c.doc_id !== id) }));
  const generateSchedule = () => update((s) => ({ ...s, tasks: [...s.tasks, ...buildSchedule(s.leads, s.tasks, todayIso())] }));
  const addSample = (sm: Omit<Sample, "id">) => { const sample: Sample = { ...sm, id: uid("smp") }; update((s) => ({ ...s, samples: [sample, ...s.samples] })); sync("samples", sample); addActivity(sm.lead_id, "sample", "Sample: " + sm.sku + " " + sm.kg + " kg"); };
  const setSampleStatus = (id: string, status: Sample["status"], result?: string) => update((s) => ({ ...s, samples: s.samples.map((x) => (x.id === id ? { ...x, status, result: result ?? x.result } : x)) }));
  const addDoc = (d: Omit<Doc, "id">) => {
    const doc: Doc = { ...d, id: uid("doc") }; update((s) => ({ ...s, docs: [doc, ...s.docs] })); sync("docs", doc);
    addActivity(d.lead_id, d.kind, (d.kind === "offer" ? "הצעת מחיר נשלחה: " : "מסמך נשלח: ") + d.title + " (" + d.via + ")");
    const days = FOLLOWUP_DAYS[d.kind] ?? 3;
    addTask({ lead_id: d.lead_id, lead_name: d.lead_name, title: (d.kind === "offer" ? "מעקב הצעת מחיר — " : "מעקב מסמך — ") + d.title, due: addDays(d.sent_at, days), cadence: "once", kind: "followup" });
    return doc;
  };
  const setDocStatus = (id: string, status: Doc["status"]) => {
    update((s) => ({ ...s, docs: s.docs.map((x) => (x.id === id ? { ...x, status } : x)) }));
    const d = state.docs.find((x) => x.id === id); if (d) { addActivity(d.lead_id, d.kind, d.title + " → " + status); sync("docs", { ...d, status }); }
  };
  const loadDemo = () => update((s) => ({ ...s, ...buildDemo(), demo: true }));
  const reset = () => { clearState(); setState(EMPTY); };

  return { state, ready, upsertLead, addActivity, setStage, addTask, toggleTask, addSpend, addKbDoc, removeKbDoc, generateSchedule, addSample, setSampleStatus, addDoc, setDocStatus, loadDemo, reset };
}
