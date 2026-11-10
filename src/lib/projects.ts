// projects.ts (src/lib/projects.ts) · updated 10.11.2026 13:25 (Asia/Jerusalem) — v1.10.0 ⏰ stallInfo · created 12:30 — v1.9.8 📁 Projects
// Shared (client + server): the project number as everyone sees it, the mail-subject tag, and the plain-text A–Z summary for the export bar.
import { fmtDate } from "./format";
import { stageOf, PROJECT_STAGES, STALL_DAYS } from "@/config/projects";
import type { Project } from "./types";

/** "#SPR-0002 · 09/11/2026 · v1" — the one number the customer, Silitex and Sapirim all see */
export const refLabel = (p: Pick<Project, "id" | "opened_at" | "version">) => "#" + p.id + " · " + fmtDate(p.opened_at) + " · v" + p.version;
/** "[#SPR-0002 · v1]" — goes first in every mail subject */
export const subjectTag = (p: Pick<Project, "id" | "version">) => "[#" + p.id + " · v" + p.version + "]";
const TAG_RE = /\[?#?SPR-\d{4}(\s*·\s*v\d+)?\]?\s*/gi;
/** puts the project tag at the start of a subject (replaces an older tag / version, keeps "Re:" first) */
export function stampSubject(subject: string, p?: Pick<Project, "id" | "version"> | null): string {
  if (!p) return subject;
  const m = /^((?:(?:re|fw|fwd)\s*:\s*)*)(.*)$/i.exec(subject.trim()); const pre = m?.[1] || ""; const rest = (m?.[2] || subject).replace(TAG_RE, "").trim();
  return pre + subjectTag(p) + " " + rest;
}
/** "SPR-0002" found in a subject / text → project id */
export const refInText = (s: string) => /SPR-\d{4}/i.exec(s || "")?.[0].toUpperCase() || "";
/** WhatsApp opening line to the customer */
export const waOpening = (p: Project) => "פרויקט #" + p.id + " · v" + p.version + " — ";
export const stageText = (id: string) => { const s = stageOf(id); return s.icon + " " + s.he; };
/** plain-text project sheet (print / Outlook / Gmail / WhatsApp / save) */
export function projectText(p: Project): string {
  const docs = [["הצעת מחיר", p.quote_ref, p.quote_at], ["PO דוגמה", p.po_sample, p.po_sample_at], ["PO מוצר", p.po_product, p.po_product_at], ["חשבונית ספירים", p.invoice, p.invoice_at]]
    .map(([k, v, d]) => k + ": " + (v ? v + (d ? " · " + fmtDate(d) : "") : "—")).join("\n");
  const steps = PROJECT_STAGES.map((s) => (s.id === p.stage ? "▶ " : "· ") + s.he).join("\n");
  const team = p.team.map((m) => (m.role === "to" ? "TO " : "CC ") + m.name + " <" + m.email + ">" + (m.org ? " · " + m.org : "")).join("\n");
  const hist = p.history.map((h) => fmtDate(h.at) + " · v" + h.v + " · " + h.text).join("\n");
  return ["פרויקט " + refLabel(p), "לקוח: " + p.lead_name, "תיאור: " + p.description, p.request ? "בקשה: " + p.request : "", "שלב: " + stageText(p.stage), "", "שלבים:", steps, "", "מסמכים:", docs, "", "צוות:", team, "", "היסטוריה:", hist].filter((x) => x !== null).join("\n");
}
/** ⏰ days since the project last moved (newest history line) and whether it is over the stage limit; ⏸ hold_until (in the future) silences it */
export function stallInfo(p: Pick<Project, "stage" | "history" | "updated_at" | "opened_at" | "hold_until">, now = Date.now()): { days: number; limit: number; stalled: boolean; held: boolean } {
  const limit = STALL_DAYS[p.stage] || 0; const last = (p.history || []).reduce((m, h) => (h.at > m ? h.at : m), p.opened_at);
  const days = Math.floor((now - new Date(last).getTime()) / 864e5); const held = !!p.hold_until && new Date(p.hold_until + "T23:59:59").getTime() >= now;
  return { days, limit, held, stalled: !!limit && days >= limit && !held };
}
