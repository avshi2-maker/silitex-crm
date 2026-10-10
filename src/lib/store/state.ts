// state.ts (src/lib/store/state.ts) · updated 10.10.2026 07:45 (Asia/Jerusalem)
// Shape of mutable CRM state + persistence (localStorage always; Supabase write-through when configured).
import { LEADS_SEED } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type { Lead, Task, Activity, KbDoc, KbChunk, Sample, Doc, Shipment, SilitexContact, Thread, HubMsg } from "@/lib/types";
export type State = { leads: Lead[]; tasks: Task[]; activities: Activity[]; samples: Sample[]; docs: Doc[]; shipments: Shipment[]; contacts: SilitexContact[]; threads: Thread[]; msgs: HubMsg[]; kbDocs: KbDoc[]; kbChunks: KbChunk[]; spend: { tokens: number; cost: number }; demo?: boolean };
export const STORAGE_KEY = "silitex-crm-v1";
export const EMPTY: State = { leads: LEADS_SEED, tasks: [], activities: [], samples: [], docs: [], shipments: [], contacts: [], threads: [], msgs: [], kbDocs: [], kbChunks: [], spend: { tokens: 0, cost: 0 } };
export function loadState(): State {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const st: State = { ...EMPTY, ...JSON.parse(raw) };
      // One-time correction (10.10.2026, sales plan v3.1): Yr1 targets replace TAM in volume/value; TAM kept in tam_tons. Applied to seed accounts not yet corrected, synced to Supabase.
      const fixed: Lead[] = []; st.leads = st.leads.map((l) => { const seed = LEADS_SEED.find((x) => x.id === l.id); if (!seed || l.tam_tons !== undefined || seed.tam_tons === undefined) return l; const n = { ...l, volume_tons: seed.volume_tons, value_usd: seed.value_usd, tam_tons: seed.tam_tons, tier: seed.tier, plan_phase: seed.plan_phase, plan_next_action: seed.plan_next_action }; fixed.push(n); return n; });
      if (fixed.length) { saveState(st); fixed.forEach((l) => sync("leads", l)); }
      return st;
    }
  } catch {}
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
