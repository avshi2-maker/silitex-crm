// match-report.ts (src/lib/match-report.ts) · created 20.10.2026 18:40 (Asia/Jerusalem) — server only · FREE MATCH REPORT prompt (shared by /api/match/report and the automatic run after a portal request)
export const REPORT_LANG: Record<string, string> = { he: "Hebrew", en: "English", ru: "Russian", it: "Italian" };
export function reportPrompt(o: { company: string; contact: string; lang: string; industry: string; scan: unknown }): string {
  const L = REPORT_LANG[o.lang] || "Hebrew"; const data = JSON.stringify(o.scan || {}).slice(0, 14000);
  return `Write a short, personal "free match report" e-mail from Avshi Sapir (Sapirim, Israel — 35 years in industrial silicones; distributes Silitex S.r.l., Italy) to ${o.contact || "the contact"} at ${o.company}${o.industry ? " (" + o.industry + ")" : ""}.
It is based on an AI reading of their public website (DATA below) that Avshi has reviewed.
Language: ${L} only (product and grade names stay as written).
Structure (plain text, short headings, max ~250 words):
1. One-line thanks for the request.
2. "What we understood about your production" — 2–4 bullets from the product lines in DATA (only what DATA says).
3. "Where Silitex can help" — up to 5 bullets: Silitex grade name → for which product line / function. Use ONLY matches from DATA with confidence high or medium. If none, say a short technical call is needed to choose.
4. Next step: a 20-minute technical call and a lab sample of the 1–2 most relevant grades.
5. Signature: Avshi Sapir · Sapirim · +972-50-523-1042 · avshi@sapirim.com · www.sapirim.com
Rules: no prices; never "identical", "drop-in", "exclusive" or "full replacement" — say "equivalent to verify in your lab"; do not invent products, customers or numbers; friendly and professional.

DATA
${data}`;
}
