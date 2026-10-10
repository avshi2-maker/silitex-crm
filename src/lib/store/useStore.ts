"use client";
// useStore.ts (src/lib/store/useStore.ts) · updated 10.10.2026 05:50 (Asia/Jerusalem)
// React hook exposing state + mutations. Each mutation: update local → save → sync to Supabase.
import { useEffect, useState, useCallback } from "react";
import { EMPTY, loadState, saveState, clearState, sync, remove, type State } from "./state";
import { buildSchedule } from "./cadence";
import { stageHe } from "@/config/stages";
import { uid, todayIso, addDays } from "@/lib/format";
import type { Lead, Task, Activity, KbDoc, KbChunk, Stage, Sample, Doc, Shipment, SilitexContact, Thread, HubMsg } from "@/lib/types";
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
  const upsertLead = (raw: Lead) => {
    const now = new Date().toISOString(); const lead: Lead = { ...raw, created_at: raw.created_at || now, updated_at: now };
    update((s) => ({ ...s, leads: s.leads.some((l) => l.id === lead.id) ? s.leads.map((l) => (l.id === lead.id ? lead : l)) : [lead, ...s.leads] }));
    sync("leads", lead);
  };
  const removeLead = (id: string) => {
    update((s) => ({ ...s, leads: s.leads.filter((l) => l.id !== id), tasks: s.tasks.filter((t) => t.lead_id !== id), activities: s.activities.filter((a) => a.lead_id !== id), samples: s.samples.filter((x) => x.lead_id !== id), docs: s.docs.filter((d) => d.lead_id !== id) }));
    ["tasks", "activities", "samples", "docs"].forEach((t) => state[t as "tasks"].filter((r) => r.lead_id === id).forEach((r) => remove(t, r.id))); remove("leads", id);
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
  const addShipment = (sh: Omit<Shipment, "id">) => { const s: Shipment = { ...sh, id: uid("shp") }; update((st) => ({ ...st, shipments: [s, ...st.shipments] })); sync("shipments", s); if (s.lead_id) addActivity(s.lead_id, "shipment", "משלוח " + s.ref + " — בקשת נתונים נשלחה ל-Silitex"); return s; };
  const updateShipment = (id: string, patch: Partial<Shipment>) => { update((st) => ({ ...st, shipments: st.shipments.map((x) => (x.id === id ? { ...x, ...patch } : x)) })); const cur = state.shipments.find((x) => x.id === id); if (cur) sync("shipments", { ...cur, ...patch }); };
  const removeShipment = (id: string) => { update((st) => ({ ...st, shipments: st.shipments.filter((x) => x.id !== id) })); remove("shipments", id); };
  const upsertContact = (c: SilitexContact) => { update((st) => ({ ...st, contacts: st.contacts.some((x) => x.id === c.id) ? st.contacts.map((x) => (x.id === c.id ? c : x)) : [...st.contacts, c] })); sync("silitex_contacts", c); };
  const removeContact = (id: string) => { update((st) => ({ ...st, contacts: st.contacts.filter((x) => x.id !== id) })); remove("silitex_contacts", id); };
  const addThread = (t: Omit<Thread, "id"> & { id?: string }) => { const th: Thread = { ...t, id: t.id || uid("thr") }; update((st) => ({ ...st, threads: [th, ...st.threads] })); sync("threads", th); if (th.refs.lead_id) addActivity(th.refs.lead_id, "hub", "התכתבות Silitex: " + th.subject); return th; };
  const updateThread = (id: string, patch: Partial<Thread>) => { update((st) => ({ ...st, threads: st.threads.map((x) => (x.id === id ? { ...x, ...patch } : x)) })); const cur = state.threads.find((x) => x.id === id); if (cur) sync("threads", { ...cur, ...patch }); };
  const removeThread = (id: string) => { update((st) => ({ ...st, threads: st.threads.filter((x) => x.id !== id), msgs: st.msgs.filter((m) => m.thread_id !== id) })); state.msgs.filter((m) => m.thread_id === id).forEach((m) => remove("hub_messages", m.id)); remove("threads", id); };
  const addMsg = (m: Omit<HubMsg, "id"> & { id?: string }) => { const msg: HubMsg = { ...m, id: m.id || uid("msg") }; update((st) => ({ ...st, msgs: [...st.msgs, msg], threads: st.threads.map((t) => (t.id === m.thread_id ? { ...t, last_at: m.at, status: t.status === "closed" ? "open" : m.direction === "in" ? "waiting_us" : "waiting_silitex" } : t)) })); sync("hub_messages", msg); return msg; };
  const loadDemo = () => update((s) => ({ ...s, ...buildDemo(), demo: true }));
  const reset = () => { clearState(); setState(EMPTY); };

  return { state, ready, upsertLead, removeLead, addActivity, setStage, addTask, toggleTask, addSpend, addKbDoc, removeKbDoc, generateSchedule, addSample, setSampleStatus, addDoc, setDocStatus, addShipment, updateShipment, removeShipment, upsertContact, removeContact, addThread, updateThread, removeThread, addMsg, loadDemo, reset };
}
