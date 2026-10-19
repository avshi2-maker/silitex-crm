// partner-feedback.ts (src/lib/partner-feedback.ts) · updated 19.10.2026 12:05 (Asia/Jerusalem) — + deleteFeedback (owner) · 13.10.2026 07:20 — server only. "Ask Sapirim" notes from Silitex partners: Supabase partner_feedback + email via Resend to FORMS_TO (avshi@sapirim.com). Owner can mark replied.
import { serviceClient } from "./server-data";
export type Feedback = { partner: string; page: string; topic?: string; message: string; lang?: string };
const TO = process.env.FORMS_TO || "avshi@sapirim.com";
const FROM = process.env.FORMS_FROM || "Silitex Israel <onboarding@resend.dev>";
export async function storeFeedback(f: Feedback): Promise<number | null> {
  const sb = serviceClient(); if (!sb) return null;
  const { data, error } = await sb.from("partner_feedback").insert({ partner: f.partner, page: f.page, topic: f.topic || null, message: f.message, lang: f.lang || null }).select("id").single();
  if (error) { console.warn("partner_feedback", error.message); return null; }
  return data?.id ?? null;
}
export async function emailFeedback(f: Feedback): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY; if (!key) return { sent: false, error: "RESEND_API_KEY missing" };
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://silitex.marble-art.co.il";
  const subject = "[Silitex partner] " + f.partner + " asks on " + f.page + (f.topic ? " — " + f.topic : "");
  const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));
  const html = "<div style='font-family:Arial;font-size:14px'><h2>Ask Sapirim — " + esc(f.partner) + "</h2><p><b>Page:</b> <a href='" + site + f.page + "'>" + esc(f.page) + "</a><br/><b>Topic:</b> " + esc(f.topic || "—") + "</p><p style='white-space:pre-wrap;border-left:3px solid #E2007A;padding-left:12px'>" + esc(f.message) + "</p><p style='color:#666'>Reply from <a href='" + site + "/partners'>/partners</a> · answer her by email and mark as replied.</p></div>";
  const text = "Ask Sapirim — " + f.partner + "\nPage: " + site + f.page + "\nTopic: " + (f.topic || "—") + "\n\n" + f.message;
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to: [TO], subject, html, text }) });
  return r.ok ? { sent: true } : { sent: false, error: await r.text() };
}
export async function listFeedback() {
  const sb = serviceClient(); if (!sb) return [];
  const { data } = await sb.from("partner_feedback").select("id, at, partner, page, topic, message, lang, replied_at").order("at", { ascending: false }).limit(200);
  return data || [];
}
export async function markReplied(id: number, on: boolean) {
  const sb = serviceClient(); if (!sb) return false;
  const { error } = await sb.from("partner_feedback").update({ replied_at: on ? new Date().toISOString() : null }).eq("id", id);
  return !error;
}
export async function deleteFeedback(id: number) {
  const sb = serviceClient(); if (!sb) return false;
  const { error } = await sb.from("partner_feedback").delete().eq("id", id);
  return !error;
}
