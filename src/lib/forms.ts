// forms.ts (src/lib/forms.ts) · updated 20.10.2026 18:40 — storeSubmission returns the row id + updateFields (automatic match run) · 18:30 — + "match" (free match report) kind · 09.10.2026 19:05 (Asia/Jerusalem) — server only
// Customer forms (technical / sample / price / survey): email via Resend (RESEND_API_KEY, FORMS_TO, FORMS_FROM) + Supabase form_submissions when configured.
import { serviceClient } from "./server-data";
export type FormKind = "technical" | "sample" | "price" | "survey" | "match";
export type Submission = { kind: FormKind; company: string; name: string; email: string; phone?: string; product?: string; message?: string; fields?: Record<string, unknown>; lang?: string };
const TO = process.env.FORMS_TO || "avshi@sapirim.com";
const FROM = process.env.FORMS_FROM || "Silitex Israel <onboarding@resend.dev>";
export function render(s: Submission): { subject: string; html: string; text: string } {
  const title: Record<FormKind, string> = { technical: "Technical request", sample: "Sample request", price: "Price information", survey: "Customer satisfaction survey", match: "🎁 FREE MATCH REPORT request — review in CRM → /scan" };
  const rows = [["Company", s.company], ["Name", s.name], ["Email", s.email], ["Phone", s.phone || ""], ["Product", s.product || ""], ...Object.entries(s.fields || {}).filter(([, v]) => typeof v !== "object").map(([k, v]) => [k, String(v)]), ["Message", s.message || ""]].filter(([, v]) => v);
  const text = rows.map(([k, v]) => k + ": " + v).join("\n");
  const html = "<h2 style='font-family:Arial'>" + title[s.kind] + " — " + s.company + "</h2><table style='font-family:Arial;font-size:14px'>" + rows.map(([k, v]) => "<tr><td style='color:#666;padding:4px 12px 4px 0'>" + k + "</td><td>" + String(v).replace(/</g, "&lt;").replace(/\n/g, "<br>") + "</td></tr>").join("") + "</table><p style='color:#999;font-size:12px'>silitex.marble-art.co.il · " + new Date().toLocaleString("en-GB", { timeZone: "Asia/Jerusalem" }) + "</p>";
  return { subject: "[Silitex CRM] " + title[s.kind] + " — " + s.company, html, text };
}
export async function sendEmail(s: Submission): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY; if (!key) return { sent: false, error: "RESEND_API_KEY missing" };
  const { subject, html, text } = render(s);
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to: [TO], reply_to: s.email, subject, html, text }) });
  return r.ok ? { sent: true } : { sent: false, error: await r.text() };
}
/** inserts the request; returns the new row id (null = not stored) */
export async function storeSubmission(s: Submission): Promise<number | null> {
  const sb = serviceClient(); if (!sb) return null;
  const r = await sb.from("form_submissions").insert({ kind: s.kind, company: s.company, name: s.name, email: s.email, phone: s.phone, product: s.product, message: s.message, fields: s.fields || {}, lang: s.lang }).select("id").single();
  return r.error ? null : (r.data?.id as number) ?? null;
}
export async function updateFields(id: number, fields: Record<string, unknown>): Promise<boolean> {
  const sb = serviceClient(); if (!sb) return false;
  const r = await sb.from("form_submissions").update({ fields }).eq("id", id); return !r.error;
}
