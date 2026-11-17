// route.ts (src/app/api/hub-weekly/route.ts) · created 17.11.2026 17:35 (Asia/Jerusalem) — v1.17.0 🧭 Sunday plan for the Sapirim Hub
// The Hub has no AI key: POST {facts, today} with header x-hub-wa-key = HUB_WA_KEY → {plan (Hebrew), usage}. Uses ONLY the facts sent.
import { NextResponse } from "next/server";
import { ask } from "@/lib/ai";
export const runtime = "nodejs"; export const maxDuration = 60;
export async function POST(req: Request) {
  const key = process.env.HUB_WA_KEY;
  if (!key || req.headers.get("x-hub-wa-key") !== key) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { facts?: string; today?: string };
  const facts = String(b.facts || "").slice(0, 20000); const today = String(b.today || new Date().toISOString().slice(0, 10));
  if (facts.length < 20) return NextResponse.json({ error: "no facts" }, { status: 400 });
  const prompt = `אתה עוזר התכנון השבועי של אבשי ספיר — עסק של איש אחד עם כמה עסקים (Silitex סיליקונים, כיורי שיש Marble Art, Artfloor מיקרוטופינג, אפוקסי, AI Architect, NutriClinic, Cash-Box כספים). היום ${today} (יום ראשון).
כתוב תכנית שבוע קצרה בעברית, רק מתוך העובדות בהקשר. אסור להמציא שמות, סכומים או תאריכים. אם אין מידע על משהו — דלג.
מבנה (טקסט פשוט, בלי Markdown כבד, כותרות עם אימוג׳י):
🟢 מה זז — עד 3 שורות
🔴 מה תקוע / מחכה לך — עד 4 שורות (מי מחכה וכמה זמן)
🔔 הבטחות פתוחות — עד 5 (מה הבטחת ולמתי)
💰 כסף — עד 2 שורות (רק אם יש עובדות)
📅 פגישות השבוע — רק אם יש
🎯 5 פעולות לשבוע — ממוספרות 1–5, כל אחת: [עסק] פעולה אחת קונקרטית + עם מי. החשובה ביותר ראשונה.
עד 220 מילים.`;
  try { const { text, usage } = await ask(prompt, facts, 900, "he", 50000); return NextResponse.json({ plan: text.trim(), usage }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "AI failed" }, { status: 502 }); }
}
