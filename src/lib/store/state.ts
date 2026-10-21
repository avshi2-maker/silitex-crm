// state.ts (src/lib/store/state.ts) · updated 21.10.2026 13:30 (Asia/Jerusalem) — contacts filled per account (new researched contacts arrive in existing browsers too) + seed patches once (21/10 packaging: Nirotek phones · car-care re-classification: Rose Chemicals, Nano-Z; notes merged, never overwritten) · 09:20 — researched contacts filled once (seed contact_name/phone/email/notes into accounts that have none, e.g. Tambour + Nirlat) · 20.10.2026 13:15 — duplicate GES (LEAD-071 = LEAD-011) removed once, also from Supabase · 08:05 — PHANTOM + BERETEX 350 / SH 1300 · 05:40 — researched addresses filled once · 05:20 — sync retries without a column the database does not have yet · 19.10.2026 12:45 — Silitex guidance fix once (cosmetic range only, maps awaiting review) · 11:45 — first account playbooks seeded once · 10:55 — LEAD-008 Sano split to household-only (one-time update in browsers) · 07:25 — PE 193 / AGRIWET added to phantom SKUs (not Silitex products) · 18.10.2026 06:30 — + offline sync queue (replayed when back online) · 12.10.2026 12:25
// Shape of mutable CRM state + persistence (localStorage always; Supabase write-through when configured).
import { LEADS_SEED } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { seedPlans } from "@/lib/playbook";
import type { Lead, Task, Activity, KbDoc, KbChunk, Sample, Doc, Shipment, SilitexContact, Thread, HubMsg } from "@/lib/types";
export type State = { leads: Lead[]; tasks: Task[]; activities: Activity[]; samples: Sample[]; docs: Doc[]; shipments: Shipment[]; contacts: SilitexContact[]; threads: Thread[]; msgs: HubMsg[]; kbDocs: KbDoc[]; kbChunks: KbChunk[]; spend: { tokens: number; cost: number }; demo?: boolean };
export const STORAGE_KEY = "silitex-crm-v1";
export const EMPTY: State = { leads: LEADS_SEED, tasks: [], activities: [], samples: [], docs: [], shipments: [], contacts: [], threads: [], msgs: [], kbDocs: [], kbChunks: [], spend: { tokens: 0, cost: 0 } };
// 12.10.2026: SKU names that never existed on silitex.it (AI-invented in plan v5) — replaced by the corrected seed
const PHANTOM = /Silitex (Surfactant|Ag-Spreaders|Silatex|Eco-Resin|Depurazione|DM |Idrorepellenti|GOTS|Lavorazione|Refinery|Velvet|MQ|Volatile|SG 90)|SG 9040|Gomma Plastica|PE 193|AGRIWET|BERETEX 350|SH 1300/;
// first account playbooks (19.10.2026): Luxembourg · Careline · Sano + Pini meeting — once per browser, deterministic ids (no duplicates across devices)
// Silitex guidance 19/10/2026: cosmetic leads use only the cosmetic range (official countertypes); Sano / Luxembourg maps marked "awaiting Silitex review" — once per browser
function fixOnce(st: State) {
  try { if (localStorage.getItem("silitex-lead-fix-v2")) return; const ids = ["LEAD-008", "LEAD-021", "LEAD-022", "LEAD-023", "LEAD-024"]; const fixed: Lead[] = [];
    st.leads = st.leads.map((l) => { const seed = LEADS_SEED.find((x) => x.id === l.id); if (!seed || !ids.includes(l.id)) return l; const n = { ...l, recommended_sku: seed.recommended_sku, plan_next_action: seed.plan_next_action }; fixed.push(n); return n; });
    saveState(st); fixed.forEach((l) => sync("leads", l)); localStorage.setItem("silitex-lead-fix-v2", "1"); } catch {}
}
// 20/10/2026 researched site addresses + GPS for the 24 starting customers — filled once per browser, only where the customer has no address yet
function addrOnce(st: State) {
  try { if (localStorage.getItem("silitex-addr-v1")) return; const fixed: Lead[] = [];
    st.leads = st.leads.map((l) => { const seed = LEADS_SEED.find((x) => x.id === l.id); if (!seed?.address || l.address) return l; const n = { ...l, address: seed.address, city: seed.city, lat: seed.lat, lon: seed.lon }; fixed.push(n); return n; });
    saveState(st); fixed.forEach((l) => sync("leads", l)); localStorage.setItem("silitex-addr-v1", "1"); } catch {}
}
const DROP = ["LEAD-071"]; // 20.10.2026 duplicate of LEAD-011 (GES), approved by Avshi
// 21.10.2026: researched contacts — filled once PER ACCOUNT into browsers that hold the account without a contact (list of filled ids kept, so later imports arrive too)
function contactOnce(st: State) {
  try { const done: string[] = JSON.parse(localStorage.getItem("silitex-contacts-ids") || "[]"); const fixed: Lead[] = [];
    st.leads = st.leads.map((l) => { const seed = LEADS_SEED.find((x) => x.id === l.id); if (!seed?.contact_name || done.includes(l.id)) return l; done.push(l.id); if (l.contact_name) return l; const n = { ...l, contact_name: seed.contact_name, contact_phone: l.contact_phone || seed.contact_phone, contact_email: l.contact_email || seed.contact_email, notes: l.notes || seed.notes }; fixed.push(n); return n; });
    if (fixed.length) { saveState(st); fixed.forEach((l) => sync("leads", l)); } localStorage.setItem("silitex-contacts-ids", JSON.stringify(done)); } catch {}
}
// 21.10.2026: research corrections to accounts the browser already holds (flag per patch, only the listed fields)
const SEED_PATCHES: { flag: string; ids: string[]; fields: (keyof Lead)[] }[] = [
  { flag: "silitex-patch-carcare-v1", ids: ["LEAD-159", "LEAD-107", "LEAD-123"], fields: ["industry", "tier", "sub_industry", "use_case", "recommended_sku", "plan_next_action", "notes"] },
  { flag: "silitex-patch-carcare-notes-v1", ids: ["LEAD-154", "LEAD-120", "LEAD-044", "LEAD-008"], fields: ["notes"] },
  { flag: "silitex-patch-packaging-notes-v1", ids: ["LEAD-105"], fields: ["notes"] },
];
function patchOnce(st: State) {
  try { for (const p of SEED_PATCHES) { if (localStorage.getItem(p.flag)) continue; const fixed: Lead[] = [];
      st.leads = st.leads.map((l) => { if (!p.ids.includes(l.id)) return l; const seed = LEADS_SEED.find((x) => x.id === l.id); if (!seed) return l; const n = { ...l } as Record<string, unknown>; for (const f of p.fields) { const v = seed[f]; if (v === undefined) continue; if (f === "notes" && typeof n.notes === "string" && n.notes) { if (!n.notes.includes(String(v))) n.notes = n.notes + "\n" + v; } else n[f] = v; } fixed.push(n as Lead); return n as Lead; });
      if (fixed.length) { saveState(st); fixed.forEach((l) => sync("leads", l)); } localStorage.setItem(p.flag, "1"); } } catch {}
}
function dropOnce(st: State) {
  try { if (localStorage.getItem("silitex-drop-v1")) return; if (st.leads.some((l) => DROP.includes(l.id))) { st.leads = st.leads.filter((l) => !DROP.includes(l.id)); st.tasks = st.tasks.filter((t) => !DROP.includes(t.lead_id)); saveState(st); } DROP.forEach((id) => remove("leads", id)); localStorage.setItem("silitex-drop-v1", "1"); } catch {}
}
function seedOnce(st: State) {
  try { if (localStorage.getItem("silitex-plans-seed-v1")) return; const add = seedPlans(st.leads).filter((t) => !st.tasks.some((x) => x.id === t.id)); st.tasks = [...add, ...st.tasks]; saveState(st); add.forEach((t) => sync("tasks", t)); localStorage.setItem("silitex-plans-seed-v1", "1"); } catch {}
}
export function loadState(): State {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const st: State = { ...EMPTY, ...JSON.parse(raw) };
      // One-time correction (10.10.2026, sales plan v3.1): Yr1 targets replace TAM in volume/value; TAM kept in tam_tons. Applied to seed accounts not yet corrected, synced to Supabase.
      const fixed: Lead[] = []; st.leads = st.leads.map((l) => { const seed = LEADS_SEED.find((x) => x.id === l.id); if (!seed) return l; let n = l; if (l.tam_tons === undefined && seed.tam_tons !== undefined) n = { ...n, volume_tons: seed.volume_tons, value_usd: seed.value_usd, tam_tons: seed.tam_tons, tier: seed.tier }; if (l.rd_focus === undefined && seed.rd_focus) n = { ...n, rd_focus: seed.rd_focus, buyer_trigger: seed.buyer_trigger, plan_phase: seed.plan_phase, plan_next_action: seed.plan_next_action, plan_stage: seed.plan_stage, department: seed.department, contact_role: seed.contact_role }; if (!l.website && seed.website) n = { ...n, website: seed.website }; if (PHANTOM.test(l.recommended_sku || "") || PHANTOM.test(l.plan_next_action || "")) n = { ...n, recommended_sku: seed.recommended_sku, plan_next_action: seed.plan_next_action }; if (l.id === "LEAD-008" && /BERETEX 750/.test(l.recommended_sku || "")) n = { ...n, name: seed.name, sub_industry: seed.sub_industry, product_match: seed.product_match, use_case: seed.use_case, recommended_sku: seed.recommended_sku, competitor_offset: seed.competitor_offset, plan_next_action: seed.plan_next_action, rd_focus: seed.rd_focus }; if ((l.id === "LEAD-021" || l.id === "LEAD-022") && l.value_usd === 12000) n = { ...n, volume_tons: seed.volume_tons, value_usd: seed.value_usd, tam_tons: seed.tam_tons }; if (n !== l) fixed.push(n); return n; });
      // seed accounts added later (e.g. AHAVA 11.10.2026) that the browser has never seen
      for (const seed of LEADS_SEED) if (!st.leads.some((l) => l.id === seed.id)) { st.leads = [...st.leads, seed]; fixed.push(seed); }
      if (fixed.length) { saveState(st); fixed.forEach((l) => sync("leads", l)); }
      seedOnce(st); fixOnce(st); addrOnce(st); dropOnce(st); contactOnce(st); patchOnce(st);
      return st;
    }
  } catch {}
  const st: State = { ...EMPTY, tasks: [] }; seedOnce(st); localStorage.setItem("silitex-lead-fix-v2", "1"); localStorage.setItem("silitex-addr-v1", "1"); localStorage.setItem("silitex-contacts-ids", JSON.stringify(LEADS_SEED.filter((x) => x.contact_name).map((x) => x.id))); SEED_PATCHES.forEach((p) => localStorage.setItem(p.flag, "1")); return st;
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
/** a column the database does not have yet (e.g. a new field before its SQL was run) → retry without it, so the rest of the row is never lost */
const missingCol = (m: string) => /could not find the '([a-z0-9_]+)' column/i.exec(m)?.[1] || /column "?([a-z0-9_]+)"? (?:of relation \S+ )?does not exist/i.exec(m)?.[1] || "";
export function sync(table: string, row: object, tries = 0) {
  const sb = supabase(); if (!sb) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) { enqueue(table, row); return; }
  sb.from(table).upsert(row).then(({ error }) => { if (error) { const col = missingCol(error.message); if (col && tries < 4 && col in row) { const r = { ...(row as Record<string, unknown>) }; delete r[col]; sync(table, r, tries + 1); return; } console.warn("supabase", table, error.message); if (isNet(error.message)) enqueue(table, row); } }, () => enqueue(table, row));
}
let flushing = false;
export async function flushQueue(): Promise<number> {
  const sb = supabase(); if (!sb || flushing || (typeof navigator !== "undefined" && !navigator.onLine)) return pendingSync();
  flushing = true; const q = readQ(); const left: QItem[] = [];
  for (const it of q) { try { const { error } = await sb.from(it.table).upsert(it.row); if (error && isNet(error.message)) left.push(it); } catch { left.push(it); } }
  writeQ(left); flushing = false; return left.length;
}
if (typeof window !== "undefined") { window.addEventListener("online", () => { flushQueue(); }); setTimeout(() => { flushQueue(); }, 3000); }
