// state.ts (src/lib/store/state.ts) · updated 19.10.2026 07:25 (Asia/Jerusalem) — PE 193 / AGRIWET added to phantom SKUs (not Silitex products) · 18.10.2026 06:30 — + offline sync queue (replayed when back online) · 12.10.2026 12:25
// Shape of mutable CRM state + persistence (localStorage always; Supabase write-through when configured).
import { LEADS_SEED } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type { Lead, Task, Activity, KbDoc, KbChunk, Sample, Doc, Shipment, SilitexContact, Thread, HubMsg } from "@/lib/types";
export type State = { leads: Lead[]; tasks: Task[]; activities: Activity[]; samples: Sample[]; docs: Doc[]; shipments: Shipment[]; contacts: SilitexContact[]; threads: Thread[]; msgs: HubMsg[]; kbDocs: KbDoc[]; kbChunks: KbChunk[]; spend: { tokens: number; cost: number }; demo?: boolean };
export const STORAGE_KEY = "silitex-crm-v1";
export const EMPTY: State = { leads: LEADS_SEED, tasks: [], activities: [], samples: [], docs: [], shipments: [], contacts: [], threads: [], msgs: [], kbDocs: [], kbChunks: [], spend: { tokens: 0, cost: 0 } };
// 12.10.2026: SKU names that never existed on silitex.it (AI-invented in plan v5) — replaced by the corrected seed
const PHANTOM = /Silitex (Surfactant|Ag-Spreaders|Silatex|Eco-Resin|Depurazione|DM |Idrorepellenti|GOTS|Lavorazione|Refinery|Velvet|MQ|Volatile|SG 90)|SG 9040|Gomma Plastica|PE 193|AGRIWET/;
export function loadState(): State {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const st: State = { ...EMPTY, ...JSON.parse(raw) };
      // One-time correction (10.10.2026, sales plan v3.1): Yr1 targets replace TAM in volume/value; TAM kept in tam_tons. Applied to seed accounts not yet corrected, synced to Supabase.
      const fixed: Lead[] = []; st.leads = st.leads.map((l) => { const seed = LEADS_SEED.find((x) => x.id === l.id); if (!seed) return l; let n = l; if (l.tam_tons === undefined && seed.tam_tons !== undefined) n = { ...n, volume_tons: seed.volume_tons, value_usd: seed.value_usd, tam_tons: seed.tam_tons, tier: seed.tier }; if (l.rd_focus === undefined && seed.rd_focus) n = { ...n, rd_focus: seed.rd_focus, buyer_trigger: seed.buyer_trigger, plan_phase: seed.plan_phase, plan_next_action: seed.plan_next_action, plan_stage: seed.plan_stage, department: seed.department, contact_role: seed.contact_role }; if (!l.website && seed.website) n = { ...n, website: seed.website }; if (PHANTOM.test(l.recommended_sku || "") || PHANTOM.test(l.plan_next_action || "")) n = { ...n, recommended_sku: seed.recommended_sku, plan_next_action: seed.plan_next_action }; if ((l.id === "LEAD-021" || l.id === "LEAD-022") && l.value_usd === 12000) n = { ...n, volume_tons: seed.volume_tons, value_usd: seed.value_usd, tam_tons: seed.tam_tons }; if (n !== l) fixed.push(n); return n; });
      // seed accounts added later (e.g. AHAVA 11.10.2026) that the browser has never seen
      for (const seed of LEADS_SEED) if (!st.leads.some((l) => l.id === seed.id)) { st.leads = [...st.leads, seed]; fixed.push(seed); }
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
// Offline queue (17.10.2026): a write that fails for network reasons (show floor, plane, no signal) is kept in localStorage and replayed when the device is back online.
const QUEUE_KEY = "silitex-sync-queue";
type QItem = { table: string; row: { id?: string } };
const readQ = (): QItem[] => { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); } catch { return []; } };
const writeQ = (q: QItem[]) => { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch {} };
const enqueue = (table: string, row: object) => { const q = readQ().filter((x) => !(x.table === table && x.row.id && x.row.id === (row as { id?: string }).id)); q.push({ table, row }); writeQ(q); };
export const pendingSync = () => readQ().length;
const isNet = (m: string) => /fetch|network|load failed|timeout|offline/i.test(m);
export function sync(table: string, row: object) {
  const sb = supabase(); if (!sb) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) { enqueue(table, row); return; }
  sb.from(table).upsert(row).then(({ error }) => { if (error) { console.warn("supabase", table, error.message); if (isNet(error.message)) enqueue(table, row); } }, () => enqueue(table, row));
}
let flushing = false;
export async function flushQueue(): Promise<number> {
  const sb = supabase(); if (!sb || flushing || (typeof navigator !== "undefined" && !navigator.onLine)) return pendingSync();
  flushing = true; const q = readQ(); const left: QItem[] = [];
  for (const it of q) { try { const { error } = await sb.from(it.table).upsert(it.row); if (error && isNet(error.message)) left.push(it); } catch { left.push(it); } }
  writeQ(left); flushing = false; return left.length;
}
if (typeof window !== "undefined") { window.addEventListener("online", () => { flushQueue(); }); setTimeout(() => { flushQueue(); }, 3000); }
