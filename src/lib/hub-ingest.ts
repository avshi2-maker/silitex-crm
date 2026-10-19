// hub-ingest.ts (src/lib/hub-ingest.ts) · updated 19.10.2026 12:30 (Asia/Jerusalem) — customer matching uses all contact e-mails + intake e-mails + website domain, and seed leads not yet saved in Supabase · 10.10.2026 07:30 — server only · known-contact + prospect routing
// Shared ingest: normalised messages → Supabase threads + hub_messages (dedup by external_id, thread by conversationId → subject). Used by /api/hub/ingest and the Outlook sync.
import { serviceClient } from "./server-data";
import { deptOf } from "@/config/hub";
import { leadMatcher, isOurs, type LeadLite } from "./hub-match";
import { LEADS_SEED } from "./data";
type SB = NonNullable<ReturnType<typeof serviceClient>>;
/** every customer the mail can belong to: Supabase leads (latest edits) + seed leads never edited yet */
export async function matchLeads(sb: SB): Promise<LeadLite[]> {
  const rows = ((await sb.from("leads").select("id,name,contact_email,website,intake")).data || []) as LeadLite[];
  const ids = new Set(rows.map((r) => r.id));
  return [...rows, ...LEADS_SEED.filter((l) => !ids.has(l.id)).map((l) => ({ id: l.id, name: l.name, contact_email: l.contact_email, website: l.website, intake: l.intake }))];
}
export type InMsg = { id: string; from: string; to: string; subject: string; at: string; body: string; conversationId?: string };
export async function ingest(messages: InMsg[]): Promise<{ added: number; threads: number }> {
  const sb = serviceClient(); if (!sb) throw new Error("no supabase"); let added = 0, threads = 0;
  const contacts = ((await sb.from("silitex_contacts").select("id,dept,email")).data || []).filter((c) => c.email && !/^info@/i.test(c.email));
  const leads = await matchLeads(sb); const matchLead = (t: string, _l?: LeadLite[]) => findLead(t); const findLead = leadMatcher(leads);
  const byContact = (text: string) => contacts.find((c) => text.toLowerCase().includes(String(c.email).toLowerCase()));
  for (const m of messages || []) {
    if (!m.id || !m.subject) continue;
    const norm = m.subject.replace(/^(re|fw|fwd|r|i|tr|aw)\s*:\s*/gi, "").trim();
    let th = m.conversationId ? (await sb.from("threads").select("id").eq("conversation_id", m.conversationId).maybeSingle()).data : null;
    if (!th) th = (await sb.from("threads").select("id").ilike("subject", norm).maybeSingle()).data;
    const direction = isOurs(m.from) ? "out" : "in";
    if (!th) { const id = "thr-" + m.id.replace(/[^a-z0-9]/gi, "").slice(-14); const ct = byContact(m.from + " " + m.to); const ld = ct ? undefined : matchLead(m.from + " " + m.to, leads); const r = await sb.from("threads").upsert({ id, dept: ct?.dept || (ld ? "il" : deptOf(m.subject + " " + m.body.slice(0, 600))), contact_id: ct?.id || null, subject: norm, topic: "other", refs: ld ? { lead_id: ld.id, lead_name: ld.name } : {}, owner: direction === "in" ? "sapirim" : "silitex", status: direction === "in" ? "waiting_us" : "waiting_silitex", created_at: m.at, last_at: m.at, conversation_id: m.conversationId || null }).select("id").single(); th = r.data; threads++; }
    if (!th) continue;
    const r = await sb.from("hub_messages").upsert({ id: "msg-" + m.id.replace(/[^a-z0-9]/gi, "").slice(-18), thread_id: th.id, at: m.at, from: m.from, to: m.to, direction, body: m.body.slice(0, 20000), source: "graph", external_id: m.id }, { onConflict: "external_id", ignoreDuplicates: true });
    if (!r.error) { added++; const cur = (await sb.from("threads").select("last_at").eq("id", th.id).single()).data; if (!cur?.last_at || cur.last_at <= m.at) await sb.from("threads").update({ last_at: m.at, status: direction === "in" ? "waiting_us" : "waiting_silitex" }).eq("id", th.id); }
  }
  // Re-route threads that have no contact yet: first message's from/to matches a saved contact → that contact's department.
  const orphans = ((await sb.from("threads").select("id,refs").is("contact_id", null).limit(300)).data || []).filter((t) => !(t.refs as { lead_id?: string } | null)?.lead_id);
  for (const th of orphans) {
    const msgs = (await sb.from("hub_messages").select("from,to").eq("thread_id", th.id).limit(5)).data || [];
    const txt = msgs.map((x) => x.from + " " + x.to).join(" "); const ct = byContact(txt); if (ct) { await sb.from("threads").update({ dept: ct.dept, contact_id: ct.id }).eq("id", th.id); continue; }
    const ld = matchLead(txt, leads); if (ld) await sb.from("threads").update({ dept: "il", refs: { lead_id: ld.id, lead_name: ld.name } }).eq("id", th.id);
  }
  return { added, threads };
}
