// meeting.ts (src/prompts/meeting.ts) · updated 16.10.2026 18:00 (Asia/Jerusalem) — AI summary of a Sapirim ↔ Silitex meeting transcript → strict JSON (summary, decisions, open questions, tags, action items per party)
import type { MeetingSummary, Party } from "@/lib/meeting-types";
export const MEETING_PROMPT = `You summarise a business meeting between Sapirim (Avshi Sapir, Israeli distributor) and Silitex S.r.l. (Italian silicone manufacturer). The transcript is auto-generated (Teams): names and words may be misspelled; correct obvious product names only when certain, otherwise keep them as said.
Return ONLY valid JSON, no prose, no markdown fences, with exactly these keys:
{"summary": [8-14 short factual bullets, most important first],
 "decisions": [what was agreed or ruled out],
 "open_questions": [questions still unanswered, who must answer],
 "tags": [5-10 lowercase one-word or hyphenated topic tags],
 "actions": [{"party": "sapirim" | "silitex", "owner": "person name or team", "task": "one concrete action", "due": "YYYY-MM-DD or empty"}]}
Rules: facts only from the transcript — never invent products, prices, dates or commitments. "party" is "sapirim" for Avshi / Sapirim tasks and "silitex" for Federica, Eleonora, IT, owners, lab. Use a due date only if one was said. English.`;
export function previousContext(open: { party: Party; owner: string; task: string }[]): string {
  return open.length ? "Open action items from previous meetings (mention in summary if discussed):\n" + open.map((o) => "- [" + o.party + "] " + o.owner + ": " + o.task).join("\n") + "\n\n" : "";
}
/** tolerant JSON extraction + normalisation */
export function parseSummary(text: string): MeetingSummary | null {
  const s = text.indexOf("{"), e = text.lastIndexOf("}"); if (s < 0 || e <= s) return null;
  try {
    const j = JSON.parse(text.slice(s, e + 1));
    const arr = (x: unknown) => (Array.isArray(x) ? x.map(String).filter(Boolean) : []);
    const actions = (Array.isArray(j.actions) ? j.actions : []).map((a: Record<string, unknown>) => ({ party: (String(a.party).toLowerCase().startsWith("sil") ? "silitex" : "sapirim") as Party, owner: String(a.owner || ""), task: String(a.task || ""), due: /^\d{4}-\d{2}-\d{2}$/.test(String(a.due || "")) ? String(a.due) : undefined })).filter((a: { task: string }) => a.task);
    return { summary: arr(j.summary), decisions: arr(j.decisions), open_questions: arr(j.open_questions), tags: arr(j.tags).map((t) => t.toLowerCase().replace(/^#/, "")), actions };
  } catch { return null; }
}
