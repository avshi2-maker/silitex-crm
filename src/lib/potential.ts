// potential.ts (src/lib/potential.ts) · created 22.10.2026 08:05 (Asia/Jerusalem) — POTENTIAL ANALYTICS engine: always live from every customer + its website scan + the A/B/C/D priority engine. Per customer: score, estimated tons, strong / medium Silitex matches, top grades. Aggregates per industry and per Silitex grade (demand signal). English summary for Federica WITHOUT company names. Monthly scheduling of the top targets.
import type { Lead, Task } from "@/lib/types";
import { scanOf, scanErr } from "@/lib/scan";
import { scoreLead, type Score } from "@/lib/priority";
import { gradeLabel } from "@/lib/matrix";
import { addDays, todayIso } from "@/lib/format";
export type PRow = { lead: Lead; s: Score; scanned: boolean; failed: boolean; hi: number; md: number; grades: string[]; angle: string };
export type IndAgg = { industry: string; total: number; scanned: number; matched: number; tons: number; tonsMatched: number; a: number; b: number };
export type GradeAgg = { grade: string; customers: number; strong: number; industries: string[] };
export function rowsOf(leads: Lead[], tasks: Task[]): PRow[] {
  return leads.filter((l) => !/food/i.test(l.industry) && l.stage !== "lost").map((l) => {
    const r = scanOf(l); const ms = r?.data.matches || [];
    const hi = ms.filter((m) => m.confidence === "high").length, md = ms.filter((m) => m.confidence === "medium").length;
    return { lead: l, s: scoreLead(l, tasks), scanned: !!r, failed: !!scanErr(l), hi, md, grades: Array.from(new Set(ms.filter((m) => m.confidence !== "low").map(gradeLabel))), angle: r?.data.value_angle || "" };
  }).sort((a, b) => b.s.total - a.s.total || b.hi - a.hi);
}
export const matched = (r: PRow) => r.hi + r.md > 0;
export function byIndustry(rows: PRow[]): IndAgg[] {
  const m = new Map<string, IndAgg>();
  for (const r of rows) { const k = r.lead.industry || "Other"; const g = m.get(k) || { industry: k, total: 0, scanned: 0, matched: 0, tons: 0, tonsMatched: 0, a: 0, b: 0 }; g.total++; if (r.scanned) g.scanned++; if (matched(r)) { g.matched++; g.tonsMatched += r.s.tons; } g.tons += r.s.tons; if (r.s.grade === "A") g.a++; if (r.s.grade === "B") g.b++; m.set(k, g); }
  return [...m.values()].sort((a, b) => b.tonsMatched - a.tonsMatched || b.tons - a.tons);
}
export function byGrade(rows: PRow[]): GradeAgg[] {
  const m = new Map<string, GradeAgg>();
  for (const r of rows) { const ms = scanOf(r.lead)?.data.matches || []; const seen = new Set<string>(); for (const x of ms) { if (x.confidence === "low") continue; const k = x.silitex.trim(); if (!k || seen.has(k)) continue; seen.add(k); const g = m.get(k) || { grade: k, customers: 0, strong: 0, industries: [] }; g.customers++; if (x.confidence === "high") g.strong++; if (!g.industries.includes(r.lead.industry)) g.industries.push(r.lead.industry); m.set(k, g); } }
  return [...m.values()].sort((a, b) => b.customers - a.customers || b.strong - a.strong);
}
const r1 = (n: number) => Math.round(n * 10) / 10;
/** English, counts only — no company names (Silitex distributor rule) */
export function federicaText(rows: PRow[], date: string): string {
  const sc = rows.filter((r) => r.scanned), mt = rows.filter(matched); const inds = byIndustry(rows); const gr = byGrade(rows).slice(0, 15);
  return ["Sapirim — Silitex Israel · Market potential snapshot · " + date, "",
    "Coverage: " + rows.length + " Israeli producers profiled · " + sc.length + " websites analysed by our AI scanner · " + mt.length + " with a confirmed Silitex match.",
    "Estimated silicone volume of matched producers: ~" + r1(mt.reduce((a, r) => a + r.s.tons, 0)) + " t/year (tier-based estimate where the customer volume is not yet confirmed).",
    "Priority: " + rows.filter((r) => r.s.grade === "A").length + " A-accounts (start now) · " + rows.filter((r) => r.s.grade === "B").length + " B-accounts.", "",
    "By industry (producers · scanned · matched · est. t/year matched):", ...inds.map((g) => "• " + g.industry + ": " + g.total + " · " + g.scanned + " · " + g.matched + " · ~" + r1(g.tonsMatched) + " t"), "",
    "Silitex grades most in demand (number of producers matched · strong matches):", ...gr.map((g) => "• " + g.grade + ": " + g.customers + " producers (" + g.strong + " strong) — " + g.industries.slice(0, 3).join(", ")), "",
    "How it works: every producer's website is read automatically, its product lines identified and matched to the official Silitex range and countertypes; the list updates itself after every scan. Company names are kept by Sapirim.",
  ].join("\n");
}
export function csvOf(rows: PRow[]): string {
  const esc = (s: unknown) => '"' + String(s ?? "").replace(/"/g, '""') + '"';
  return ["Rank,Customer,Industry,Tier,Grade,Score,Est t/y,Scanned,Strong,Medium,Silitex grades,Value angle", ...rows.map((r, i) => [i + 1, r.lead.name, r.lead.industry, (r.lead.tier || "").split(" - ")[0], r.s.grade, r.s.total, r1(r.s.tons), r.scanned ? "yes" : r.failed ? "failed" : "no", r.hi, r.md, r.grades.join(" · "), r.angle].map(esc).join(","))].join("\n");
}
/** working days (Sun–Thu) from tomorrow, `perDay` targets per day */
export function schedule(rows: PRow[], tasks: Task[], n: number, perDay: number): { r: PRow; due: string }[] {
  const open = new Set(tasks.filter((t) => !t.done).map((t) => t.lead_id));
  const pick = rows.filter((r) => !open.has(r.lead.id) && r.lead.stage !== "won").slice(0, n);
  const out: { r: PRow; due: string }[] = []; let d = todayIso(); let used = perDay;
  for (const r of pick) { if (used >= perDay) { do { d = addDays(d, 1); } while ([5, 6].includes(new Date(d + "T12:00:00").getDay())); used = 0; } out.push({ r, due: d }); used++; }
  return out;
}
export const taskTitle = (r: PRow) => "🎯 פנייה ממוקדת" + (r.grades[0] ? ": " + r.grades[0] : "") + (r.angle ? " — " + r.angle.slice(0, 70) : "");
