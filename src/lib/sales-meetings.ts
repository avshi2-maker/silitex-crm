// sales-meetings.ts (src/lib/sales-meetings.ts) · created 27.10.2026 04:50 (Asia/Jerusalem) — v1.0.0 — server only
// Store for 🤝 sales meetings & calls (Supabase table sales_meetings, service role; supabase/sales_meetings.sql).
import { serviceClient } from "./server-data";
import type { SalesMeeting } from "./sales-meeting-types";
export const NO_DB = "Supabase service key missing or table sales_meetings not created (supabase/sales_meetings.sql)";
export async function listSalesMeetings(): Promise<SalesMeeting[] | null> {
  const sb = serviceClient(); if (!sb) return null;
  const r = await sb.from("sales_meetings").select("*").order("held_at", { ascending: false }).order("created_at", { ascending: false }).limit(300);
  return r.error ? null : (r.data as SalesMeeting[]);
}
export async function createSalesMeeting(m: Omit<SalesMeeting, "id" | "created_at">): Promise<{ id: string } | { error: string }> {
  const sb = serviceClient(); if (!sb) return { error: NO_DB };
  const id = "sm-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const r = await sb.from("sales_meetings").insert({ id, ...m }); return r.error ? { error: r.error.message } : { id };
}
