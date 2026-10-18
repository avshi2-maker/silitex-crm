// util.ts (src/lib/expo/util.ts) · updated 18.10.2026 11:30 (Asia/Jerusalem) — EXPO helpers: phone-side image shrink, international WhatsApp number, vCard, CSV export (Excel-ready, UTF-8 BOM)
import type { ExpoMeeting, ExpoProfile } from "./store";
export async function shrink(f: File): Promise<string> {
  const img = await createImageBitmap(f); const k = Math.min(1, 1400 / Math.max(img.width, img.height));
  const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", 0.82);
}
/** WhatsApp number: keeps a printed country code (+ / 00); otherwise uses the user's own country code from her card (Israel drops the leading 0). */
export function waNumber(p: string, myPhone: string): string {
  const raw = p.trim(); const d = raw.replace(/\D/g, ""); if (!d) return "";
  if (raw.startsWith("+")) return d; if (d.startsWith("00")) return d.slice(2);
  const cc = (myPhone.trim().startsWith("+") ? (myPhone.replace(/\D/g, "").match(/^(972|39|1|44|49|33|34|41|43|7)/) || [""])[0] : "") || "39";
  return cc === "972" ? cc + d.replace(/^0/, "") : cc + d;
}
export function vcard(p: ExpoProfile): string {
  return ["BEGIN:VCARD", "VERSION:3.0", "N:" + p.last + ";" + p.first + ";;;", "FN:" + (p.first + " " + p.last).trim(), "ORG:" + p.company, p.title && "TITLE:" + p.title, p.phone && "TEL;TYPE=CELL:" + p.phone, p.email && "EMAIL:" + p.email, p.website && "URL:" + p.website, "END:VCARD"].filter(Boolean).join("\n");
}
const q = (v: string) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
export function meetingsCsv(ms: ExpoMeeting[], tr: (s: string) => string = (x) => x): string {
  const head = ["Date", "Company", "Contact", "Role", "Mobile", "Email", "Website", "City", "Industry", "Summary", "Products", "Next step", "Due", "Done", "Raw note"];
  const rows = ms.map((m) => [m.at.slice(0, 10).split("-").reverse().join("/"), m.company, m.contact_name, m.contact_role, m.phone, m.email, m.website, m.city, m.industry ? tr(m.industry) : "", m.summary, m.products.join(", "), m.next_step, m.due ? m.due.split("-").reverse().join("/") : "", m.done ? "yes" : "", m.note]);
  return "﻿" + [head, ...rows].map((r) => r.map(q).join(",")).join("\r\n");
}
export function meetingsText(ms: ExpoMeeting[]): string {
  return ms.map((m, i) => [(i + 1) + ". " + m.company + (m.contact_name ? " — " + m.contact_name : "") + (m.contact_role ? " (" + m.contact_role + ")" : ""), [m.phone, m.email].filter(Boolean).join(" · "), m.summary || m.note, m.next_step ? "→ " + m.next_step + (m.due ? " (" + m.due.split("-").reverse().join("/") + ")" : "") : ""].filter(Boolean).join("\n")).join("\n\n");
}
export function download(name: string, data: string, type: string) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name; a.click(); }
