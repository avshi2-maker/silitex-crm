// route.ts (src/app/api/hub/wa-admin/route.ts) · updated 11.10.2026 08:20 (Asia/Jerusalem) — WhatsApp admin (behind the site gate): unmatched inbox · directory (prospects + Silitex contacts + allowlist + blocklist) · assign / allow / ignore / block / unblock / remove
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { appendToThread, matchPhone, normPhone } from "@/lib/wa-inbound";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ items: [], directory: [] });
  const items = (await sb.from("wa_unmatched").select("*").order("at", { ascending: false }).limit(100)).data || [];
  if (new URL(req.url).searchParams.get("directory") !== "1") return NextResponse.json({ items });
  const [leads, cts, allow, block, msgs] = await Promise.all([
    sb.from("leads").select("id,name,contact_name,contact_phone").not("contact_phone", "is", null),
    sb.from("silitex_contacts").select("id,name,dept,mobile,phone"),
    sb.from("wa_allowlist").select("*").order("created_at", { ascending: false }),
    sb.from("wa_blocklist").select("*"),
    sb.from("hub_messages").select("thread_id,at,direction").eq("source", "whatsapp").order("at", { ascending: false }).limit(2000),
  ]);
  const stat = (tid: string) => { const m = (msgs.data || []).filter((x) => x.thread_id === tid); return { count: m.length, last: m[0]?.at || null }; };
  const directory = [
    ...(leads.data || []).filter((l) => normPhone(l.contact_phone)).map((l) => ({ phone: normPhone(l.contact_phone), name: l.contact_name || l.name, company: l.name, kind: "customer", source: "lead", ref: l.id, dept: "il", ...stat("thr-wa-" + l.id) })),
    ...(cts.data || []).flatMap((c) => [c.mobile, c.phone].filter((p) => normPhone(p)).map((p) => ({ phone: normPhone(p), name: c.name, company: "Silitex", kind: "supplier", source: "contact", ref: c.id, dept: c.dept, ...stat("thr-wa-" + c.id) }))),
    ...(allow.data || []).map((a) => ({ phone: a.phone, name: a.name, company: a.company || "", kind: a.kind, source: "list", ref: a.phone, dept: a.dept, notes: a.notes, ...stat("thr-wa-" + a.phone) })),
    ...(block.data || []).map((b) => ({ phone: b.phone, name: "", company: "", kind: "blocked", source: "block", ref: b.phone, dept: "", count: 0, last: null })),
  ];
  return NextResponse.json({ items, directory });
}
export async function POST(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ ok: false, error: "no supabase" }, { status: 500 });
  const b = (await req.json()) as { action: "assign" | "ignore" | "block" | "unblock" | "allow" | "remove"; id?: string; phone?: string; lead_id?: string; contact_id?: string; name?: string; kind?: string; dept?: string; company?: string; notes?: string };
  if (b.action === "unblock" && b.phone) { await sb.from("wa_blocklist").delete().eq("phone", normPhone(b.phone)); return NextResponse.json({ ok: true }); }
  if (b.action === "remove" && b.phone) { await sb.from("wa_allowlist").delete().eq("phone", normPhone(b.phone)); return NextResponse.json({ ok: true }); }
  if (b.action === "allow" && b.phone) {
    const p = normPhone(b.phone); await sb.from("wa_blocklist").delete().eq("phone", p);
    await sb.from("wa_allowlist").upsert({ phone: p, name: (b.name || "").trim() || "+" + p, kind: b.kind || "other", dept: b.dept || "customer", company: b.company || null, notes: b.notes || null });
    const match = await matchPhone(p); const all = match ? (await sb.from("wa_unmatched").select("*").eq("phone", p).order("at")).data || [] : [];
    for (const r of all) await appendToThread({ id: r.id.replace(/^wa-/, ""), phone: r.phone, name: r.name, at: r.at, body: r.body, direction: "in" }, match!);
    if (all.length) await sb.from("wa_unmatched").delete().eq("phone", p); return NextResponse.json({ ok: true, moved: all.length });
  }
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
