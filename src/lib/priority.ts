// priority.ts (src/lib/priority.ts) · updated 23.10.2026 16:25 (Asia/Jerusalem) — + sealants fit 24, mining 18, metal surface 14 (sealant / construction / mining buy for themselves) · 06:10 — + flame retardants & fire safety: fit 24 (DC 1107-type powder treatment = proven big volume), speed 10 · 05:45 — plastics & rubber raised: fit 10 → 14 (20 for compounders / masterbatch / extrusion / film / foam / pipe), speed 6 → 10 (they buy for themselves) · created 20.10.2026 13:20 (Asia/Jerusalem) — PRIORITY ENGINE A/B/C/D: transparent 0–100 score per customer = volume (0–30) + Silitex fit (0–30, by industry + website-scan matches) + access/warmth (0–25: former Sapirim customer, relationship, tier, stage, contacts, open steps) + speed (0–15: buys for itself vs through a service company). Food parked → capped at D. Recomputes live as leads, scans and steps change.
import type { Lead, Task } from "@/lib/types";
import { scanOf } from "@/lib/scan";
export type Grade = "A" | "B" | "C" | "D";
export type Score = { total: number; grade: Grade; vol: number; fit: number; access: number; speed: number; tons: number; why: string[] };
const FIT: [RegExp, number][] = [[/flame|fire/i, 24], [/sealant/i, 24], [/mining|potash|phosphate/i, 18], [/metal surface/i, 14], [/cosmetic|personal care/i, 24], [/detergent|clean/i, 26], [/paint|coating|varnish|ink/i, 26], [/building|repellent|construction/i, 26], [/car care/i, 22], [/textile/i, 22], [/water treatment/i, 22], [/hygiene|tissue|nonwoven/i, 20], [/paper|packag/i, 20], [/agri|agro/i, 18], [/power|cooling/i, 16], [/adhesive|label/i, 16], [/pharma/i, 16], [/metalwork|lubric/i, 14], [/rubber|plastic/i, 10], [/oil|gas|hydrocarbon/i, 10], [/irrigation/i, 8], [/food/i, 4]];
const DEFVOL: Record<string, number> = { "Tier 1": 3, "Tier 2": 1.5, "Tier 3": 0.8, "Tier 4": 0.2 };
const STAGE_PTS: Record<string, number> = { prospect: 0, contacted: 4, sample: 8, pilot: 11, rd_approved: 13, rfq: 14, quote: 15, negotiation: 15, won: 15, lost: -20 };
export const GRADE_HE: Record<Grade, string> = { A: "A — מלא ורציני: להתחיל עכשיו", B: "B — טוב: אחרי ה-A", C: "C — לטפח: סריקה ומייל", D: "D — מעקב בלבד" };
export const tierOf = (l: Lead) => (l.tier || "").split(" - ")[0];
export function scoreLead(l: Lead, tasks: Task[] = []): Score {
  const why: string[] = []; const t = tierOf(l); const tl = (l.tier || "").toLowerCase();
  const tons = l.volume_tons || DEFVOL[t] || 0.5;
  const vol = Math.min(30, (30 * Math.log(1 + tons)) / Math.log(7)); why.push("נפח ~" + tons + " ט'/שנה" + (l.volume_tons ? "" : " (הערכה לפי Tier)"));
  let fit = (FIT.find(([re]) => re.test(l.industry)) || [null, 12])[1] as number;
  if (/rubber|plastic/i.test(l.industry)) { const proc = /masterbatch|compound|additiv|extru|film|foam|pipe|profile|sheet/i.test([l.sub_industry, l.use_case, l.name].join(" ")); fit = proc ? 20 : 14; if (proc) why.push("פלסטיק: קומפאונד / מאסטרבץ' / אקסטרוזיה — שימוש סיליקון גבוה"); } // 23.10.2026 raised (Avshi): compounders / masterbatch / extruders are real silicone users
  const r = scanOf(l);
  if (r) { const hi = (r.data.matches || []).filter((m) => m.confidence === "high").length, md = (r.data.matches || []).filter((m) => m.confidence === "medium").length; const b = Math.min(8, hi * 2 + md); if (hi + md === 0) { fit -= 6; why.push("סריקה: אין התאמת Silitex"); } else { fit += b; why.push("סריקה: " + hi + " התאמות חזקות, " + md + " בינוניות"); } }
  fit = Math.max(0, Math.min(30, fit));
  let access = /reactivation/.test(tl) ? 20 : /relationship/.test(tl) ? 18 : t === "Tier 1" ? 12 : t === "Tier 2" ? 8 : t === "Tier 3" ? 4 : 1;
  if (/reactivation/.test(tl)) why.push("לקוח ספירים לשעבר"); if (/relationship/.test(tl)) why.push("קשר אישי");
  access += STAGE_PTS[l.stage] || 0; if (l.stage !== "prospect") why.push("שלב: " + l.stage);
  if (l.contact_email || l.intake?.contact_email) access += 2;
  if (tasks.some((x) => x.lead_id === l.id && !x.done)) { access += 3; why.push("יש צעד פתוח"); }
  access = Math.max(0, Math.min(25, access));
  let speed = /cosmetic|detergent|paint|coating|building|car care|textile|hygiene|agri|rubber|plastic|flame|fire|sealant|construction|mining/i.test(l.industry) ? 10 : 6; // plastics processors buy for themselves (23.10.2026)
  if (/oil|gas|irrigation/i.test(l.industry)) { speed = 3; why.push("קונים דרך חברת שירות / חלקים"); }
  if (t === "Tier 4") speed = Math.min(speed, 3);
  let total = Math.round(vol + fit + access + speed);
  if (/food/i.test(l.industry)) { total = Math.min(total, 30); why.push("מזון — מושהה"); }
  if (l.stage === "won") total = Math.max(total, 90);
  const grade: Grade = total >= 65 ? "A" : total >= 50 ? "B" : total >= 35 ? "C" : "D";
  return { total, grade, vol: Math.round(vol), fit, access, speed, tons, why };
}
