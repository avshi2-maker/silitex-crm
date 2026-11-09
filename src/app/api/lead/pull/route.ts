// route.ts (src/app/api/lead/pull/route.ts) · created 09.11.2026 11:55 (Asia/Jerusalem) — v1.9.5
// ⬇ Customers created on the SERVER (Sapirim Hub WhatsApp routing, forms, portal match requests) were never pulled into the browser,
// so their card said "לקוח לא נמצא". GET → every lead in the database; the browser adds the ones it does not have yet (behind the PIN).
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
export const dynamic = "force-dynamic";
export async function GET() {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ leads: [] });
  const { data } = await sb.from("leads").select("*").limit(3000);
  return NextResponse.json({ leads: data || [] });
}
