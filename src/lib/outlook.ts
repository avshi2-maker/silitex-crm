// outlook.ts (src/lib/outlook.ts) · updated 10.10.2026 07:30 (Asia/Jerusalem) — server only · PKCE public client (no client secret)
// Microsoft Graph (delegated, single mailbox): OAuth URLs, token refresh (stored in Supabase hub_tokens), pull messages to/from HUB_MAIL_DOMAIN since last sync.
import { createHash, randomBytes } from "crypto";
import { serviceClient } from "./server-data";
import type { InMsg } from "./hub-ingest";
import { leadAddrMatch, type LeadLite } from "./hub-match";
const T = () => process.env.MS_TENANT_ID || "common";
const SCOPE = "offline_access User.Read Mail.Read";
export const DOMAIN = () => (process.env.HUB_MAIL_DOMAIN || "silitex.it").toLowerCase();
export const configured = () => !!process.env.MS_CLIENT_ID;
const b64url = (b: Buffer) => b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
export const newVerifier = () => b64url(randomBytes(32));
const challenge = (v: string) => b64url(createHash("sha256").update(v).digest());
export const redirectUri = (origin: string) => origin + "/api/hub/outlook/cb";
export function authUrl(origin: string, state: string, verifier: string): string {
  const q = new URLSearchParams({ client_id: process.env.MS_CLIENT_ID || "", response_type: "code", redirect_uri: redirectUri(origin), response_mode: "query", scope: SCOPE, state, prompt: "select_account", code_challenge: challenge(verifier), code_challenge_method: "S256" });
  return "https://login.microsoftonline.com/" + T() + "/oauth2/v2.0/authorize?" + q;
}
async function tokenCall(body: Record<string, string>) {
  const r = await fetch("https://login.microsoftonline.com/" + T() + "/oauth2/v2.0/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: process.env.MS_CLIENT_ID || "", scope: SCOPE, ...body }) });
  const j = await r.json(); if (!r.ok) throw new Error(j.error_description || j.error || "token error"); return j as { access_token: string; refresh_token?: string };
}
export async function exchangeCode(code: string, origin: string, verifier: string) { return tokenCall({ grant_type: "authorization_code", code, redirect_uri: redirectUri(origin), code_verifier: verifier }); }
export async function saveToken(refresh: string, account: string) { const sb = serviceClient(); if (!sb) throw new Error("no supabase"); await sb.from("hub_tokens").upsert({ id: "outlook", refresh_token: refresh, account, updated_at: new Date().toISOString() }); }
export async function status() { const sb = serviceClient(); if (!sb) return null; return (await sb.from("hub_tokens").select("account,last_sync,updated_at,last_result").eq("id", "outlook").maybeSingle()).data; }
async function accessToken(): Promise<string> {
  const sb = serviceClient(); if (!sb) throw new Error("no supabase");
  const row = (await sb.from("hub_tokens").select("refresh_token").eq("id", "outlook").maybeSingle()).data; if (!row?.refresh_token) throw new Error("Outlook not connected");
  const t = await tokenCall({ grant_type: "refresh_token", refresh_token: row.refresh_token });
  if (t.refresh_token) await sb.from("hub_tokens").update({ refresh_token: t.refresh_token, updated_at: new Date().toISOString() }).eq("id", "outlook");
  return t.access_token;
}
export async function me(access: string): Promise<string> { const r = await fetch("https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName", { headers: { Authorization: "Bearer " + access } }); const j = await r.json(); return j.mail || j.userPrincipalName || ""; }
type GMsg = { id: string; conversationId?: string; subject?: string; receivedDateTime: string; from?: { emailAddress?: { address?: string; name?: string } }; toRecipients?: { emailAddress?: { address?: string } }[]; ccRecipients?: { emailAddress?: { address?: string } }[]; body?: { content?: string } };
export async function pull(sinceIso: string, max = 200, leads: LeadLite[] = []): Promise<InMsg[]> {
  const access = await accessToken(); const dom = DOMAIN(); const out: InMsg[] = [];
  let url: string | null = "https://graph.microsoft.com/v1.0/me/messages?$select=id,conversationId,subject,receivedDateTime,from,toRecipients,ccRecipients,body&$orderby=receivedDateTime desc&$top=50&$filter=receivedDateTime ge " + sinceIso;
  while (url && out.length < max) {
    const r: Response = await fetch(url, { headers: { Authorization: "Bearer " + access, Prefer: 'outlook.body-content-type="text"' } });
    const j: { value?: GMsg[]; "@odata.nextLink"?: string; error?: { message: string } } = await r.json(); if (!r.ok) throw new Error(j.error?.message || "graph error");
    for (const m of j.value || []) {
      const addrs = [m.from?.emailAddress?.address, ...(m.toRecipients || []).map((x) => x.emailAddress?.address), ...(m.ccRecipients || []).map((x) => x.emailAddress?.address)].filter(Boolean).map((a) => String(a).toLowerCase());
      if (!addrs.some((a) => a.endsWith("@" + dom) || a.endsWith("." + dom) || leadAddrMatch(a, leads))) continue;
      out.push({ id: m.id, conversationId: m.conversationId, subject: m.subject || "(no subject)", at: m.receivedDateTime, from: (m.from?.emailAddress?.name ? m.from.emailAddress.name + " <" + m.from.emailAddress.address + ">" : m.from?.emailAddress?.address) || "", to: (m.toRecipients || []).map((x) => x.emailAddress?.address).filter(Boolean).join(", "), body: (m.body?.content || "").replace(/\r/g, "").trim() });
    }
    url = j["@odata.nextLink"] || null;
  }
  return out;
}
export async function syncNow(): Promise<{ pulled: number; added: number; threads: number; since: string }> {
  const sb = serviceClient(); if (!sb) throw new Error("no supabase");
  const st = (await sb.from("hub_tokens").select("last_sync").eq("id", "outlook").maybeSingle()).data;
  const since = st?.last_sync ? new Date(new Date(st.last_sync).getTime() - 3600e3).toISOString() : new Date(Date.now() - 30 * 864e5).toISOString();
  const leads = ((await sb.from("leads").select("id,name,contact_email")).data || []) as LeadLite[];
  const msgs = await pull(since, 200, leads); const { ingest } = await import("./hub-ingest"); const r = await ingest(msgs);
  await sb.from("hub_tokens").update({ last_sync: new Date().toISOString(), last_result: "pulled " + msgs.length + ", added " + r.added }).eq("id", "outlook");
  return { pulled: msgs.length, ...r, since };
}
