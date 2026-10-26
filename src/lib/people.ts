// people.ts (src/lib/people.ts) · created 26.10.2026 06:50 (Asia/Jerusalem) — v0.96.0
// 👥 Many people per customer company (owner, R&D, purchasing, plant manager …). Stored inside the lead's intake as JSON (key PEOPLE),
// so it syncs with the lead and the Outlook mail matcher already sees every e-mail in it (hub-match reads all intake values).
import type { Lead } from "./types";
export type Person = { id: string; name: string; role?: string; mobile?: string; email?: string; notes?: string };
export const PEOPLE_KEY = "PEOPLE";
export function peopleOf(l?: Lead | null): Person[] {
  try { const v = JSON.parse(l?.intake?.[PEOPLE_KEY] || "[]"); return Array.isArray(v) ? v.filter((p) => p && p.name) : []; } catch { return []; }
}
export function withPeople(l: Lead, list: Person[]): Lead {
  return { ...l, intake: { ...(l.intake || {}), [PEOPLE_KEY]: JSON.stringify(list) } as Lead["intake"] };
}
/** main contact (the lead's own fields) + every extra person — for matching WhatsApp / mail and for pick-lists */
export function allPeople(l: Lead): Person[] {
  const main: Person[] = l.contact_name || l.contact_phone || l.contact_email ? [{ id: "main", name: l.contact_name || l.name, role: l.contact_role, mobile: l.contact_phone, email: l.contact_email }] : [];
  return [...main, ...peopleOf(l)];
}
