// grill.ts (src/prompts/grill.ts) · updated 09.10.2026 18:30 (Asia/Jerusalem) — rehearsal bot: Silitex CTO grills the presenter, then scores the answers
import { NOTES } from "@/config/notes";
import { PITCH } from "@/config/pitch";
const script = () => NOTES.map((n) => "## " + n.t + "\n" + n.say.join("\n")).join("\n\n") + "\n\nWhat we ask for:\n" + PITCH.needs.join("\n");
export function grillContext(): string { return "Presenter's script (distributor pitch to Silitex S.r.l. management):\n\n" + script(); }
export const GRILL_QUESTIONS = "You are the CTO of Silitex S.r.l., sceptical, 25 years in silicones. The presenter is NOT a chemist — a commercial distributor. Based on the script, fire exactly 5 hard questions he is likely to get on Monday: 2 technical/regulatory (REACH, D4/D5, drop-in replacement risk), 2 commercial (exclusivity, pricing, customer-of-record, why not sell direct), 1 about his credibility/team. Number them 1–5, one line each, no preamble. Write in English.";
export function grillScore(questions: string, answers: string): string {
  return "Questions you asked:\n" + questions + "\n\nPresenter's answers:\n" + answers + "\n\nScore each answer 1–10 as the Silitex CTO. For each: score, one line on what was weak, one line with a better 2-sentence answer a non-chemist can say safely (route technical depth to the Silitex lab when appropriate; never invent chemistry). End with TOTAL /50 and the single cue from the script he should re-read. English, max 350 words.";
}
