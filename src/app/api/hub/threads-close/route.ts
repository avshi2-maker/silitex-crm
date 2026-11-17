// route.ts (src/app/api/hub/threads-close/route.ts) · created 17.11.2026 18:10 (Asia/Jerusalem) — v1.18.1 🗑 clean "waiting for an answer" mails
// POST {ids, undo?} (owner session, behind the PIN gate) → those Hub threads get status "closed" (no longer "waiting") — the mails themselves stay
// in the Hub + customer history, nothing is deleted. A new mail on the thread re-opens it by itself. undo:true → back to "waiting_silitex".
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { ids?: string[]; undo?: boolean };
  const ids = (b.ids || []).filter((x) => typeof x === "string").slice(0, 500); if (!ids.length) return NextResponse.json({ ok: true, n: 0 });
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  const r = b.undo ? await sb.from("threads").update({ status: "waiting_silitex" }).in("id", ids).eq("status", "closed") : await sb.from("threads").update({ status: "closed" }).in("id", ids).eq("status", "waiting_silitex");
  return r.error ? NextResponse.json({ error: r.error.message }, { status: 500 }) : NextResponse.json({ ok: true, n: ids.length });
}
