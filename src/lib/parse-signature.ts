// parse-signature.ts (src/lib/parse-signature.ts) · updated 10.10.2026 07:05 (Asia/Jerusalem)
// Parse a pasted email signature (Outlook/Italian style) into contact fields. Best-effort; user reviews before save.
import type { SilitexContact } from "./types";
export function parseSignature(raw: string): Partial<SilitexContact> {
  const text = raw.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\r/g, "");
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const out: Partial<SilitexContact> = {};
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/); if (email) out.email = email[0].toLowerCase();
  const li = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i); if (li) out.linkedin = "https://www." + li[0].replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const mob = text.match(/(?:mob|cell|mobile|cel)\.?:?\s*(\+?[\d\s().-]{7,})/i); if (mob) out.mobile = mob[1].replace(/\s+$/, "").trim();
  const tel = text.match(/(?:tel|phone|ph)\.?:?\s*(\+?[\d\s().-]{7,})/i); if (tel) out.phone = tel[1].replace(/\s*-\s*\d{6}\s*$/, "").trim();
  const addr = lines.find((l) => /\|/.test(l) && /\d{5}/.test(l)); if (addr) out.address = addr.split("|").map((s) => s.trim()).filter((s) => !/s\.?r\.?l|®|s\.?p\.?a/i.test(s)).join(", ");
  const plain = lines.filter((l) => !/[@\d|]/.test(l) && !/linkedin|www\./i.test(l));
  if (plain[0]) out.name = plain[0].replace(/^(dr|dott|ing|sig)\.?\s+/i, "").trim(); if (plain[1]) out.role = plain[1];
  return out;
}
