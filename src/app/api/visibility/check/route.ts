// route.ts (src/app/api/visibility/check/route.ts) · updated 18.10.2026 19:00 (Asia/Jerusalem) — AI VISIBILITY BOT: POST {engine, qid} → one live check (owner only — behind the PIN gate), saved to Supabase when configured
import { NextResponse } from "next/server";
import { VIS_QUESTIONS } from "@/config/visibility";
import { runCheck } from "@/lib/visibility/run";
import type { Engine } from "@/lib/visibility/engines";
export const runtime = "nodejs";
export const maxDuration = 90;
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const engine = (b.engine === "chatgpt" ? "chatgpt" : "claude") as Engine;
  const q = VIS_QUESTIONS.find((x) => x.id === b.qid) || (typeof b.q === "string" && b.q.trim().length > 5 ? { id: "adhoc", lang: "he" as const, q: b.q.trim().slice(0, 300) } : null);
  if (!q) return NextResponse.json({ error: "unknown question" }, { status: 400 });
  return NextResponse.json(await runCheck(engine, q));
}
