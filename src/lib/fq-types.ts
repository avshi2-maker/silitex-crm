// fq-types.ts (src/lib/fq-types.ts) · created 21.10.2026 16:40 (Asia/Jerusalem) — FRIDAY REPORT TO FEDERICA: open-questions register types (client-safe) + weekly-report builder. One register, every issue Silitex must answer (and our own open items), with status, priority, who answers, first-asked date and how many Fridays it was asked — nothing gets lost between weekly reports.
export type FqStatus = "new" | "asked" | "answered" | "closed";
export type FqPrio = "blocker" | "important" | "nice";
export type FqParty = "silitex" | "sapirim";
export type Fq = { id: string; q: string; cat: string; who: string; prio: FqPrio; party: FqParty; status: FqStatus; asked: string[]; answer: string; answered_at: string | null; leads: string[]; note: string; created_at: string; due: string | null };
export const CATS = ["Regulatory & certificates", "Products & grades", "Samples & lab", "Commercial & prices", "Pharma", "Portal, IT & web", "Marketing", "Our side (Sapirim)"];
export const WHO = ["Federica", "Eleonora", "Silitex lab", "Silitex IT", "Silitex owners", "Avshi"];
export const PRIO: Record<FqPrio, { icon: string; en: string; he: string; rank: number }> = { blocker: { icon: "🔴", en: "Blocker", he: "חוסם", rank: 0 }, important: { icon: "🟠", en: "Important", he: "חשוב", rank: 1 }, nice: { icon: "🟢", en: "When possible", he: "כשאפשר", rank: 2 } };
export const STATUS_HE: Record<FqStatus, string> = { new: "חדש — עוד לא נשאל", asked: "נשאל — ממתין לתשובה", answered: "נענה", closed: "סגור" };
export const isOpen = (f: Fq) => f.status === "new" || f.status === "asked";
export const daysOpen = (f: Fq) => Math.max(0, Math.floor((Date.now() - new Date(f.created_at).getTime()) / 864e5));
const ddmm = (iso: string) => { const d = new Date(iso); return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear(); };
export const nextFriday = (from = new Date()) => { const d = new Date(from); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); return d; };
export const fmtD = ddmm;
export type Week = { since: string; leadsNew: { industry: string; n: number }[]; leadsTotal: number; scans: number; samples: number; docs: number; contacts: number; acts: number; highlights: string; next: string };
/** plain-text weekly e-mail (English, low-tech: Outlook / Word friendly) */
export function buildReport(issues: Fq[], w: Week, today = new Date()): string {
  const open = issues.filter((f) => f.party === "silitex" && isOpen(f)).sort((a, b) => PRIO[a.prio].rank - PRIO[b.prio].rank || a.created_at.localeCompare(b.created_at));
  const weekAgo = Date.now() - 7 * 864e5;
  const answered = issues.filter((f) => f.answered_at && new Date(f.answered_at).getTime() >= weekAgo);
  const ours = issues.filter((f) => f.party === "sapirim" && isOpen(f));
  const L: string[] = [];
  L.push("Sapirim → Silitex · Weekly report · Friday " + ddmm(today.toISOString()), "", "Dear Federica, dear Eleonora,", "", "Here is this week's short update from Israel and the open points where I need your help.", "");
  L.push("1. THIS WEEK IN ISRAEL");
  const newN = w.leadsNew.reduce((s, x) => s + x.n, 0);
  L.push("• New potential customers researched and added: " + newN + (w.leadsNew.length ? " (" + w.leadsNew.map((x) => x.industry + " " + x.n).join(", ") + ")" : "") + " — " + w.leadsTotal + " accounts in the market map in total.");
  const kpi = ([["website scans with Silitex product matching", w.scans], ["technical contacts found", w.contacts], ["samples", w.samples], ["offers / documents", w.docs], ["customer actions logged", w.acts]] as [string, number][]).filter(([, n]) => n > 0).map(([t, n]) => n + " " + t);
  if (kpi.length) L.push("• " + kpi.join(" · ") + ".");
  if (w.highlights.trim()) w.highlights.trim().split("\n").filter(Boolean).forEach((h) => L.push("• " + h.replace(/^[•\-\s]+/, "")));
  L.push("");
  L.push("2. OPEN QUESTIONS FOR SILITEX (" + open.length + ")");
  if (!open.length) L.push("• None this week — thank you!");
  (["blocker", "important", "nice"] as FqPrio[]).forEach((p) => {
    const rows = open.filter((f) => f.prio === p); if (!rows.length) return;
    L.push("", PRIO[p].icon + " " + PRIO[p].en + ":");
    rows.forEach((f, i) => L.push("  " + (i + 1) + ". [" + f.cat + " · " + f.who + "] " + f.q + (f.asked.length ? "  (first asked " + ddmm(f.asked[0]) + (f.asked.length > 1 ? ", " + f.asked.length + "× so far" : "") + ")" : "  (new)")));
  });
  L.push("");
  if (answered.length) { L.push("3. ANSWERED THIS WEEK — THANK YOU"); answered.forEach((f) => L.push("• " + f.q + (f.answer ? " → " + f.answer : ""))); L.push(""); }
  if (ours.length) { L.push((answered.length ? "4" : "3") + ". OPEN ON OUR SIDE (SAPIRIM)"); ours.forEach((f) => L.push("• " + f.q + (f.due ? " — target " + ddmm(f.due) : ""))); L.push(""); }
  if (w.next.trim()) { L.push("NEXT WEEK"); w.next.trim().split("\n").filter(Boolean).forEach((h) => L.push("• " + h.replace(/^[•\-\s]+/, ""))); L.push(""); }
  L.push("Warm regards,", "Avshi Sapir", "Sapirim · Israel", "+972 50-523-1042 · avshi@sapirim.com · www.sapirim.com");
  return L.join("\n");
}
