"use client";
// page.tsx (src/app/(public)/request/page.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — customer quick form: technical / sample / price → /api/forms → email + DB
import { useState } from "react";
import PublicShell from "@/components/PublicShell";
import { Text, Area, Select } from "@/components/FormField";
import { Card, btnPrimary } from "@/components/ui";
import { PRODUCTS } from "@/lib/data";
import { useLang } from "@/i18n";
const KINDS = [{ k: "technical", he: "בקשה טכנית", icon: "🧪" }, { k: "sample", he: "בקשת דגימה", icon: "📦" }, { k: "price", he: "מידע על מחיר", icon: "💶" }] as const;
export default function RequestPage() {
  const { t: tr, lang } = useLang();
  const [kind, setKind] = useState<(typeof KINDS)[number]["k"]>("technical");
  const [f, setF] = useState({ company: "", name: "", email: "", phone: "", product: PRODUCTS[0].product_name, qty: "", application: "", message: "" });
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle"); const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setState("busy");
    try {
      const r = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, company: f.company, name: f.name, email: f.email, phone: f.phone, product: f.product, message: f.message, lang, fields: { quantity: f.qty, application: f.application } }) });
      const j = await r.json(); if (!r.ok || !j.ok) throw new Error(j.error || j.mail?.error || "not delivered");
      setState("ok");
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "error"); setState("err"); }
  };
  if (state === "ok") return <PublicShell title={tr("תודה! הבקשה התקבלה")}><Card>{tr("נחזור אליך תוך יום עסקים אחד. אפשר גם ב-WhatsApp: 050-5231042")}</Card></PublicShell>;
  return (
    <PublicShell title={tr("Silitex ישראל — טופס פנייה מהיר")} sub={tr("בקשה טכנית · דגימה · מחיר — תשובה תוך יום עסקים")}>
      <div className="flex gap-2 mb-4">{KINDS.map((k) => <button key={k.k} type="button" onClick={() => setKind(k.k)} className={"flex-1 border rounded-xl p-3 text-sm " + (kind === k.k ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{k.icon} {tr(k.he)}</button>)}</div>
      <form onSubmit={submit}><Card className="grid md:grid-cols-2 gap-3">
        <Text label={tr("חברה")} value={f.company} onChange={set("company")} required /><Text label={tr("שם מלא")} value={f.name} onChange={set("name")} required />
        <Text label={tr("אימייל")} value={f.email} onChange={set("email")} type="email" required /><Text label={tr("נייד")} value={f.phone} onChange={set("phone")} type="tel" required />
        <Select label={tr("מוצר")} value={f.product} onChange={set("product")} options={PRODUCTS.map((p) => p.product_name)} />
        <Text label={kind === "sample" ? tr("כמות דגימה (ק\"ג)") : tr("כמות שנתית משוערת (טון)")} value={f.qty} onChange={set("qty")} />
        <div className="md:col-span-2"><Text label={tr("יישום / תהליך")} value={f.application} onChange={set("application")} placeholder={tr("למשל: קצף במיכלי תסיסה, pH 4, 35°C")} /></div>
        <div className="md:col-span-2"><Area label={tr("פרטים נוספים")} value={f.message} onChange={set("message")} /></div>
        <div className="md:col-span-2 flex items-center justify-between"><span className="text-xs text-red-600">{state === "err" && tr("שליחה נכשלה: ") + err}</span><button className={btnPrimary} disabled={state === "busy"}>{state === "busy" ? tr("שולח…") : tr("שלח בקשה")}</button></div>
      </Card></form>
    </PublicShell>
  );
}
