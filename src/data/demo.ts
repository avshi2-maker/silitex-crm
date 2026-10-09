// demo.ts (src/data/demo.ts) · updated 09.10.2026 12:30 (Asia/Jerusalem)
// Deterministic "living pipeline" demo state for presentations. Load via ⚙ on dashboard or ?demo=1. Never auto-loaded.
import { LEADS_SEED } from "@/lib/data";
import { addDays, todayIso } from "@/lib/format";
import type { Lead, Activity, Task, Sample, Stage } from "@/lib/types";
const STAGE_BY_PLAN: Record<string, Stage> = { "1": "contacted", "2": "sample", "3": "quote", "4": "negotiation" };
export function buildDemo(): { leads: Lead[]; activities: Activity[]; tasks: Task[]; samples: Sample[] } {
  const today = todayIso();
  const leads: Lead[] = LEADS_SEED.map((l, i) => {
    let stage: Stage = STAGE_BY_PLAN[(l.plan_stage || "1")[0]] || "prospect";
    if (i === 3) stage = "won"; if (i === 11) stage = "won"; if (i === 0) stage = "prospect"; if (i === 14) stage = "lost";
    return { ...l, stage, contact_name: CONTACTS[i % CONTACTS.length], contact_email: "procurement@" + l.name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "") + ".co.il", contact_phone: "0" + (52 + (i % 4)) + "-" + String(4000000 + i * 73129).slice(0, 7), next_action_at: addDays(today, (i % 5) + 1), notes: NOTES[i % NOTES.length] };
  });
  const activities: Activity[] = []; const tasks: Task[] = []; const samples: Sample[] = [];
  leads.forEach((l, i) => {
    const d = (n: number) => new Date(Date.now() - n * 864e5).toISOString();
    activities.push({ id: "act-" + i + "a", lead_id: l.id, at: d(18 - (i % 6)), kind: "note", text: "Intro call with " + (l.contact_name || l.contact_role) + " — need confirmed: " + l.use_case.slice(0, 60) + "…" });
    if (["sample", "quote", "negotiation", "won"].includes(l.stage)) {
      const sku = (l.recommended_sku || "").split(/[&,/]/)[0].trim() || "BERETEX 500";
      const st = l.stage === "sample" ? (i % 2 ? "in_lab" : "shipped") : "passed";
      samples.push({ id: "smp-" + i, lead_id: l.id, lead_name: l.name, sku, kg: [1, 2, 5][i % 3], sent_at: addDays(today, -(10 + (i % 7))), status: st, result: st === "passed" ? "Foam knock-down OK, meets spec" : undefined, followup_at: addDays(today, (i % 4) + 1) });
      activities.push({ id: "act-" + i + "b", lead_id: l.id, at: d(10 - (i % 5)), kind: "sample", text: "Sample shipped: " + sku + " " + [1, 2, 5][i % 3] + " kg" });
    }
    if (["quote", "negotiation", "won"].includes(l.stage)) activities.push({ id: "act-" + i + "c", lead_id: l.id, at: d(4 - (i % 3)), kind: "quote", text: "Quote sent — " + l.volume_tons + " t/yr, FCA Tel Aviv, 30 days" });
    if (l.stage === "won") activities.push({ id: "act-" + i + "d", lead_id: l.id, at: d(1), kind: "stage", text: "Annual supply agreement signed ✓" });
    if (!["won", "lost"].includes(l.stage)) tasks.push({ id: "task-" + i, lead_id: l.id, lead_name: l.name, title: l.plan_next_action || "Follow-up", due: addDays(today, i % 3 === 0 ? 0 : (i % 3)), cadence: i % 3 === 0 ? "daily" : "once", done: false, kind: "plan" });
  });
  return { leads, activities, tasks, samples };
}
const CONTACTS = ["Yossi Levi", "Dana Cohen", "Amir Ben-David", "Noa Friedman", "Eyal Shapira", "Michal Peretz", "Ronen Avraham", "Tamar Golan"];
const NOTES = ["Current supplier: Dow via local agent, 60-day lead time — pain point.", "Wants Kosher certificate before any trial.", "Lab test slot booked; needs TDS + MSDS in advance.", "Price-sensitive; compare per-kg active vs. Wacker.", "Interested in local stock (Tel Aviv) — 2-day delivery is the hook."];
