"use client";
// page.tsx (src/app/(public)/request/page.tsx) · updated 20.10.2026 18:05 (Asia/Jerusalem) — "back to Sapirim site" link · 17:40 — mobile + e-mail validated live (green when correct, red with hint), send blocked until both are valid · 09.10.2026 18:30 — customer quick form: technical / sample / price → /api/forms → email + DB
import { useState } from "react";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { Text, Area, Select } from "@/components/FormField";
import { Card, btnPrimary } from "@/components/ui";
import { PRODUCTS } from "@/lib/data";
import { useLang } from "@/i18n";
const PHONE_RE = /^(?:\+?972|0)5\d{8}$/; const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const cleanPhone = (s: string) => s.replace(/[\s\-()]/g, "");
const KINDS = [{ k: "technical", he: "בקשה טכנית", icon: "🧪" }, { k: "sample", he: "בקשת דגימה", icon: "📦" }, { k: "price", he: "מידע על מחיר", icon: "💶" }] as const;
export default function RequestPage() {
  const { t: tr, lang } = useLang();
  const [kind, setKind] = useState<(typeof KINDS)[number]["k"]>("technical");
  const [f, setF] = useState({ company: "", name: "", email: "", phone: "", product: PRODUCTS[0].product_name, qty: "", application: "", message: "" });
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle"); const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });
  const phoneOk = f.phone ? PHONE_RE.test(cleanPhone(f.phone)) : null; const emailOk = f.email ? EMAIL_RE.test(f.email.trim()) : null; const canSend = phoneOk === true && emailOk === true;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!canSend) return; setState("busy");
    try {
      const r = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, company: f.company, name: f.name, email: f.email.trim(), phone: cleanPhone(f.phone), product: f.product, message: f.message, lang, fields: { quantity: f.qty, application: f.application } }) });
      const j = await r.json(); if (!r.ok || !j.ok) throw new Error(j.error || j.mail?.error || "not delivered");
      setState("ok");
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "error"); setState("err"); }
  };
  if (state === "ok") return <PublicShell title={tr("תודה! הבקשה התקבלה")}><Card>{tr("נחזור אליך תוך יום עסקים אחד. אפשר גם ב-WhatsApp: 050-5231042")}</Card></PublicShell>;
  return (
    <PublicShell title={tr("Silitex ישראל — טופס פנייה מהיר")} sub={tr("בקשה טכנית · דגימה · מחיר — תשובה תוך יום עסקים")}>
      <Link href={"/" + (["he", "en", "ru", "it"].includes(lang) ? lang : "he")} className="inline-flex items-center gap-1 mb-4 px-3 py-1.5 rounded-lg bg-ink-900 text-amber-300 text-sm font-semibold hover:bg-ink-700">{tr("← חזרה לאתר ספירים")}</Link>
      <div className="flex gap-2 mb-4">{KINDS.map((k) => <button key={k.k} type="button" onClick={() => setKind(k.k)} className={"flex-1 border rounded-xl p-3 text-sm " + (kind === k.k ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{k.icon} {tr(k.he)}</button>)}</div>
      <form onSubmit={submit}><Card className="grid md:grid-cols-2 gap-3">
        <Text label={tr("חברה")} value={f.company} onChange={set("company")} required /><Text label={tr("שם מלא")} value={f.name} onChange={set("name")} required />
        <Text label={tr("אימייל")} value={f.email} onChange={set("email")} type="email" dir="ltr" required valid={emailOk} hint={tr("כתובת מייל לא תקינה — לדוגמה name@company.co.il")} /><Text label={tr("נייד")} value={f.phone} onChange={set("phone")} type="tel" dir="ltr" required valid={phoneOk} hint={tr("מספר נייד לא תקין — 10 ספרות, מתחיל ב-05")} placeholder="050-0000000" />
        <Select label={tr("מוצר")} value={f.product} onChange={set("product")} options={PRODUCTS.map((p) => p.product_name)} />
        <Text label={kind === "sample" ? tr("כמות דגימה (ק\"ג)") : tr("כמות שנתית משוערת (טון)")} value={f.qty} onChange={set("qty")} />
        <div className="md:col-span-2"><Text label={tr("יישום / תהליך")} value={f.application} onChange={set("application")} placeholder={tr("למשל: קצף במיכלי תסיסה, pH 4, 35°C")} /></div>
        <div className="md:col-span-2"><Area label={tr("פרטים נוספים")} value={f.message} onChange={set("message")} /></div>
        <div className="md:col-span-2 flex items-center justify-between"><span className="text-xs text-red-600">{state === "err" && tr("שליחה נכשלה: ") + err}</span><button className={btnPrimary} disabled={state === "busy" || !canSend} title={canSend ? "" : tr("יש למלא נייד ומייל תקינים")}>{state === "busy" ? tr("שולח…") : tr("שלח בקשה")}</button></div>
      </Card></form>
    </PublicShell>
  );
}
