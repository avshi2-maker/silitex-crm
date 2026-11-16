// route.ts (src/app/api/orders/parse/route.ts) · created 16.11.2026 18:55 (Asia/Jerusalem) — v1.14.0 ✨ fill an order from the customer's request (behind the PIN gate)
// POST {id, text?} → text given (pasted WhatsApp / mail) or the customer's latest mails on the order's project → Claude → fields merged into the order
// (fills only what is empty / the default line — never overwrites your typing) → {order, parsed, usage, source}
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { applyParsed } from "@/lib/orders-server";
import { parseRequest, customerMails } from "@/lib/order-parse";
import { fmtDate } from "@/lib/format";
import type { Order } from "@/lib/types";
export const runtime = "nodejs"; export const maxDuration = 60;

export async function POST(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  const b = (await req.json().catch(() => ({}))) as { id?: string; text?: string };
  const o = (await sb.from("orders").select("*").eq("id", b.id || "").maybeSingle()).data as Order | null; if (!o) return NextResponse.json({ error: "not found" }, { status: 404 });
  let text = String(b.text || "").trim(); let source = "הודבק";
  if (!text) {
    if (!o.project_id) return NextResponse.json({ error: "אין פרויקט להזמנה — הדבק את בקשת הלקוח בתיבה" }, { status: 400 });
    const ms = await customerMails(sb, o.project_id); if (!ms.length) return NextResponse.json({ error: "לא נמצא מייל של הלקוח בפרויקט — הדבק את הבקשה בתיבה" }, { status: 404 });
    text = ms.map((m) => "[" + fmtDate(m.at) + "] " + m.from + "\n" + m.body).join("\n\n---\n\n"); source = ms.length + " מיילים של הלקוח (" + fmtDate(ms[0].at) + ")";
  }
  const { parsed, usage } = await parseRequest(text, "Customer: " + o.lead_name + " · order " + o.id + " (" + o.kind + ")");
  const patch = applyParsed(o, parsed);
  const now = new Date().toISOString(); const history = [...(o.history || []), { at: now, text: "✨ מולא מבקשת הלקוח (" + source + ")" + (parsed.summary ? ": " + parsed.summary : "") }];
  const r = await sb.from("orders").update({ ...patch, history, updated_at: now }).eq("id", o.id).select("*").single();
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });
  return NextResponse.json({ order: r.data, parsed, usage, source });
}
