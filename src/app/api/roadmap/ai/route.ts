// route.ts (src/app/api/roadmap/ai/route.ts) · created 20.10.2026 13:20 (Asia/Jerusalem) — AI 6-MONTH STRATEGY: POST {summary} (grade counts, industries, top accounts with score breakdown, month plan) → Hebrew strategic roadmap: priorities, monthly focus + KPIs, risks, when to bring in the son (day-job criteria). Owner only (PIN gate).
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
export const runtime = "nodejs";
export const maxDuration = 90;
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({})); const summary = String(b.summary || "").slice(0, 40000);
  if (!summary.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });
  const prompt = `You are a senior B2B chemical-distribution strategist advising Avshi Sapir (Sapirim, Israel; 35 years in Israeli silicones, ex-Dow Corning distributor), now launching Silitex S.r.l. (Italy) silicones in Israel as a one-man show.
Constraints: no speculative local stock (direct per PO, selective stock only for repeat customers who pay for it); no prices, no "exclusive/identical/drop-in" claims; food sector parked; cosmetics = only the official Silitex cosmetic range; weekly Friday report to Federica (Silitex export manager); technical partner Pini (PhD chemist, ex-technical manager).
Goal: in 6 months reach solid recurring income so Avshi can give his son (40, a strong salesman) a real day job running the field sales, while Avshi keeps strategy and the A accounts.

DATA (from the CRM priority engine: score 0–100 = volume + Silitex fit + access + speed; A ≥65, B ≥50, C ≥35, D <35):
${summary}

Write in Hebrew (company and product names stay as written), plain text with short headings:
1. התמונה בשורה אחת.
2. 5 העדיפויות העליונות — למה דווקא הן (לפי הנתונים).
3. תוכנית חודש-בחודש (6 חודשים): מיקוד, לקוחות, פעולות, KPI מדיד לכל חודש (פגישות, דגימות, פיילוטים, PO).
4. תעשיות: איפה להשקיע, איפה לחכות, מה לעצור — ולמה.
5. מתי ואיך הבן נכנס: קריטריון כספי/צנרת ברור, אילו לקוחות עוברים אליו, איך מודדים אותו.
6. 5 סיכונים מרכזיים + מה עושים מראש.
7. 3 החלטות שאבשי צריך לקבל השבוע.
Be concrete, use the account names from the data, no invented numbers beyond the data (say "הערכה" when estimating).`;
  try { const { text, usage } = await ask(prompt, undefined, 4000, "he"); return NextResponse.json({ ok: true, text, usage }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "AI error" }, { status: 502 }); }
}
