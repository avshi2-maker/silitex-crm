// sales-meeting-types.ts (src/lib/sales-meeting-types.ts) · created 27.10.2026 04:50 (Asia/Jerusalem) — v1.0.0
// 🤝 Sales meetings & calls (Pini / customers): shared types for page, API and AI prompt.
import type { Usage } from "./types";
export const SM_KINDS = [{ k: "physical", he: "פגישה פיזית", icon: "🤝" }, { k: "phone", he: "שיחת טלפון", icon: "📞" }, { k: "teams", he: "Teams / וידאו", icon: "💻" }, { k: "whatsapp", he: "WhatsApp", icon: "💬" }] as const;
export type SmCustomer = { name: string; lead_id?: string; decision: string; next_step: string; pini?: "yes" | "no" | ""; tds?: "yes" | "no" | ""; sample?: "yes" | "no" | "" };
export type SmTask = { title: string; lead_id?: string; lead_name?: string; due: string };
export type SmSummary = { title: string; summary: string; points: string[]; customers: SmCustomer[]; tasks: SmTask[]; open_questions: string[]; unreadable: string[] };
export type SalesMeeting = { id: string; held_at: string; kind: string; with_who: string; title: string; notes: string; photo_count: number; summary: SmSummary; applied: { activities?: number; tasks?: number; ticks?: number }; usage?: Usage | null; created_at: string };
