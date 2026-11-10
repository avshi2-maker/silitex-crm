"use client";
// ProjectActions.tsx (src/components/projects/ProjectActions.tsx) · created 10.11.2026 13:20 (Asia/Jerusalem) — v1.9.8 📁 mail / WhatsApp that carry the project number
// ✉ Silitex: Outlook draft TO / CC = project team, subject "[#SPR-0002 · v1] …" (English body, you edit + press Send).
// 📱 Customer: WhatsApp opens with "פרויקט #SPR-0002 · v1 — " so the customer sees the same number.
import { useState } from "react";
import { Card, btnPrimary, btnGhost, inputCls } from "@/components/ui";
import { outlookDraft } from "@/lib/outlook-draft";
import { splitMail } from "@/lib/mail-text";
import { stampSubject, waOpening, refLabel } from "@/lib/projects";
import { useLang } from "@/i18n";
import type { Project, Lead } from "@/lib/types";

/** 050-523… / +972 50… → 97250523… (wa.me) */
const normWa = (p?: string) => { let d = String(p || "").replace(/\D/g, ""); if (d.startsWith("00")) d = d.slice(2); if (d.startsWith("0")) d = "972" + d.slice(1); return d.length >= 9 ? d : ""; };
type Props = { p: Project; lead?: Lead; onLog: (text: string) => void };
export default function ProjectActions({ p, lead, onLog }: Props) {
  const { t: tr } = useLang(); const [err, setErr] = useState(""); const [ok, setOk] = useState("");
  const to = p.team.filter((m) => m.role === "to").map((m) => m.email).join(";"); const cc = p.team.filter((m) => m.role === "cc").map((m) => m.email).join(";");
  const first = (p.team.find((m) => m.role === "to")?.name || "").split(" ")[0];
  const latin = (x: string) => x.replace(/\(WhatsApp\)/g, "").replace(/[\u0590-\u05ff״׳]+/g, " ").replace(/\s+/g, " ").replace(/^[\s·—-]+|[\s·—-]+$/g, ""); // Silitex mails are English only
  const cust = latin(p.lead_name) || "Israeli customer"; const req = latin(p.request).slice(0, 90);
  const [subj, setSubj] = useState(stampSubject("Israel — " + cust + (req ? " — " + req : ""), p));
  const [wa, setWa] = useState(waOpening(p));
  const phone = normWa(lead?.contact_phone);
  const mail = async () => {
    setErr(""); setOk(""); const win = window.open("", "_blank"); if (!win) return setErr(tr("הדפדפן חסם חלון — אפשר חלונות קופצים לאתר"));
    const body = "Dear " + (first || "all") + ",\n\nProject " + refLabel(p) + " — customer: " + cust + "\n" + (latin(p.request) ? "Request: " + latin(p.request) + "\n" : "") + "\n\n\nBest regards,\nAvshi Sapir\nSapirim — Silitex Israel\n+972 50 523 1042 · avshi@sapirim.com";
    try { const m = splitMail("Subject: " + stampSubject(subj, p) + "\n\n" + body, subj); await outlookDraft({ to, cc, subject: m.subject, html: m.html }, win); onLog("✉ " + tr("טיוטה לצוות Silitex") + ": " + m.subject); setOk("✓ " + tr("טיוטה מוכנה ב-Outlook")); }
    catch (e) { try { win.close(); } catch { /* */ } setErr(e instanceof Error ? e.message : "error"); }
  };
  const sendWa = () => { const text = wa.startsWith(waOpening(p)) ? wa : waOpening(p) + wa; window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(text), "_blank"); onLog("📱 WhatsApp " + tr("ללקוח") + ": " + text.slice(0, 140)); };
  return (
    <Card className="space-y-3">
      <h3 className="font-bold">{tr("לשלוח עם מספר הפרויקט")}</h3>
      <div className="space-y-1">
        <div className="text-xs text-slate-500">✉ {tr("מייל לצוות Silitex")} <span dir="ltr">· TO {to || "—"}{cc ? " · CC " + cc.replace(/;/g, ", ") : ""}</span></div>
        <input className={inputCls} dir="ltr" value={subj} onChange={(e) => setSubj(e.target.value)} aria-label={tr("נושא")} />
        <button type="button" className={btnPrimary} disabled={!to} onClick={mail}>✉ {tr("טיוטה ב-Outlook")}</button>
      </div>
      <div className="space-y-1 border-t pt-3">
        <div className="text-xs text-slate-500">📱 WhatsApp {tr("ללקוח")} {phone ? <span dir="ltr">+{phone}</span> : <span className="text-amber-700">— {tr("אין נייד בכרטיס הלקוח")}</span>}</div>
        <textarea className={inputCls} rows={3} value={wa} onChange={(e) => setWa(e.target.value)} aria-label="WhatsApp" />
        <button type="button" className={btnGhost + " min-h-[44px]"} disabled={!phone} onClick={sendWa}>📱 {tr("פתח WhatsApp")}</button>
      </div>
      {err && <div className="text-sm text-red-600">{err}</div>}{ok && <div className="text-sm text-emerald-700">{ok}</div>}
    </Card>
  );
}
