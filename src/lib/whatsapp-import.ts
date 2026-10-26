// whatsapp-import.ts (src/lib/whatsapp-import.ts) · updated 26.10.2026 06:40 (Asia/Jerusalem) — v0.95.0 correct Israel summer/winter time + AM/PM exports · 10.10.2026 09:50
// Parse a WhatsApp chat export (Android "dd/mm/yyyy, hh:mm - Name: text" · iPhone "[dd/mm/yyyy, hh:mm:ss] Name: text"; multi-line; LRM marks) and match senders to prospects / Silitex contacts / us.
import type { Lead, SilitexContact } from "./types";
export type WaMsg = { at: string; sender: string; text: string };
/** Israel offset (summer +3 / winter +2) for a wall-clock time — WhatsApp exports carry local time without a zone */
const IL = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jerusalem", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
function ilOffset(ms: number): number { const p = IL.formatToParts(new Date(ms)); const g = (k: string) => +(p.find((x) => x.type === k)?.value || 0); return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute")) - Math.floor(ms / 60000) * 60000; }
const LINE = /^‎?\[?(\d{1,2})[./](\d{1,2})[./](\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp]\.?\s?[Mm]\.?)?\]?\s*[-–]?\s*([^:]{1,60}?):\s([\s\S]*)$/;
export function parseWhatsApp(raw: string): WaMsg[] {
  const out: WaMsg[] = []; const lines = raw.replace(/\r/g, "").replace(/[‎‏‪-‮]/g, "").split("\n");
  for (const line of lines) {
    const m = line.match(LINE);
    if (m) { const [, d, mo, y, h0, mi, s, ap, sender, text] = m; const yy = y.length === 2 ? "20" + y : y; let h = +h0; if (ap && /p/i.test(ap) && h < 12) h += 12; if (ap && /a/i.test(ap) && h === 12) h = 0; const local = Date.UTC(+yy, +mo - 1, +d, h, +mi, +(s || 0)); const at = new Date(local - ilOffset(local)).toISOString(); out.push({ at, sender: sender.trim(), text }); }
    else if (out.length && line.trim()) out[out.length - 1].text += "\n" + line;
  }
  return out.filter((m) => m.text.trim() && !/^<Media omitted>|^‎?image omitted|^Messages and calls are end-to-end encrypted/i.test(m.text.trim())).map((m) => ({ ...m, text: m.text.trim() }));
}
const clean = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
export const normPhone = (p?: string | null) => String(p || "").replace(/\D/g, "").replace(/^972/, "0").replace(/^00972/, "0");
export const OUR_NAMES = ["avshi", "אבשי", "sapir", "ספיר", "sapirim", "you", "את/ה", "אתה"];
export const isUs = (sender: string) => { const c = clean(sender); return OUR_NAMES.some((n) => c === n || c.includes(n)); };
const nameHit = (a: string, b?: string | null) => { if (!b) return false; const x = clean(a), y = clean(b); if (!x || !y) return false; if (x === y || x.includes(y) || y.includes(x)) return true; const fx = x.split(" ")[0], fy = y.split(" ")[0]; return fx.length > 2 && fx === fy; };
export function matchLeadBySenders(senders: string[], raw: string, leads: Lead[]): Lead | undefined {
  const others = senders.filter((s) => !isUs(s)); const phones = (raw.match(/\+?\d[\d\s-]{7,}\d/g) || []).map(normPhone);
  return leads.find((l) => l.contact_phone && phones.includes(normPhone(l.contact_phone))) || leads.find((l) => others.some((s) => nameHit(s, l.contact_name))) || leads.find((l) => others.some((s) => nameHit(s, l.name.split(" (")[0])));
}
export function matchContactBySenders(senders: string[], contacts: SilitexContact[]): SilitexContact | undefined {
  const others = senders.filter((s) => !isUs(s)); return contacts.find((c) => others.some((s) => nameHit(s, c.name)));
}
export const senderList = (msgs: WaMsg[]) => Array.from(new Set(msgs.map((m) => m.sender)));
