// route.ts (src/app/api/hub/wa-admin/route.ts) · updated 10.10.2026 10:20 (Asia/Jerusalem) — Unmatched WhatsApp inbox (behind the site gate): list · assign to prospect/contact · ignore · block number
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { appendToThread, matchPhone, normPhone } from "@/lib/wa-inbound";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET() {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ items: [] });
  const items = (await sb.from("wa_unmatched").select("*").order("at", { ascending: false }).limit(100)).data || []; return NextResponse.json({ items });
}
export async function POST(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ ok: false, error: "no supabase" }, { status: 500 });
  const b = (await req.json()) as { action: "assign" | "ignore" | "block"; id?: string; phone?: string; lead_id?: string; contact_id?: string };
  if (b.action === "block" && b.phone) { const p = normPhone(b.phone); await sb.from("wa_blocklist").upsert({ phone: p }); await sb.from("wa_unmatched").delete().eq("phone", p); return NextResponse.json({ ok: true }); }
  if (b.action === "ignore" && b.id) { await sb.from("wa_unmatched").delete().eq("id", b.id); return NextResponse.json({ ok: true }); }
  if (b.action === "assign" && b.id && (b.lead_id || b.contact_id)) {
    const row = (await sb.from("wa_unmatched").select("*").eq("id", b.id).single()).data; if (!row) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    if (b.lead_id) await sb.from("leads").update({ contact_phone: "+" + row.phone }).eq("id", b.lead_id); else await sb.from("silitex_contacts").update({ mobile: "+" + row.phone }).eq("id", b.contact_id);
    const match = await matchPhone(row.phone); if (!match) return NextResponse.json({ ok: false, error: "phone saved but no match" }, { status: 500 });
    // move every pending message from this number
    const all = (await sb.from("wa_unmatched").select("*").eq("phone", row.phone).order("at")).data || []; let tid = "";
    for (const r of all) tid = await appendToThread({ id: r.id.replace(/^wa-/, ""), phone: r.phone, name: r.name, at: r.at, body: r.body, direction: "in" }, match);
    await sb.from("wa_unmatched").delete().eq("phone", row.phone); return NextResponse.json({ ok: true, thread_id: tid, moved: all.length });
  }
  return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
}
