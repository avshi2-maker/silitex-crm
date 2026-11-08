// insight-types.ts (src/lib/insight-types.ts) · created 08.11.2026 16:20 (Asia/Jerusalem) — v1.8.0
// 🕵️ Customer insight report — types, labels and the attention score (client-safe: no server imports).
import type { Usage } from "./types";
export type Insight = {
  status: string; temperature: "hot" | "warm" | "cold" | "stalled"; waiting_on: "customer" | "us" | "silitex" | "none";
  last_contact?: { date: string; by: "customer" | "us" | "silitex" }; open_requests: string[]; promises: { text: string; done: boolean }[];
  risks: { level: "high" | "medium" | "low"; text: string }[]; potential: string; next_action: { text: string; due_days: number; who: "me" | "silitex" | "customer" };
};
export type InsightRow = { id: string; lead_id: string; created_at: string; report: Insight; usage?: Usage | null; source?: string };
/** higher = needs Avshi's attention first */
export function attention(r: Insight): number {
  return r.risks.reduce((s, x) => s + (x.level === "high" ? 3 : x.level === "medium" ? 1 : 0), 0) + (r.waiting_on === "us" ? 3 : 0) + (r.temperature === "hot" ? 2 : r.temperature === "stalled" ? 2 : 0) + r.promises.filter((p) => !p.done).length;
}

export const TEMP: Record<Insight["temperature"], { he: string; tone: string; icon: string }> = { hot: { he: "חם", tone: "red", icon: "🔥" }, warm: { he: "פושר", tone: "amber", icon: "🌤️" }, cold: { he: "קר", tone: "blue", icon: "❄️" }, stalled: { he: "תקוע", tone: "slate", icon: "⏸️" } };
export const WAIT: Record<Insight["waiting_on"], string> = { customer: "ממתינים ללקוח", us: "הכדור אצלך", silitex: "ממתינים ל-Silitex", none: "אין המתנה" };
export const WHO: Record<Insight["next_action"]["who"], string> = { me: "אתה", silitex: "Silitex", customer: "הלקוח" };
export const RISK: Record<string, string> = { high: "🔴", medium: "🟠", low: "🟡" };
/** report → plain text (export bar / WhatsApp) */
export function insightText(name: string, r: Insight, at: string): string {
  return ["🕵️ " + name + " — " + at, TEMP[r.temperature].icon + " " + TEMP[r.temperature].he + " · " + WAIT[r.waiting_on], r.status, "",
    r.open_requests.length ? "בקשות פתוחות:\n" + r.open_requests.map((x) => "• " + x).join("\n") : "", r.promises.length ? "התחייבויות:\n" + r.promises.map((p) => (p.done ? "✓ " : "✗ ") + p.text).join("\n") : "",
    r.risks.length ? "סיכונים:\n" + r.risks.map((x) => RISK[x.level] + " " + x.text).join("\n") : "", "פוטנציאל: " + r.potential, "צעד הבא (" + WHO[r.next_action.who] + ", תוך " + r.next_action.due_days + " ימים): " + r.next_action.text].filter(Boolean).join("\n");
}
