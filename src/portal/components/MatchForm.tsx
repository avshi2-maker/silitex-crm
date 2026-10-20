"use client";
// MatchForm.tsx (src/portal/components/MatchForm.tsx) · created 20.10.2026 18:30 (Asia/Jerusalem) — PUBLIC free-match-report form: company, website, name, e-mail, mobile, industry, notes, consent; live validation (green / red), send blocked until valid → /api/forms kind "match" (e-mail to Avshi + stored for the CRM review panel).
import { useState } from "react";
import type { PLang } from "../config";
import { MT, WEB_RE, MAIL_RE, PHONE_RE, cleanPhone, normWeb } from "../match";
type Opt = { key: string; name: string };
function L({ t, req, children }: { t: string; req?: boolean; children: React.ReactNode }) { return <label className="block text-sm text-slate-600 space-y-1"><span>{t}{req && " *"}</span>{children}</label>; }
const box = (ok: boolean | null) => "w-full border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 " + (ok === true ? "border-emerald-500 bg-emerald-50 focus:ring-emerald-500" : ok === false ? "border-red-400 bg-red-50 focus:ring-red-400" : "focus:ring-amber-400");
export default function MatchForm({ lang, industries }: { lang: PLang; industries: Opt[] }) {
  const m = (k: string) => MT[k][lang];
  const [f, setF] = useState({ company: "", website: "", name: "", email: "", phone: "", industry: "", notes: "" }); const [agree, setAgree] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const webOk = f.website ? WEB_RE.test(f.website.trim()) : null; const mailOk = f.email ? MAIL_RE.test(f.email.trim()) : null; const phoneOk = f.phone ? PHONE_RE.test(cleanPhone(f.phone)) : null;
  const can = !!f.company.trim() && !!f.name.trim() && webOk === true && mailOk === true && phoneOk === true && agree && state !== "busy";
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); if (!can) return; setState("busy");
    const ind = industries.find((i) => i.key === f.industry);
    try {
      const r = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "match", company: f.company.trim(), name: f.name.trim(), email: f.email.trim(), phone: cleanPhone(f.phone), message: f.notes, lang, fields: { website: normWeb(f.website), industry_key: f.industry || "other", industry: ind?.name || m("other") } }) });
      const j = await r.json(); setState(r.ok && j.ok ? "ok" : "err");
    } catch { setState("err"); }
  };
  if (state === "ok") return <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-5 text-lg">✓ {m("ok")}</div>;
  return (
    <form onSubmit={send} className="rounded-2xl border bg-white p-5 grid md:grid-cols-2 gap-4">
      <L t={m("company")} req><input className={box(f.company ? true : null)} value={f.company} onChange={set("company")} required /></L>
      <L t={m("website")} req><input dir="ltr" className={box(webOk)} value={f.website} onChange={set("website")} placeholder="www.company.co.il" required />{webOk === false && <span className="block text-xs text-red-600">{m("badWeb")}</span>}</L>
      <L t={m("name")} req><input className={box(f.name ? true : null)} value={f.name} onChange={set("name")} required /></L>
      <L t={m("industry")}><select className={box(null)} value={f.industry} onChange={set("industry")}><option value="">—</option>{industries.map((i) => <option key={i.key} value={i.key}>{i.name}</option>)}<option value="other">{m("other")}</option></select></L>
      <L t={m("email")} req><input dir="ltr" type="email" className={box(mailOk)} value={f.email} onChange={set("email")} required />{mailOk === false && <span className="block text-xs text-red-600">{m("badMail")}</span>}</L>
      <L t={m("phone")} req><input dir="ltr" type="tel" className={box(phoneOk)} value={f.phone} onChange={set("phone")} placeholder="050-0000000" required />{phoneOk === false && <span className="block text-xs text-red-600">{m("badPhone")}</span>}</L>
      <div className="md:col-span-2"><L t={m("notes")}><textarea rows={3} className={box(null)} value={f.notes} onChange={set("notes")} /></L></div>
      <label className="md:col-span-2 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 w-5 h-5" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> <span>{m("consent")}</span></label>
      <div className="md:col-span-2 flex flex-wrap items-center gap-3">
        <button disabled={!can} className="px-6 py-3 rounded-xl bg-ink-900 text-amber-300 font-bold disabled:opacity-40">{state === "busy" ? m("sending") : "🎁 " + m("send")}</button>
        {state === "err" && <span className="text-sm text-red-600">{m("err")}</span>}
        <span className="text-xs text-slate-500">{m("privacy")}</span>
      </div>
    </form>
  );
}
