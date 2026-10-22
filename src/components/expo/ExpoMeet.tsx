"use client";
// ExpoMeet.tsx (src/components/expo/ExpoMeet.tsx) · updated 22.10.2026 07:30 (Asia/Jerusalem) — e-mail / mobile / phone fields validated: green ✓ valid, red + hint invalid, amber when already used by another customer / contact (lib/validate.ts + ValidInput) · 18.10.2026 11:40 (Asia/Jerusalem) — EXPO paperless meeting for Silitex staff: scan business card (AI vision) · dictate (IT/EN/current language) or type · ✨ AI summary + next step + follow-up message in the user's language · save on HER phone only (works with no signal — summarize later from Contacts)
import { useRef, useState } from "react";
import TokenMeter from "@/components/TokenMeter";
import { inputCls } from "@/components/ui";
import { uid, todayIso, addDays, fmtDate } from "@/lib/format";
import { EXPO_INDUSTRIES } from "./ExpoAsk";
import { shrink, waNumber } from "@/lib/expo/util";
import type { Expo, ExpoMeeting } from "@/lib/expo/store";
import type { Usage } from "@/lib/types";
import { useLang } from "@/i18n";
import ValidInput from "@/components/ValidInput";
type Sum = { summary?: string; products?: string[]; next_step?: string; due_days?: number; followup_message?: string };
const EMPTY = { company: "", contact_name: "", contact_role: "", phone: "", email: "", website: "", city: "" };
type Rec = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; stop: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>; resultIndex: number }) => void; onend: () => void };
const MIC: Record<string, string> = { it: "it-IT", en: "en-US", he: "he-IL", ru: "ru-RU" };
/** shared by Meeting + Contacts ("summarize later") */
export async function expoSummarize(expo: Expo, m: { company: string; contact: string; industry: string; note: string }, lang: string): Promise<{ sum: Sum; usage?: Usage }> {
  const p = expo.state.profile; const signer = [(p.first + " " + p.last).trim(), p.company].filter(Boolean).join(" · ") || "Silitex S.r.l.";
  const r = await fetch("/api/field/note", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...m, mode: "expo", lang, signer }) });
  const j = await r.json(); if (j.usage) expo.addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); if (!r.ok) throw new Error(j.error || "AI error");
  return { sum: j.result as Sum, usage: j.usage };
}
export default function ExpoMeet({ expo, industry }: { expo: Expo; industry: string }) {
  const { t: tr, lang } = useLang();
  const { state, saveMeeting } = expo;
  const [f, setF] = useState({ ...EMPTY }); const [ind, setInd] = useState(industry); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(""); const [err, setErr] = useState(""); const [usage, setUsage] = useState<Usage | null>(null);
  const [sum, setSum] = useState<Sum | null>(null); const [due, setDue] = useState(addDays(todayIso(), 3));
  const [saved, setSaved] = useState<ExpoMeeting | null>(null);
  const [mic, setMic] = useState(""); const rec = useRef<Rec | null>(null);
  const set = (k: keyof typeof EMPTY) => (v: string) => setF({ ...f, [k]: v });
  const indName = EXPO_INDUSTRIES.find((i) => i.key === ind)?.he || "";
  const scan = async (file?: File | null) => {
    if (!file) return; setErr(""); setBusy("card");
    try {
      const r = await fetch("/api/field/card", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: await shrink(file) }) });
      const j = await r.json(); if (j.usage) { setUsage(j.usage); expo.addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); } if (!r.ok) throw new Error(j.error);
      const c = j.card as Record<string, string>;
      setF({ company: (c.company || "").trim() || f.company, contact_name: c.contact_name || "", contact_role: c.contact_role || "", phone: c.mobile || c.phone || "", email: c.email || "", website: c.website || "", city: c.city || "" });
      if (c.notes || c.address) setNote((n) => n || [c.address, c.notes].filter(Boolean).join(" · "));
    } catch (e) { setErr(tr("סריקה נכשלה: ") + (e instanceof Error ? e.message : "")); }
    setBusy("");
  };
  const listen = (code: string) => {
    const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const C = W.SpeechRecognition || W.webkitSpeechRecognition; if (!C) { setErr(tr("הדפדפן לא תומך בהכתבה — השתמש במיקרופון של המקלדת")); return; }
    if (rec.current) { rec.current.stop(); return; }
    const r = new C(); r.lang = code; r.interimResults = false; r.continuous = true;
    r.onresult = (e) => { let t = ""; for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript + " "; if (t) setNote((n) => (n ? n + " " : "") + t.trim()); };
    r.onend = () => { rec.current = null; setMic(""); }; rec.current = r; setMic(code); r.start();
  };
  const summarize = async () => {
    setErr(""); setBusy("ai");
    try { const { sum: s, usage: u } = await expoSummarize(expo, { company: f.company, contact: f.contact_name, industry: indName, note }, lang); if (u) setUsage(u); setSum(s); if (s.due_days) setDue(addDays(todayIso(), Math.min(30, Math.max(1, Number(s.due_days) || 3)))); }
    catch (e) { setErr(tr("AI לא זמין (אין קליטה?) — אפשר לשמור את ההערה כמו שהיא. ") + (e instanceof Error ? e.message : "")); }
    setBusy("");
  };
  const save = () => {
    if (!f.company.trim()) return setErr(tr("חובה: שם חברה"));
    const m: ExpoMeeting = { id: uid("EXPO"), at: new Date().toISOString(), ...f, company: f.company.trim(), industry: indName, note: note.trim(), summary: sum?.summary || "", products: sum?.products || [], next_step: sum?.next_step || "", due: sum?.next_step ? due : "", done: false, followup: sum?.followup_message || "" };
    saveMeeting(m); setSaved(m); setF({ ...EMPTY }); setNote(""); setSum(null); setErr("");
  };
  const big = "w-full py-3 rounded-xl text-base font-medium";
  if (saved) {
    const m = saved.followup; const ph = waNumber(saved.phone, state.profile.phone);
    return (
      <div className="bg-white border rounded-2xl p-4 space-y-3">
        <div className="text-lg font-bold">✓ {tr("נשמר:")} {saved.company}</div>
        <div className="text-xs text-slate-500">{tr("נשמר רק בטלפון שלך. הכל ברשימת אנשי הקשר — עם ייצוא ל-Excel ולמייל.")}</div>
        {m && <textarea className={inputCls} rows={4} defaultValue={m} />}
        <div className="grid grid-cols-2 gap-2">
          {ph && <a className={big + " text-center bg-green-600 text-white"} href={"https://wa.me/" + ph + "?text=" + encodeURIComponent(m)} target="_blank" rel="noreferrer">💬 WhatsApp</a>}
          {saved.email && <a className={big + " text-center bg-ink-900 text-white"} href={"mailto:" + saved.email + "?subject=" + encodeURIComponent("Silitex — " + saved.company) + "&body=" + encodeURIComponent(m)}>✉️ {tr("מייל")}</a>}
        </div>
        <button className={big + " border"} onClick={() => setSaved(null)}>+ {tr("פגישה הבאה")}</button>
      </div>
    );
  }
  const micBtn = (code: string, label: string) => <button key={code} className={big + " " + (mic === code ? "bg-red-600 text-white" : "border")} onClick={() => listen(code)}>🎙 {mic === code ? tr("עצור") : label}</button>;
  const mics = Array.from(new Set([MIC[lang] || "en-US", "it-IT", "en-US"])).slice(0, 2);
  const MIC_LABEL: Record<string, string> = { "it-IT": "Italiano", "en-US": "English", "he-IL": "עברית", "ru-RU": "Русский" };
  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-2xl p-3 space-y-2">
        <label className={big + " block text-center bg-brand-500 text-white cursor-pointer"}>{busy === "card" ? tr("קורא כרטיס…") : "📷 " + tr("צלם כרטיס ביקור")}<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => scan(e.target.files?.[0])} /></label>
        <input className={inputCls + " text-base"} placeholder={tr("חברה *")} value={f.company} onChange={(e) => set("company")(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} placeholder={tr("איש קשר")} value={f.contact_name} onChange={(e) => set("contact_name")(e.target.value)} />
          <input className={inputCls} placeholder={tr("תפקיד")} value={f.contact_role} onChange={(e) => set("contact_role")(e.target.value)} />
          <ValidInput kind="mobile" placeholder={tr("נייד")} value={f.phone} onChange={(v) => set("phone")(v)} />
          <ValidInput kind="email" placeholder={tr("אימייל")} value={f.email} onChange={(v) => set("email")(v)} />
        </div>
        <select className={inputCls} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">{tr("תעשייה")}</option>{EXPO_INDUSTRIES.map((i) => <option key={i.key} value={i.key}>{tr(i.he)}</option>)}</select>
      </div>
      <div className="bg-white border rounded-2xl p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">{mics.map((c) => micBtn(c, MIC_LABEL[c] || c))}</div>
        <textarea className={inputCls + " text-base"} rows={5} placeholder={tr("הערות מהפגישה — מוצר בשימוש, ספק, כמויות, מחיר יעד, מה הובטח")} value={note} onChange={(e) => setNote(e.target.value)} />
        <button className={big + " bg-ink-900 text-white disabled:opacity-40"} disabled={note.trim().length < 5 || busy === "ai"} onClick={summarize}>{busy === "ai" ? tr("מסכם…") : "✨ " + tr("סכם + צעד הבא")}</button>
        <TokenMeter usage={usage} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} busy={!!busy} />
        {sum && (
          <div className="space-y-2 border-t pt-2">
            <textarea className={inputCls} rows={4} value={sum.summary || ""} onChange={(e) => setSum({ ...sum, summary: e.target.value })} />
            <input className={inputCls} value={sum.next_step || ""} onChange={(e) => setSum({ ...sum, next_step: e.target.value })} placeholder={tr("הצעד הבא")} />
            <input type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} />
            <div className="text-xs text-slate-500">{tr("משימה ב-")}{fmtDate(due)}{sum.products?.length ? " · " + sum.products.join(", ") : ""}</div>
          </div>
        )}
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className={big + " bg-brand-500 text-white"} onClick={save}>💾 {tr("שמור פגישה")}</button>
        <div className="text-[11px] text-slate-400 text-center">{tr("בלי קליטה? שמור עכשיו — אפשר לסכם אחר כך מרשימת אנשי הקשר.")}</div>
      </div>
    </div>
  );
}
