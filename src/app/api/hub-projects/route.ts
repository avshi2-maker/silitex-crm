// route.ts (src/app/api/hub-projects/route.ts) · created 10.11.2026 14:55 (Asia/Jerusalem) — v1.9.9 📁 projects for the Sapirim Hub (yellow tab)
// GET with header x-hub-wa-key = HUB_WA_KEY → all projects (newest first) + each customer's next open task. Read-only; runs the auto-open sweep first
// so a new RFQ shows in the Hub without opening the CRM.
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { sweep } from "@/lib/projects-server";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const k = process.env.HUB_WA_KEY;
  if (!k || req.headers.get("x-hub-wa-key") !== k) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  const opened = await sweep(sb).catch(() => [] as string[]);
  const ps = (await sb.from("projects").select("id,lead_id,lead_name,opened_at,version,description,request,stage,quote_ref,po_sample,po_product,invoice,invoice_at,team,updated_at").order("opened_at", { ascending: false }).limit(300)).data || [];
  const ids = [...new Set(ps.map((p) => p.lead_id))];
  const tasks = ids.length ? (await sb.from("tasks").select("lead_id,title,due").in("lead_id", ids).eq("done", false).order("due", { ascending: true }).limit(1000)).data || [] : [];
  const next = new Map<string, { title: string; due: string }>(); for (const t of tasks) if (!next.has(t.lead_id)) next.set(t.lead_id, { title: t.title, due: t.due });
  return NextResponse.json({ opened, projects: ps.map((p) => ({ ...p, team: ((p.team || []) as { name: string; role: string }[]).map((m) => ({ name: m.name, role: m.role })), next: next.get(p.lead_id) || null })) });
}
