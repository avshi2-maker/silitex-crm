// store.ts (src/lib/store.ts) · updated 09.10.2026 09:10 (Asia/Jerusalem)
// Mutable CRM state: leads / tasks / activities / knowledge base.
// Persistence: browser localStorage always; write-through to Supabase when configured (see supabase/schema.sql).
"use client";
import { useEffect, useState, useCallback } from "react";
import { LEADS_SEED } from "./data";
import { supabase } from "./supabase";
import { uid, todayIso, addDays } from "./format";
import type { Lead, Task, Activity, KbDoc, KbChunk, Stage } from "./types";

export type State = { leads: Lead[]; tasks: Task[]; activities: Activity[]; kbDocs: KbDoc[]; kbChunks: KbChunk[]; spend: { tokens: number; cost: number } };
const KEY = "silitex-crm-v1";
const EMPTY: State = { leads: LEADS_SEED, tasks: [], activities: [], kbDocs: [], kbChunks: [], spend: { tokens: 0, cost: 0 } };

function load(): State {
  if (typeof window === "undefined") return EMPTY;
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...EMPTY, ...JSON.parse(raw) }; } catch {}
  return EMPTY;
}
function save(s: State) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
function sync(table: string, row: object) {
  const sb = supabase(); if (!sb) return;
  sb.from(table).upsert(row).then(({ error }) => { if (error) console.warn("supabase", table, error.message); });
}

export const STAGES: { key: Stage; he: string }[] = [
  { key: "prospect", he: "פרוספקט" }, { key: "contacted", he: "נוצר קשר" }, { key: "sample", he: "דגימה נשלחה" },
  { key: "quote", he: "הצעת מחיר" }, { key: "negotiation", he: "משא ומתן" }, { key: "won", he: "נסגר ✓" }, { key: "lost", he: "אבוד" },
];

export function useStore() {
  const [state, setState] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  useEffect(() => { setState(load()); setReady(true); }, []);
  const update = useCallback((fn: (s: State) => State) => {
    setState((prev) => { const next = fn(prev); save(next); return next; });
  }, []);

  const upsertLead = (lead: Lead) => { update((s) => ({ ...s, leads: s.leads.some((l) => l.id === lead.id) ? s.leads.map((l) => (l.id === lead.id ? lead : l)) : [lead, ...s.leads] })); sync("leads", lead); };
  const addActivity = (lead_id: string, kind: string, text: string) => {
    const a: Activity = { id: uid("act"), lead_id, at: new Date().toISOString(), kind, text };
    update((s) => ({ ...s, activities: [a, ...s.activities] })); sync("activities", a);
  };
  const setStage = (id: string, stage: Stage) => {
    update((s) => ({ ...s, leads: s.leads.map((l) => (l.id === id ? { ...l, stage } : l)) }));
    addActivity(id, "stage", "שלב עודכן: " + (STAGES.find((x) => x.key === stage)?.he || stage));
  };
  const addTask = (t: Omit<Task, "id" | "done">) => { const task: Task = { ...t, id: uid("task"), done: false }; update((s) => ({ ...s, tasks: [task, ...s.tasks] })); sync("tasks", task); return task; };
  const toggleTask = (id: string) => update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  const addSpend = (tokens: number, cost: number) => update((s) => ({ ...s, spend: { tokens: s.spend.tokens + tokens, cost: s.spend.cost + cost } }));
  const addKbDoc = (doc: KbDoc, chunks: KbChunk[]) => { update((s) => ({ ...s, kbDocs: [doc, ...s.kbDocs], kbChunks: [...chunks, ...s.kbChunks] })); sync("kb_docs", doc); chunks.forEach((c) => sync("kb_chunks", c)); };
  const removeKbDoc = (id: string) => update((s) => ({ ...s, kbDocs: s.kbDocs.filter((d) => d.id !== id), kbChunks: s.kbChunks.filter((c) => c.doc_id !== id) }));

  // Cadence engine: every active lead gets a daily follow-up + weekly review task when missing.
  const generateSchedule = () => {
    const today = todayIso();
    update((s) => {
      const tasks = [...s.tasks];
      for (const l of s.leads) {
        if (l.stage === "won" || l.stage === "lost") continue;
        const hasDaily = tasks.some((t) => t.lead_id === l.id && t.cadence === "daily" && t.due === today);
        const hasWeekly = tasks.some((t) => t.lead_id === l.id && t.cadence === "weekly" && !t.done);
        if (!hasDaily) tasks.push({ id: uid("task"), lead_id: l.id, lead_name: l.name, title: dailyTitle(l), due: today, cadence: "daily", done: false, kind: "followup" });
        if (!hasWeekly) tasks.push({ id: uid("task"), lead_id: l.id, lead_name: l.name, title: "סקירה שבועית: סטטוס, דגימות, הצעת מחיר", due: addDays(today, 7), cadence: "weekly", done: false, kind: "review" });
      }
      return { ...s, tasks };
    });
  };
  const reset = () => { try { localStorage.removeItem(KEY); } catch {} setState(EMPTY); };
  return { state, ready, upsertLead, addActivity, setStage, addTask, toggleTask, addSpend, addKbDoc, removeKbDoc, generateSchedule, reset };
}

function dailyTitle(l: Lead): string {
  switch (l.stage) {
    case "prospect": return "פנייה ראשונה: " + l.contact_role + " (" + l.department + ")";
    case "contacted": return "מעקב אחרי פנייה — להציע דגימה";
    case "sample": return "לבדוק תוצאות דגימה אצל הלקוח";
    case "quote": return "מעקב הצעת מחיר";
    case "negotiation": return "סגירת תנאים — כמות, מחיר, אספקה";
    default: return "מעקב";
  }
}
