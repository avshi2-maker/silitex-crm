// route.ts (src/app/api/projects/route.ts) · created 10.11.2026 12:40 (Asia/Jerusalem) — v1.9.8 📁 Projects (behind the PIN gate)
// GET  → auto-open sweep, then all projects (newest first) + open project tasks · ?lead=<id> → that customer's projects + open tasks · ?id=SPR-0002 → that project + its customer's open tasks · ?lite=1 → all, no sweep (📞 search)
// POST → open a project by hand {lead_id, lead_name, description?, request?}
// PATCH → {id, patch, bump?: "note"} — fields whitelist; bump = new version (v+1) with a history line. PO / quote / invoice changes always bump.
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { sweep, openProject, linkThreads } from "@/lib/projects-server";
import { fmtDate } from "@/lib/format";
import { stageOf } from "@/config/projects";
import type { Project } from "@/lib/types";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const FIELDS = ["description", "request", "stage", "quote_ref", "quote_at", "po_sample", "po_sample_at", "po_product", "po_product_at", "invoice", "invoice_at", "team", "notes", "hold_until"] as const;
const DOCS: Record<string, string> = { quote_ref: "הצעת מחיר", po_sample: "PO דוגמה", po_product: "PO מוצר", invoice: "חשבונית ספירים" };

export async function GET(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ projects: [], note: "no supabase" });
  const sp = new URL(req.url).searchParams; const id = sp.get("id");
  let lead = sp.get("lead");
  if (id) lead = ((await sb.from("projects").select("lead_id").eq("id", id).maybeSingle()).data?.lead_id as string) || "-";
  const opened = lead || sp.get("lite") ? [] : await sweep(sb).catch(() => [] as string[]);
  let q = sb.from("projects").select("*").order("opened_at", { ascending: false }).limit(500); if (id) q = q.eq("id", id); else if (lead) q = q.eq("lead_id", lead);
  const r = await q; if (r.error) return NextResponse.json({ projects: [], error: r.error.message }, { status: 500 });
  // open tasks for the browser (server-made 🔔 project follow-ups reach My day; the project card lists the customer's open tasks)
  let tq = sb.from("tasks").select("*").eq("done", false).limit(500); tq = lead ? tq.eq("lead_id", lead) : tq.like("id", "task-prj-%");
  const tasks = (await tq).data || [];
  return NextResponse.json({ projects: r.data || [], opened, tasks });
}
export async function POST(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  const b = (await req.json()) as { lead_id?: string; lead_name?: string; description?: string; request?: string };
  if (!b.lead_id) return NextResponse.json({ error: "lead_id required" }, { status: 400 });
  try { const { project, created } = await openProject(sb, { lead_id: b.lead_id, lead_name: b.lead_name || "", description: b.description, request: b.request, source: "manual" }); return NextResponse.json({ project, created }); }
  catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "open failed" }, { status: 500 }); }
}
export async function PATCH(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  const b = (await req.json()) as { id: string; patch: Partial<Project>; bump?: string };
  const cur = (await sb.from("projects").select("*").eq("id", b.id).maybeSingle()).data as Project | null; if (!cur) return NextResponse.json({ error: "not found" }, { status: 404 });
  const patch: Record<string, unknown> = {}; for (const k of FIELDS) if (k in (b.patch || {})) patch[k] = (b.patch as Record<string, unknown>)[k] === "" ? null : (b.patch as Record<string, unknown>)[k];
  if ("description" in patch && patch.description === null) patch.description = "";
  const now = new Date().toISOString(); const lines: string[] = [];
  for (const k of Object.keys(DOCS)) if (k in patch && patch[k] && patch[k] !== (cur as Record<string, unknown>)[k]) lines.push(DOCS[k] + ": " + patch[k]);
  if (b.bump?.trim()) lines.push(b.bump.trim());
  const bump = lines.length > 0; const version = bump ? cur.version + 1 : cur.version;
  const history = [...(cur.history || [])];
  if (bump) history.push({ v: version, at: now, text: lines.join(" · ") });
  if (patch.stage && patch.stage !== cur.stage) history.push({ v: version, at: now, text: "שלב: " + stageOf(String(patch.stage)).he });
  const r = await sb.from("projects").update({ ...patch, version, history, updated_at: now }).eq("id", b.id).select("*").single();
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });
  const p = r.data as Project;
  if (bump || patch.stage) await sb.from("activities").insert({ id: "act-prj-" + p.id + "-" + Date.now().toString(36), lead_id: p.lead_id, at: now, kind: "project", text: "📁 #" + p.id + " · " + fmtDate(p.opened_at) + " · v" + p.version + " — " + history.slice(-1)[0].text });
  if (patch.stage) await linkThreads(sb, p);
  return NextResponse.json({ project: p });
}
