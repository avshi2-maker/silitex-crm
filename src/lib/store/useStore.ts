"use client";
// useStore.ts (src/lib/store/useStore.ts) · updated 09.10.2026 09:40 (Asia/Jerusalem)
// React hook exposing state + mutations. Each mutation: update local → save → sync to Supabase.
import { useEffect, useState, useCallback } from "react";
import { EMPTY, loadState, saveState, clearState, sync, type State } from "./state";
import { buildSchedule } from "./cadence";
import { stageHe } from "@/config/stages";
import { uid, todayIso } from "@/lib/format";
import type { Lead, Task, Activity, KbDoc, KbChunk, Stage } from "@/lib/types";

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
  const reset = () => { clearState(); setState(EMPTY); };

  return { state, ready, upsertLead, addActivity, setStage, addTask, toggleTask, addSpend, addKbDoc, removeKbDoc, generateSchedule, reset };
}
