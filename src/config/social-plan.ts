// social-plan.ts (src/config/social-plan.ts) · updated 18.10.2026 18:50 (Asia/Jerusalem) — SOCIAL PLAN: the posting calendar for the Sapirim Facebook Page + Avshi's LinkedIn profile (same schedule). Each row opens Post Studio pre-filled. Add a row here to extend the plan.
import type { StudioKind } from "@/lib/studio/context";
export type PlanPost = { id: string; date: string; time: string; topic: string; kind: StudioKind; value: string; langs: string[]; format: "post" | "post+reel" | "reel" };
export const SOCIAL_PLAN: PlanPost[] = [
  { id: "p1", date: "2026-10-20", time: "08:00", topic: "מה השתנה ב-D4 / D5 / D6 ומה זה אומר על הפורמולציה", kind: "regulation", value: "", langs: ["he", "ru"], format: "post" },
  { id: "p2", date: "2026-10-22", time: "08:00", topic: "קצף באגני אוורור בשפכים — סיבות ופתרון", kind: "industry", value: "water", langs: ["he"], format: "post+reel" },
  { id: "p3", date: "2026-10-25", time: "08:00", topic: "עובדים עם DOWSIL 1520? יש מקבילה", kind: "code", value: "DOWSIL 1520", langs: ["he", "ru"], format: "post" },
  { id: "p4", date: "2026-10-27", time: "08:00", topic: "מרככי טקסטיל — מגע רך בלי D4/D5", kind: "industry", value: "textile", langs: ["he", "ru"], format: "post" },
  { id: "p5", date: "2026-10-29", time: "08:00", topic: "דוחה מים לבטון ואבן — מה לבדוק לפני שקונים", kind: "industry", value: "build", langs: ["he"], format: "post+reel" },
  { id: "p6", date: "2026-11-01", time: "08:00", topic: "איך בודקים נוגד קצף במעבדה ב-30 דקות", kind: "free", value: "30-minute lab test for an antifoam", langs: ["he", "ru"], format: "reel" },
];
export const PLATFORMS = [
  { key: "fb", name: "Facebook", icon: "📘", where: "Meta Business Suite → Planner → Create post → Schedule", url: "https://business.facebook.com/latest/planner" },
  { key: "li", name: "LinkedIn", icon: "💼", where: "LinkedIn → Start a post → 🕒 Schedule", url: "https://www.linkedin.com/feed/?shareActive=true" },
] as const;
