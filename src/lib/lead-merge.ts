// lead-merge.ts (src/lib/lead-merge.ts) · created 23.10.2026 05:45 (Asia/Jerusalem) — merge duplicate customers into one: the keeper fills every EMPTY field from the duplicate (website, city, contacts, sub-industry, application…), e-mails are combined, a second phone + the duplicate's notes go into the notes, the source says "also found by …", a missing website scan is taken over. Nothing the keeper already has is overwritten.
import type { Lead } from "@/lib/types";

const FILL: (keyof Lead)[] = ["website", "city", "address", "contact_name", "contact_role", "contact_phone", "sub_industry", "use_case", "product_match", "competitor_offset", "department"];
const toolOf = (src?: string) => (src || "").split(" —")[0].trim();

export function mergeInto(keep: Lead, dup: Lead): Lead {
  const k = { ...keep } as Record<string, unknown>; const d = dup as unknown as Record<string, unknown>;
  for (const f of FILL) if (!k[f] && d[f]) k[f] = d[f];
  const mails = Array.from(new Set([keep.contact_email, dup.contact_email].flatMap((m) => String(m || "").split(/[,;\s]+/)).map((m) => m.trim()).filter(Boolean)));
  k.contact_email = mails.join(", ");
  const extra: string[] = [];
  if (dup.contact_phone && keep.contact_phone && dup.contact_phone !== keep.contact_phone) extra.push("טלפון נוסף: " + dup.contact_phone);
  if (dup.notes && dup.notes.trim() && !(keep.notes || "").includes(dup.notes.trim())) extra.push("— מוזג מכפילות (" + dup.name + "):\n" + dup.notes.trim());
  if (extra.length) k.notes = [keep.notes, ...extra].filter(Boolean).join("\n");
  const also = toolOf(dup.source); if (also && !(keep.source || "").includes(also)) k.source = (keep.source || "") + " · also found by: " + also;
  if (!keep.intake?.scan_json && dup.intake?.scan_json) k.intake = { ...(keep.intake || {}), scan_json: dup.intake.scan_json } as Lead["intake"];
  if ((!keep.volume_tons || keep.volume_tons === 0) && dup.volume_tons) k.volume_tons = dup.volume_tons;
  return k as unknown as Lead;
}
