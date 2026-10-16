// meeting-types.ts (src/lib/meeting-types.ts) · updated 16.10.2026 18:00 (Asia/Jerusalem) — shared client/server types for /meetings
export type Party = "sapirim" | "silitex";
export type MeetingActionDraft = { party: Party; owner: string; task: string; due?: string };
export type MeetingSummary = { summary: string[]; decisions: string[]; open_questions: string[]; tags: string[]; actions: MeetingActionDraft[] };
export type Meeting = { id: string; held_at: string; title: string; participants: string; tags: string[]; source: string; transcript: string; summary: MeetingSummary | null; usage: unknown; created_at: string };
export type MeetingAction = { id: string; meeting_id: string; party: Party; owner: string; task: string; due: string | null; status: "open" | "done"; task_id: string | null; created_at: string; done_at: string | null };
/** plain-text version for the export bar / follow-up email */
export function meetingText(m: { title: string; held_at: string; participants: string }, s: MeetingSummary, fmt: (d: string) => string): string {
  const L = (t: string, xs: string[]) => (xs.length ? t + "\n" + xs.map((x) => "• " + x).join("\n") + "\n\n" : "");
  const act = (p: Party) => s.actions.filter((a) => a.party === p).map((a) => a.owner + " — " + a.task + (a.due ? " (by " + fmt(a.due) + ")" : ""));
  return m.title + " — " + fmt(m.held_at) + "\nParticipants: " + m.participants + "\n\n" + L("Summary", s.summary) + L("Decisions", s.decisions) + L("Open questions", s.open_questions) + L("Action items — Sapirim", act("sapirim")) + L("Action items — Silitex", act("silitex"));
}
