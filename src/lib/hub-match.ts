// hub-match.ts (src/lib/hub-match.ts) · updated 19.10.2026 12:30 (Asia/Jerusalem) — customer matching for hundreds of leads: every e-mail in the contact field (several allowed: a@x.com, b@y.com) + any e-mail in the intake form + the company WEBSITE domain → mail lands in that customer's box with no extra typing · 10.10.2026 07:30
// Match an email's addresses to a Silitex contact or an Israeli prospect (lead contact email / company domain). Shared by Outlook sync, server ingest and paste-mail.
export const GENERIC_DOMAINS = /^(gmail|googlemail|yahoo|hotmail|outlook|live|walla|icloud|me|msn|aol|proton|protonmail|013|012|bezeqint|netvision|zahav)\./i;
export type LeadLite = { id: string; name: string; contact_email?: string | null; website?: string | null; intake?: Record<string, string> | null };
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
export const siteDomain = (w?: string | null) => { const h = String(w || "").toLowerCase().replace(/^https?:\/\//, "").split(/[/?#]/)[0].replace(/^www\./, ""); return h && h.includes(".") && !GENERIC_DOMAINS.test(h) ? h : ""; };
export function leadKeys(l: LeadLite): { emails: string[]; domains: string[] } {
  const emails = [...(String(l.contact_email || "").match(EMAIL_RE) || []), ...(Object.values(l.intake || {}).join(" ").match(EMAIL_RE) || [])].map((e) => e.toLowerCase());
  const domains = [...new Set([...emails.map(emailDomain), siteDomain(l.website)].filter(Boolean))].filter((d) => !OUR_DOMAINS.includes(d) && !/silitex\./.test(d));
  return { emails: [...new Set(emails)], domains };
}
export const emailDomain = (e?: string | null) => { const d = String(e || "").toLowerCase().split("@")[1] || ""; return d && !GENERIC_DOMAINS.test(d) ? d : ""; };
export const OUR_DOMAINS = ["sapirim.com", "marble-art.co.il"];
export const isOurs = (addr: string) => OUR_DOMAINS.some((d) => addr.toLowerCase().includes("@" + d));
/** precomputed matcher (fast for hundreds of leads): exact e-mail first, then company domain (incl. sub-domains like mail.company.co.il) */
export function leadMatcher(leads: LeadLite[]) {
  const keys = leads.map((l) => ({ l, ...leadKeys(l) }));
  return (text: string): LeadLite | undefined => {
    const addrs = (text.toLowerCase().match(EMAIL_RE) || []);
    return keys.find((k) => addrs.some((a) => k.emails.includes(a)))?.l || keys.find((k) => addrs.some((a) => k.domains.some((d) => a.endsWith("@" + d) || a.endsWith("." + d))))?.l;
  };
}
export function matchLead(text: string, leads: LeadLite[]): LeadLite | undefined { return leadMatcher(leads)(text); }
export const leadAddrMatch = (addr: string, leads: LeadLite[]) => !!matchLead(addr, leads);
