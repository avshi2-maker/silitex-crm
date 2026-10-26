"use client";
// MailtoOutlook.tsx (src/components/MailtoOutlook.tsx) · updated 26.10.2026 06:00 (Asia/Jerusalem) — v0.94.0 opens a real draft in Outlook 365 (Drafts); .eml download only if Outlook fails · created 25.10.2026 v0.92.1
// App-wide Outlook fix: on a computer, every "mailto:" button that carries a text body (Outlook / ✉ buttons all over the CRM)
// now downloads a Hebrew-safe Outlook draft (.eml) instead — Outlook broke Hebrew mailto text into "&#1492;" garbage.
// Phones keep the normal mailto (their mail apps read Hebrew fine). Plain address links (mailto:x@y, no body) are untouched.
import { useEffect } from "react";
import { downloadEml, mailDoc, textToHtml } from "@/lib/eml";
import { outlookDraft } from "@/lib/outlook-draft";

export default function MailtoOutlook() {
  useEffect(() => {
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) return;
    const on = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='mailto:']") as HTMLAnchorElement | null; if (!a) return;
      const href = a.getAttribute("href") || ""; const q = href.indexOf("?"); if (q < 0) return;
      const p = new URLSearchParams(href.slice(q + 1).replace(/\+/g, "%2B")); const body = p.get("body") || ""; if (!body.trim()) return;
      e.preventDefault();
      const subject = p.get("subject") || "Sapirim · Silitex";
      const to = decodeURIComponent(href.slice(7, q)); const cc = p.get("cc") || "";
      const win = window.open("", "_blank");
      if (!win) { downloadEml({ to, cc, subject, text: body }, subject); return; }
      outlookDraft({ to, cc, subject, html: mailDoc(textToHtml(body)) }, win).catch(() => { try { win.close(); } catch { /* */ } downloadEml({ to, cc, subject, text: body }, subject); });
    };
    document.addEventListener("click", on, true);
    return () => document.removeEventListener("click", on, true);
  }, []);
  return null;
}
