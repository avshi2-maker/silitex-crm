// roadmap.ts (src/lib/roadmap.ts) · created 20.10.2026 13:20 (Asia/Jerusalem) — 6-MONTH ROADMAP builder: ranks every open customer by the priority score, gives each a first-touch month (A first, capacity N new accounts / month), adds the typical cycle (meeting → sample → lab → pilot → first PO ≈ 3–5 months) and the fixed milestones (Pini, Friday reports, portal, Silitex approvals, son's day-job hand-over).
import type { Lead, Task } from "@/lib/types";
import { scoreLead, type Score } from "@/lib/priority";
import { isClosed } from "@/config/stages";
export type RLead = { lead: Lead; s: Score; month: number; firstPo: number };
export type RMonth = { idx: number; label: string; leads: RLead[]; tons: number; milestones: string[] };
const HE_M = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
export const MILESTONES: string[][] = [
  ["פגישת פיני (22/10) — ספקים, נפחים ומחירי שוק לכל לקוח A", "סיום סריקת כל התעשיות + מילוי פערים מ-Comet / NotebookLM", "דוח שבועי לפדריקה כל יום שישי", "פורטל ספירים באוויר (sapirim.com)"],
  ["דגימות ראשונות ללקוחות A + תוצאות מעבדה", "אישור Silitex למפות אגרו / דטרגנטים", "מעבר ל-B: פגישות ראשונות"],
  ["פיילוטים במפעל אצל A", "רשימת מחירים / תנאים מ-Silitex לכל לקוח בשלב RFQ", "הכנת תפקיד מכירות לבן — תיאור, יעדים, תגמול"],
  ["הזמנות ראשונות (PO) צפויות מ-A", "הבן מצטרף: חפיפה על לקוחות B/C", "סקירת חצי-דרך עם Silitex"],
  ["הבן מנהל את B/C באופן עצמאי, אבשי ממוקד A ואסטרטגיה", "הרחבה לתעשיות C שהבשילו"],
  ["סיכום 6 חודשים: הכנסה, צנרת, החלטה על מלאי סלקטיבי ללקוחות חוזרים", "תוכנית 6 החודשים הבאים"],
];
export function buildRoadmap(leads: Lead[], tasks: Task[], cap = 12, start = new Date()): { months: RMonth[]; ranked: RLead[]; watch: RLead[] } {
  const ranked = leads.filter((l) => !isClosed(l.stage)).map((lead) => ({ lead, s: scoreLead(lead, tasks), month: -1, firstPo: -1 })).sort((a, b) => b.s.total - a.s.total);
  const plan = ranked.filter((r) => r.s.grade !== "D"); const watch = ranked.filter((r) => r.s.grade === "D");
  plan.forEach((r, i) => { const already = r.lead.stage !== "prospect"; r.month = already ? 0 : Math.min(5, Math.floor(i / cap)); const cycle = r.s.grade === "A" ? 3 : r.s.grade === "B" ? 4 : 5; r.firstPo = r.month + cycle <= 5 ? r.month + cycle : -1; });
  const m0 = start.getMonth() + 1; const y0 = start.getFullYear();
  const months: RMonth[] = Array.from({ length: 6 }, (_, idx) => { const m = (m0 + idx) % 12; const y = y0 + Math.floor((m0 + idx) / 12); return { idx, label: HE_M[m] + " " + y, leads: plan.filter((r) => r.month === idx), tons: plan.filter((r) => r.firstPo === idx).reduce((a, r) => a + r.s.tons, 0), milestones: MILESTONES[idx] }; });
  return { months, ranked, watch };
}
export function roadmapText(rm: ReturnType<typeof buildRoadmap>): string {
  return rm.months.map((m) => "■ " + m.label + "\nאבני דרך: " + m.milestones.join(" · ") + "\nלקוחות חדשים (" + m.leads.length + "): " + m.leads.map((r) => r.lead.name + " [" + r.s.grade + " " + r.s.total + "]").join(", ") + (m.tons ? "\nהזמנות ראשונות צפויות: ~" + m.tons.toFixed(1) + " ט'/שנה פוטנציאל" : "")).join("\n\n") + "\n\nמעקב בלבד (D): " + rm.watch.length + " לקוחות";
}
