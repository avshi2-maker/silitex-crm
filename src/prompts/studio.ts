// studio.ts (src/prompts/studio.ts) · updated 18.10.2026 17:35 (Asia/Jerusalem) — + Italian (it) · 17:10 — POST STUDIO prompt: LinkedIn post + Facebook post + 30-second reel script per language, strict JSON, facts only from the sources, honesty rules (no exclusivity / "official" claims, no customer names, no prices, no food, no invented certifications).
export type StudioBrand = "sapirim" | "silitex";
export const STUDIO_LANGS = [["he", "עברית"], ["ru", "Русский"], ["en", "English"], ["it", "Italiano"]] as const;
const LN: Record<string, string> = { he: "Hebrew", ru: "Russian", en: "English", it: "Italian" };
export const REGULATION_FACTS = [
  "EU cosmetics: D4 (octamethylcyclotetrasiloxane) is banned in cosmetic products (Annex II of the EU Cosmetics Regulation).",
  "EU: D5 is limited to below 0.1 % in wash-off (rinse-off) cosmetics since 31/01/2020.",
  "EU: Regulation (EU) 2024/1328 limits D5 to below 0.1 % in leave-on cosmetics, and D6 to below 0.1 % in both wash-off and leave-on cosmetics, from 06/06/2027.",
  "Israel: whether these EU limits apply domestically has NOT been confirmed — say 'worth checking with the regulator', never claim it applies.",
].join("\n");
export function studioPrompt(o: { brand: StudioBrand; langs: string[]; topic: string; angle: string }): string {
  const brandRule = o.brand === "sapirim"
    ? "BRAND MODE = SAPIRIM ONLY: write as Avshi Sapir / Sapirim, an Israeli silicone specialist with 35 years of experience. Do NOT name Silitex or any Silitex product names. Talk about the problem, the chemistry, the regulation and the fact that equivalents exist for the big-brand codes — and invite a technical conversation."
    : "BRAND MODE = SILITEX PRODUCTS: write as Sapirim, presenting Silitex S.r.l. (Italy) products in Israel. You may name Silitex products from the sources.";
  return `Write social-media content for the B2B industrial audience in Israel (plant R&D managers, process engineers, lab technicians, purchasing, owners).
Topic: ${o.topic}
${o.angle ? "Commercial angle: " + o.angle : ""}
${brandRule}
HARD RULES (non-negotiable):
- Facts ONLY from the sources above. Never invent product names, numbers, certifications or results. If a fact is not in the sources, leave it out.
- Never claim "official", "exclusive" or "sole" distributor. Never name customers. No prices, no "cheaper than" claims. Food industry is out of scope — do not mention food.
- Competitor brands may be named only as the code being replaced ("an equivalent to DOWSIL 1520"), never disparaged.
- Professional, concrete, no hype words ("revolutionary", "best in the world").
- Every post ends with a soft call to action: a WhatsApp message to Avshi 050-5231042 for a technical conversation or a sample.
Return ONLY JSON, no prose:
{"items":[${o.langs.map((l) => `{"lang":"${l}","linkedin":"LinkedIn post in ${LN[l]}, 120-180 words, hook first line, 3 short paragraphs, 3-5 hashtags at the end","facebook":"Facebook post in ${LN[l]}, 60-100 words, conversational, 2-3 emojis max","reel":{"hook":"first 3 seconds, on-screen text in ${LN[l]}","scenes":[{"sec":"0-3","visual":"what to film (English)","voice":"voice-over line in ${LN[l]}"}],"caption":"reel caption in ${LN[l]}"},"hashtags":["..."],"image_prompt":"one English prompt for an AI image: realistic industrial photo, no logos, no text"}`).join(",")}]}
Reel: 30 seconds, 5-6 scenes, filmable with a phone in a plant or lab.`;
}
