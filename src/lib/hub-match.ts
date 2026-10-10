// hub-match.ts (src/lib/hub-match.ts) · updated 10.10.2026 07:30 (Asia/Jerusalem)
// Match an email's addresses to a Silitex contact or an Israeli prospect (lead contact email / company domain). Shared by Outlook sync, server ingest and paste-mail.
export const GENERIC_DOMAINS = /^(gmail|googlemail|yahoo|hotmail|outlook|live|walla|icloud|me|msn|aol|proton|protonmail|013|012|bezeqint|netvision|zahav)\./i;
export type LeadLite = { id: string; name: string; contact_email?: string | null };
export const emailDomain = (e?: string | null) => { const d = String(e || "").toLowerCase().split("@")[1] || ""; return d && !GENERIC_DOMAINS.test(d) ? d : ""; };
export const OUR_DOMAINS = ["sapirim.com", "marble-art.co.il"];
export const isOurs = (addr: string) => OUR_DOMAINS.some((d) => addr.toLowerCase().includes("@" + d));
export function matchLead(text: string, leads: LeadLite[]): LeadLite | undefined {
  const t = text.toLowerCase();
  return leads.find((l) => l.contact_email && t.includes(String(l.contact_email).toLowerCase())) || leads.find((l) => { const d = emailDomain(l.contact_email); return d && t.includes("@" + d); });
}
export const leadAddrMatch = (addr: string, leads: LeadLite[]) => !!matchLead(addr, leads);
