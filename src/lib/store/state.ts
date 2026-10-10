// state.ts (src/lib/store/state.ts) · updated 10.10.2026 05:50 (Asia/Jerusalem)
// Shape of mutable CRM state + persistence (localStorage always; Supabase write-through when configured).
import { LEADS_SEED } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type { Lead, Task, Activity, KbDoc, KbChunk, Sample, Doc, Shipment, SilitexContact, Thread, HubMsg } from "@/lib/types";
export type State = { leads: Lead[]; tasks: Task[]; activities: Activity[]; samples: Sample[]; docs: Doc[]; shipments: Shipment[]; contacts: SilitexContact[]; threads: Thread[]; msgs: HubMsg[]; kbDocs: KbDoc[]; kbChunks: KbChunk[]; spend: { tokens: number; cost: number }; demo?: boolean };
export const STORAGE_KEY = "silitex-crm-v1";
export const EMPTY: State = { leads: LEADS_SEED, tasks: [], activities: [], samples: [], docs: [], shipments: [], contacts: [], threads: [], msgs: [], kbDocs: [], kbChunks: [], spend: { tokens: 0, cost: 0 } };
export function loadState(): State {
  if (typeof window === "undefined") return EMPTY;
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return { ...EMPTY, ...JSON.parse(raw) }; } catch {}
  return EMPTY;
}
export function saveState(s: State) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }
export function clearState() { try { localStorage.removeItem(STORAGE_KEY); } catch {} }
export function remove(table: string, id: string) {
  const sb = supabase(); if (!sb) return;
  sb.from(table).delete().eq("id", id).then(({ error }) => { if (error) console.warn("supabase delete", table, error.message); });
}
export function sync(table: string, row: object) {
  const sb = supabase(); if (!sb) return;
  sb.from(table).upsert(row).then(({ error }) => { if (error) console.warn("supabase", table, error.message); });
}
