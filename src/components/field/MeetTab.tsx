"use client";
// MeetTab.tsx (src/components/field/MeetTab.tsx) · updated 18.10.2026 06:55 (Asia/Jerusalem) — paperless meeting capture: scan business card (AI vision) or pick a customer · dictate / type note · ✨ AI summary + next step + follow-up message · save = lead + log + task (works offline: saved on the phone, synced later)
import { useRef, useState } from "react";
import { useStore, STAGES } from "@/lib/store";
import TokenMeter from "@/components/TokenMeter";
import { inputCls } from "@/components/ui";
import { uid, todayIso, addDays, fmtDate } from "@/lib/format";
import { FIELD_INDUSTRIES } from "./AskTab";
import type { Lead, Stage, Usage } from "@/lib/types";
import { useLang } from "@/i18n";
type Sum = { summary?: string; products?: string[]; next_step?: string; due_days?: number; stage?: string; followup_message?: string };
const EMPTY = { leadId: "", company: "", contact_name: "", contact_role: "", phone: "", email: "", website: "", city: "" };
async function shrink(f: File): Promise<string> {
  const img = await createImageBitmap(f); const k = Math.min(1, 1400 / Math.max(img.width, img.height));
  const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", 0.82);
}
const wa = (p: string) => { const d = p.replace(/\D/g, ""); return d ? (d.startsWith("0") ? "972" + d.slice(1) : d) : ""; };
type Rec = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; stop: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>; resultIndex: number }) => void; onend: () => void };
export default function MeetTab({ industry }: { industry: string }) {
  const { t: tr } = useLang();
  const { state, upsertLead, addActivity, addTask, addSpend } = useStore();
  const [f, setF] = useState({ ...EMPTY }); const [ind, setInd] = useState(industry); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(""); const [err, setErr] = useState(""); const [usage, setUsage] = useState<Usage | null>(null);
  const [sum, setSum] = useState<Sum | null>(null); const [due, setDue] = useState(addDays(todayIso(), 3)); const [stage, setSt] = useState<Stage>("contacted");
  const [saved, setSaved] = useState<{ lead: Lead; msg: string } | null>(null);
  const [mic, setMic] = useState(""); const rec = useRef<Rec | null>(null);
  const set = (k: keyof typeof EMPTY) => (v: string) => setF({ ...f, [k]: v });
  const meter = (u?: Usage) => { if (u) { setUsage(u); addSpend(u.input_tokens + u.output_tokens, u.cost_usd); } };
  const pick = (id: string) => { const l = state.leads.find((x) => x.id === id); if (!l) return setF({ ...EMPTY }); setF({ leadId: l.id, company: l.name, contact_name: l.contact_name || "", contact_role: l.contact_role || "", phone: l.contact_phone || "", email: l.contact_email || "", website: l.website || "", city: l.city || "" }); setSt(l.stage === "prospect" ? "contacted" : l.stage); };
  const scan = async (file?: File | null) => {
    if (!file) return; setErr(""); setBusy("card");
    try {
      const r = await fetch("/api/field/card", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: await shrink(file) }) });
      const j = await r.json(); meter(j.usage); if (!r.ok) throw new Error(j.error);
      const c = j.card as Record<string, string>; const name = (c.company || "").trim();
      const ex = name ? state.leads.find((l) => l.name.trim().toLowerCase() === name.toLowerCase()) : undefined;
      setF({ leadId: ex?.id || "", company: name || f.company, contact_name: c.contact_name || "", contact_role: c.contact_role || "", phone: c.mobile || c.phone || "", email: c.email || "", website: c.website || "", city: c.city || "" });
      if (c.notes || c.address) setNote((n) => n || [c.address, c.notes].filter(Boolean).join(" · "));
    } catch (e) { setErr(tr("סריקה נכשלה: ") + (e instanceof Error ? e.message : "")); }
    setBusy("");
  };
  const listen = (lang: string) => {
    const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const C = W.SpeechRecognition || W.webkitSpeechRecognition; if (!C) { setErr(tr("הדפדפן לא תומך בהכתבה — השתמש במיקרופון של המקלדת")); return; }
    if (rec.current) { rec.current.stop(); return; }
    const r = new C(); r.lang = lang; r.interimResults = false; r.continuous = true;
    r.onresult = (e) => { let t = ""; for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript + " "; if (t) setNote((n) => (n ? n + " " : "") + t.trim()); };
    r.onend = () => { rec.current = null; setMic(""); }; rec.current = r; setMic(lang); r.start();
  };
  const summarize = async () => {
    setErr(""); setBusy("ai");
    try {
      const r = await fetch("/api/field/note", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company: f.company, contact: f.contact_name, industry: FIELD_INDUSTRIES.find((i) => i.key === ind)?.he || "", note }) });
      const j = await r.json(); meter(j.usage); if (!r.ok) throw new Error(j.error);
      const s = j.result as Sum; setSum(s); if (s.due_days) setDue(addDays(todayIso(), Math.min(30, Math.max(1, Number(s.due_days) || 3))));
      if (s.stage && STAGES.some((x) => x.key === s.stage)) setSt(s.stage as Stage);
    } catch (e) { setErr(tr("AI לא זמין (אין קליטה?) — אפשר לשמור את ההערה כמו שהיא. ") + (e instanceof Error ? e.message : "")); }
    setBusy("");
  };
  const save = () => {
    if (!f.company.trim()) return setErr(tr("חובה: שם חברה"));
    const prev = state.leads.find((l) => l.id === f.leadId);
    const indHe = FIELD_INDUSTRIES.find((i) => i.key === ind)?.he;
    const lead: Lead = { ...(prev || { id: uid("LEAD"), sub_industry: "", product_match: "", use_case: "", volume_tons: 0, value_usd: 0, tier: "Tier 3 - New", department: "", status: "new", stage: "prospect" as Stage, source: "תערוכה / ביקור" }),
      name: f.company.trim(), industry: prev?.industry || indHe || "אחר", contact_name: f.contact_name || prev?.contact_name, contact_role: f.contact_role || prev?.contact_role || "", contact_phone: f.phone || prev?.contact_phone, contact_email: f.email || prev?.contact_email, website: f.website || prev?.website, city: f.city || prev?.city,
      product_match: prev?.product_match || (sum?.products || []).join(", "), next_action_at: sum?.next_step ? due : prev?.next_action_at, stage } as Lead;
    upsertLead(lead);
    addActivity(lead.id, "visit", (sum?.summary || note || tr("פגישה")).trim());
    if (sum?.next_step) addTask({ lead_id: lead.id, lead_name: lead.name, title: sum.next_step, due, cadence: "once", kind: "followup" });
    if (stage !== (prev?.stage || "prospect")) addActivity(lead.id, "stage", "שלב עודכן: " + (STAGES.find((x) => x.key === stage)?.he || stage));
    setSaved({ lead, msg: sum?.followup_message || "" }); setF({ ...EMPTY }); setNote(""); setSum(null);
  };
  const big = "w-full py-3 rounded-xl text-base font-medium";
  if (saved) {
    const m = saved.msg; const ph = saved.lead.contact_phone || ""; const em = saved.lead.contact_email || "";
    return (
      <div className="bg-white border rounded-2xl p-4 space-y-3">
        <div className="text-lg font-bold">✓ {tr("נשמר:")} {saved.lead.name}</div>
        <div className="text-xs text-slate-500">{tr("לקוח + תיעוד + משימה. בלי קליטה — נשמר בטלפון ויסונכרן אוטומטית.")}</div>
        {m && <textarea className={inputCls} rows={4} defaultValue={m} id="fu" />}
        <div className="grid grid-cols-2 gap-2">
          {ph && <a className={big + " text-center bg-green-600 text-white"} href={"https://wa.me/" + wa(ph) + "?text=" + encodeURIComponent(m)} target="_blank" rel="noreferrer">💬 WhatsApp</a>}
          {em && <a className={big + " text-center bg-ink-900 text-white"} href={"mailto:" + em + "?subject=" + encodeURIComponent("Sapirim · Silitex — " + saved.lead.name) + "&body=" + encodeURIComponent(m)}>✉️ {tr("מייל")}</a>}
        </div>
        <button className={big + " border"} onClick={() => setSaved(null)}>+ {tr("פגישה הבאה")}</button>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-2xl p-3 space-y-2">
        <label className={big + " block text-center bg-brand-500 text-white cursor-pointer"}>{busy === "card" ? tr("קורא כרטיס…") : "📷 " + tr("צלם כרטיס ביקור")}<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => scan(e.target.files?.[0])} /></label>
        <select className={inputCls + " text-base"} value={f.leadId} onChange={(e) => pick(e.target.value)}><option value="">{tr("— או בחר לקוח קיים —")}</option>{[...state.leads].sort((a, b) => a.name.localeCompare(b.name)).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
        <input className={inputCls + " text-base"} placeholder={tr("חברה *")} value={f.company} onChange={(e) => set("company")(e.target.value)} />
        <div className="grid grid-cols-2 gap-2"><input className={inputCls} placeholder={tr("איש קשר")} value={f.contact_name} onChange={(e) => set("contact_name")(e.target.value)} /><input className={inputCls} placeholder={tr("תפקיד")} value={f.contact_role} onChange={(e) => set("contact_role")(e.target.value)} /><input className={inputCls} type="tel" dir="ltr" placeholder={tr("נייד")} value={f.phone} onChange={(e) => set("phone")(e.target.value)} /><input className={inputCls} type="email" dir="ltr" placeholder={tr("אימייל")} value={f.email} onChange={(e) => set("email")(e.target.value)} /></div>
        <select className={inputCls} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">{tr("תעשייה")}</option>{FIELD_INDUSTRIES.map((i) => <option key={i.key} value={i.key}>{tr(i.he)}</option>)}</select>
      </div>
      <div className="bg-white border rounded-2xl p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2"><button className={big + " " + (mic === "he-IL" ? "bg-red-600 text-white" : "border")} onClick={() => listen("he-IL")}>🎙 {mic === "he-IL" ? tr("עצור") : tr("הכתבה עברית")}</button><button className={big + " " + (mic === "en-US" ? "bg-red-600 text-white" : "border")} onClick={() => listen("en-US")}>🎙 {mic === "en-US" ? "Stop" : "English"}</button></div>
        <textarea className={inputCls + " text-base"} rows={5} placeholder={tr("הערות מהפגישה — מוצר בשימוש, ספק, כמויות, מחיר יעד, מה הובטח")} value={note} onChange={(e) => setNote(e.target.value)} />
        <button className={big + " bg-ink-900 text-white disabled:opacity-40"} disabled={note.trim().length < 5 || busy === "ai"} onClick={summarize}>{busy === "ai" ? tr("מסכם…") : "✨ " + tr("סכם + צעד הבא")}</button>
        <TokenMeter usage={usage} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} busy={!!busy} />
        {sum && (
          <div className="space-y-2 border-t pt-2">
            <textarea className={inputCls} rows={4} value={sum.summary || ""} onChange={(e) => setSum({ ...sum, summary: e.target.value })} />
            <input className={inputCls} value={sum.next_step || ""} onChange={(e) => setSum({ ...sum, next_step: e.target.value })} placeholder={tr("הצעד הבא")} />
            <div className="grid grid-cols-2 gap-2"><input type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} /><select className={inputCls} value={stage} onChange={(e) => setSt(e.target.value as Stage)}>{STAGES.map((s) => <option key={s.key} value={s.key}>{tr(s.he)}</option>)}</select></div>
            <div className="text-xs text-slate-500">{tr("משימה ב-")}{fmtDate(due)}{sum.products?.length ? " · " + sum.products.join(", ") : ""}</div>
          </div>
        )}
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className={big + " bg-brand-500 text-white"} onClick={save}>💾 {tr("שמור פגישה")}</button>
      </div>
    </div>
  );
}
