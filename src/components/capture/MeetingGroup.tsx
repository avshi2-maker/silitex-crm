"use client";
// MeetingGroup.tsx (src/components/capture/MeetingGroup.tsx) · updated 22.10.2026 07:30 (Asia/Jerusalem) — e-mail / mobile / phone fields validated: green ✓ valid, red + hint invalid, amber when already used by another customer / contact (lib/validate.ts + ValidInput) · 22.10.2026 07:10 (Asia/Jerusalem) — save to a PARTNER / Silitex contact (e.g. Pini) instead of a customer: summary + transcript + media links → the contact's "פגישות" thread in the Hub + task with his name; meeting labelled with a contact name is pre-selected · 19.10.2026 09:45 — 🗑️ delete unneeded item / whole meeting (two-tap confirm, permanent in Cloudinary) · 18.10.2026 07:05 — one field meeting from Cloudinary: process card (vision → contact), photos (vision → facts), voice/video (Whisper → transcript) → ✨ AI summary + next step → save to CRM (lead + log with media links + task + stage) → tagged processed in Cloudinary
import { useState } from "react";
import { useStore, STAGES } from "@/lib/store";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { inputCls, btnPrimary, btnGhost, Badge } from "@/components/ui";
import { uid, todayIso, addDays, fmtDate, fmtDateTime } from "@/lib/format";
import { INDUSTRIES } from "@/config/industries";
import type { Lead, Stage, Usage } from "@/lib/types";
import { buildPool } from "@/lib/validate";
import type { InboxGroup, InboxItem } from "@/app/api/capture/inbox/route";
import { useLang } from "@/i18n";
import ValidInput from "@/components/ValidInput";
type Sum = { summary?: string; products?: string[]; next_step?: string; due_days?: number; stage?: string; followup_message?: string };
const KIND_ICON: Record<string, string> = { card: "📇", photo: "📷", audio: "🎙", video: "🎥", note: "📝" };
export default function MeetingGroup({ g, onDone }: { g: InboxGroup; onDone: () => void }) {
  const { t: tr } = useLang();
  const { state, upsertLead, addActivity, addTask, addSpend, addThread, addMsg } = useStore();
  const ctGuess = state.contacts.find((c) => { const a = c.name.trim().toLowerCase(), b = g.label.trim().toLowerCase(); return !!a && !!b && (a.includes(b) || b.includes(a.split(" ")[0])); });
  const guess = state.leads.find((l) => l.id === g.lead) || state.leads.find((l) => l.name.trim().toLowerCase() === g.label.trim().toLowerCase());
  const [leadId, setLeadId] = useState(guess?.id || (ctGuess ? "ct:" + ctGuess.id : "")); const [f, setF] = useState({ company: guess?.name || g.label, contact_name: guess?.contact_name || "", contact_role: guess?.contact_role || "", phone: guess?.contact_phone || "", email: guess?.contact_email || "", website: guess?.website || "", city: guess?.city || "" });
  const [items, setItems] = useState(g.items); const [ask, setAsk] = useState("");
  const [ind, setInd] = useState(""); const [res, setRes] = useState<Record<string, string>>(() => Object.fromEntries(g.items.filter((i) => i.text).map((i) => [i.public_id, i.text || ""])));
  const [busy, setBusy] = useState(""); const [err, setErr] = useState(""); const [usage, setUsage] = useState<Usage | null>(null);
  const [sum, setSum] = useState<Sum | null>(null); const [due, setDue] = useState(addDays(todayIso(), 3)); const [stage, setStage] = useState<Stage>(guess?.stage && guess.stage !== "prospect" ? guess.stage : "contacted");
  const meter = (u?: Usage) => { if (!u) return; setUsage((p) => ({ input_tokens: (p?.input_tokens || 0) + u.input_tokens, output_tokens: (p?.output_tokens || 0) + u.output_tokens, cost_usd: (p?.cost_usd || 0) + u.cost_usd, model: u.model })); addSpend(u.input_tokens + u.output_tokens, u.cost_usd); };
  const one = async (it: InboxItem) => {
    if (it.resource_type === "raw") return;
    setBusy(it.public_id);
    try {
      const r = await fetch("/api/capture/process", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secure_url: it.secure_url, resource_type: it.resource_type, kind: it.kind, duration: it.duration }) });
      const j = await r.json(); meter(j.usage); if (!r.ok) throw new Error(j.error);
      if (j.card) {
        const c = j.card as Record<string, string>; const name = (c.company || "").trim();
        const ex = name ? state.leads.find((l) => l.name.trim().toLowerCase() === name.toLowerCase()) : undefined; if (ex && !leadId) setLeadId(ex.id);
        setF((p) => ({ company: p.company && leadId ? p.company : name || p.company, contact_name: c.contact_name || p.contact_name, contact_role: c.contact_role || p.contact_role, phone: c.mobile || c.phone || p.phone, email: c.email || p.email, website: c.website || p.website, city: c.city || p.city }));
        setRes((p) => ({ ...p, [it.public_id]: [c.company, c.contact_name, c.contact_role, c.mobile || c.phone, c.email, c.website, c.address].filter(Boolean).join(" · ") }));
      } else setRes((p) => ({ ...p, [it.public_id]: j.text }));
    } catch (e) { setErr(KIND_ICON[it.kind] + " " + (e instanceof Error ? e.message : "error")); }
    setBusy("");
  };
  const all = async () => { setErr(""); for (const it of items) if (it.resource_type !== "raw" && !res[it.public_id]) await one(it); };
  const combined = () => items.map((it) => res[it.public_id] ? "[" + it.kind + "] " + res[it.public_id] : "").filter(Boolean).join("\n\n");
  const summarize = async () => {
    setErr(""); setBusy("sum");
    try {
      const r = await fetch("/api/field/note", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company: f.company, contact: f.contact_name, industry: INDUSTRIES.find((i) => i.key === ind)?.he || "", note: combined() }) });
      const j = await r.json(); meter(j.usage); if (!r.ok) throw new Error(j.error);
      const s = j.result as Sum; setSum(s); if (s.due_days) setDue(addDays(todayIso(), Math.min(30, Math.max(1, Number(s.due_days) || 3)))); if (s.stage && STAGES.some((x) => x.key === s.stage)) setStage(s.stage as Stage);
    } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
    setBusy("");
  };
  const ct = leadId.startsWith("ct:") ? state.contacts.find((c) => "ct:" + c.id === leadId) : undefined;
  const saveContact = async () => {
    if (!ct) return; setBusy("save");
    const now = new Date().toISOString(); const links = items.map((it) => KIND_ICON[it.kind] + " " + it.secure_url).join("\n");
    const ex = state.threads.find((t) => t.contact_id === ct.id && t.topic === "technical" && t.subject.startsWith("פגישות"));
    const th = ex || addThread({ dept: ct.dept, contact_id: ct.id, subject: "פגישות · " + ct.name, topic: "technical", refs: {}, owner: "sapirim", status: "open", created_at: now, last_at: now });
    const body = ["📅 " + fmtDateTime(g.first) + " · " + (g.label || ct.name), sum?.summary ? "סיכום:\n" + sum.summary : "", sum?.next_step ? "הצעד הבא: " + sum.next_step + " (" + fmtDate(due) + ")" : "", combined() ? "תמלול / הערות:\n" + combined() : "", "קבצים:\n" + links].filter(Boolean).join("\n\n");
    addMsg({ thread_id: th.id, at: now, from: "Avshi Sapir", to: ct.name, direction: "out", body, source: "manual" });
    if (sum?.next_step) addTask({ lead_id: "", lead_name: ct.name, title: sum.next_step, due, cadence: "once", kind: "manual" });
    const r = await fetch("/api/capture/done", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map((i) => ({ public_id: i.public_id, resource_type: i.resource_type })), lead_id: "ct-" + ct.id }) });
    setBusy(""); if (!r.ok) return setErr(tr("נשמר ב-CRM, אבל סימון ב-Cloudinary נכשל — הפגישה תופיע שוב")); ping(); onDone();
  };
  const save = async () => {
    if (ct) return saveContact();
    if (!f.company.trim()) return setErr(tr("חובה: שם חברה"));
    setBusy("save");
    const prev = state.leads.find((l) => l.id === leadId);
    const indHe = INDUSTRIES.find((i) => i.key === ind)?.he;
    const lead: Lead = { ...(prev || { id: uid("LEAD"), sub_industry: "", product_match: "", use_case: "", volume_tons: 0, value_usd: 0, tier: "Tier 3 - New", department: "", status: "new", stage: "prospect" as Stage, source: "תערוכה / ביקור" }),
      name: prev?.name || f.company.trim(), industry: prev?.industry || indHe || "אחר", contact_name: f.contact_name || prev?.contact_name, contact_role: f.contact_role || prev?.contact_role || "", contact_phone: f.phone || prev?.contact_phone, contact_email: f.email || prev?.contact_email, website: f.website || prev?.website, city: f.city || prev?.city,
      product_match: prev?.product_match || (sum?.products || []).join(", "), next_action_at: sum?.next_step ? due : prev?.next_action_at, stage } as Lead;
    upsertLead(lead);
    const links = items.map((it) => KIND_ICON[it.kind] + " " + it.secure_url).join("\n");
    addActivity(lead.id, "visit", (sum?.summary || combined() || tr("פגישה")).trim() + "\n\n" + tr("קבצים מהשטח:") + "\n" + links);
    if (sum?.next_step) addTask({ lead_id: lead.id, lead_name: lead.name, title: sum.next_step, due, cadence: "once", kind: "followup" });
    if (stage !== (prev?.stage || "prospect")) addActivity(lead.id, "stage", "שלב עודכן: " + (STAGES.find((x) => x.key === stage)?.he || stage));
    const r = await fetch("/api/capture/done", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map((i) => ({ public_id: i.public_id, resource_type: i.resource_type })), lead_id: lead.id }) });
    setBusy(""); if (!r.ok) return setErr(tr("נשמר ב-CRM, אבל סימון ב-Cloudinary נכשל — הפגישה תופיע שוב")); ping(); onDone();
  };
  const ping = () => { try { window.dispatchEvent(new Event("silitex-inbox-changed")); } catch {} };
  const del = async (list: InboxItem[]) => {
    setBusy("del"); setErr("");
    const r = await fetch("/api/capture/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: list.map((i) => ({ public_id: i.public_id, resource_type: i.resource_type })) }) });
    const j = await r.json().catch(() => ({})); setBusy(""); setAsk("");
    if (!r.ok || !j.ok) return setErr(tr("המחיקה נכשלה — נסה שוב"));
    const gone = new Set(list.map((i) => i.public_id)); const left = items.filter((i) => !gone.has(i.public_id)); setItems(left); ping();
    if (!left.length) onDone();
  };
  const contactOpts = <optgroup label={tr("שותפים / Silitex — לא לקוח")}>{[...state.contacts].sort((a, b) => (a.dept === "partner" ? -1 : 0) - (b.dept === "partner" ? -1 : 0) || a.name.localeCompare(b.name)).map((c) => <option key={c.id} value={"ct:" + c.id}>{(c.dept === "partner" ? "🧑‍🔬 " : "🇮🇹 ") + c.name}</option>)}</optgroup>;
  const msg = sum?.followup_message || ""; const wa = f.phone.replace(/\D/g, "").replace(/^0/, "972");
  return (
    <div className="bg-white border rounded-2xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-lg">{g.label || tr("ללא שם")}</h3><span className="text-xs text-slate-500">{fmtDateTime(g.first)}</span>{items.map((i) => i.kind).filter((k, n, a) => a.indexOf(k) === n).map((k) => <Badge key={k}>{KIND_ICON[k]} {items.filter((i) => i.kind === k).length}</Badge>)}<button className={btnPrimary + " ms-auto"} disabled={!!busy} onClick={all}>⚙️ {tr("עבד הכל")}</button>{ask === "all" ? <span className="flex items-center gap-1"><button className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm" disabled={!!busy} onClick={() => del(items)}>{busy === "del" ? tr("מוחק…") : "🗑️ " + tr("כן, מחק את כל הפגישה")}</button><button className={btnGhost} onClick={() => setAsk("")}>{tr("ביטול")}</button></span> : <button className={btnGhost + " text-red-600"} disabled={!!busy} onClick={() => setAsk("all")} title={tr("מחיקה לצמיתות מ-Cloudinary")}>🗑️ {tr("מחק פגישה")}</button>}</div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">{items.map((it) => (
        <div key={it.public_id} className="border rounded-xl p-2 space-y-1 text-sm">
          <div className="flex items-center justify-between gap-1"><span>{KIND_ICON[it.kind]} {it.kind}</span><span className="text-[11px] text-slate-400 ms-auto">{fmtDateTime(it.created_at)}</span>{ask === it.public_id ? <><button className="px-2 py-0.5 rounded bg-red-600 text-white text-xs" disabled={!!busy} onClick={() => del([it])}>{tr("מחק")}</button><button className="px-2 py-0.5 rounded border text-xs" onClick={() => setAsk("")}>✕</button></> : <button className="px-1.5 text-slate-400 hover:text-red-600" title={tr("מחק פריט")} disabled={!!busy} onClick={() => setAsk(it.public_id)}>🗑️</button>}</div>
          {it.resource_type === "image" && <a href={it.secure_url} target="_blank" rel="noreferrer"><img src={it.secure_url.replace("/upload/", "/upload/c_fill,w_480,h_280,q_auto,f_auto/")} alt="" className="w-full h-36 object-cover rounded-lg" /></a>}
          {it.resource_type === "video" && (it.kind === "audio" ? <audio controls src={it.secure_url} className="w-full" /> : <video controls src={it.secure_url} className="w-full h-36 rounded-lg bg-black" />)}
          {it.resource_type !== "raw" && !res[it.public_id] && <button className={btnGhost + " w-full"} disabled={!!busy} onClick={() => one(it)}>{busy === it.public_id ? tr("מעבד…") : it.resource_type === "image" ? (it.kind === "card" ? tr("קרא כרטיס") : tr("נתח תמונה")) : tr("תמלל")}</button>}
          {res[it.public_id] !== undefined && <textarea dir="auto" className={inputCls + " text-xs"} rows={4} value={res[it.public_id]} onChange={(e) => setRes({ ...res, [it.public_id]: e.target.value })} />}
        </div>))}</div>
      <div className="grid md:grid-cols-4 gap-2 border-t pt-3">
        <select className={inputCls} value={leadId} onChange={(e) => { setLeadId(e.target.value); const l = state.leads.find((x) => x.id === e.target.value); if (l) setF((p) => ({ ...p, company: l.name })); const c = state.contacts.find((x) => "ct:" + x.id === e.target.value); if (c) setF((p) => ({ ...p, company: c.name, contact_name: c.name, contact_role: c.role, phone: c.mobile || c.phone || "", email: c.email })); }}><option value="">{tr("+ לקוח חדש")}</option>{contactOpts}<optgroup label={tr("לקוחות")}>{[...state.leads].sort((a, b) => a.name.localeCompare(b.name)).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</optgroup></select>
        <input className={inputCls} placeholder={tr("חברה *")} value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} disabled={!!leadId} />
        <input className={inputCls} placeholder={tr("איש קשר")} value={f.contact_name} onChange={(e) => setF({ ...f, contact_name: e.target.value })} />
        <input className={inputCls} placeholder={tr("תפקיד")} value={f.contact_role} onChange={(e) => setF({ ...f, contact_role: e.target.value })} />
        <ValidInput kind="mobile" placeholder={tr("נייד")} value={f.phone} onChange={(v) => setF({ ...f, phone: v })} pool={ct ? undefined : buildPool(state.leads, state.contacts)} selfKey={leadId ? "lead:" + leadId : undefined} />
        <ValidInput kind="emails" placeholder={tr("אימייל")} value={f.email} onChange={(v) => setF({ ...f, email: v })} pool={ct ? undefined : buildPool(state.leads, state.contacts)} selfKey={leadId ? "lead:" + leadId : undefined} />
        <select className={inputCls} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">{tr("תעשייה")}</option>{INDUSTRIES.filter((i) => i.key !== "food").map((i) => <option key={i.key} value={i.key}>{tr(i.he)}</option>)}</select>
        <button className={btnGhost} disabled={!!busy || !combined()} onClick={summarize}>{busy === "sum" ? tr("מסכם…") : "✨ " + tr("סכם + צעד הבא")}</button>
      </div>
      <TokenMeter usage={usage} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} busy={!!busy && busy !== "save"} />
      {sum && (
        <div className="space-y-2">
          <textarea dir="auto" className={inputCls} rows={4} value={sum.summary || ""} onChange={(e) => setSum({ ...sum, summary: e.target.value })} />
          <div className="grid md:grid-cols-3 gap-2"><input className={inputCls} value={sum.next_step || ""} onChange={(e) => setSum({ ...sum, next_step: e.target.value })} placeholder={tr("הצעד הבא")} /><input type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} /><select className={inputCls} value={stage} onChange={(e) => setStage(e.target.value as Stage)}>{STAGES.map((s) => <option key={s.key} value={s.key}>{tr(s.he)}</option>)}</select></div>
          <div className="text-xs text-slate-500">{tr("משימה ב-")}{fmtDate(due)}</div>
          {msg && <textarea dir="auto" className={inputCls} rows={3} value={msg} onChange={(e) => setSum({ ...sum, followup_message: e.target.value })} />}
          <ExportBar title={"Follow-up — " + f.company} text={(sum.summary || "") + "\n\n" + tr("הצעד הבא") + ": " + (sum.next_step || "") + " (" + fmtDate(due) + ")\n\n" + msg} />
          <div className="flex flex-wrap gap-2">{wa && msg && <a className={btnGhost} href={"https://wa.me/" + wa + "?text=" + encodeURIComponent(msg)} target="_blank" rel="noreferrer">💬 WhatsApp {tr("ללקוח")}</a>}{f.email && msg && <a className={btnGhost} href={"mailto:" + f.email + "?subject=" + encodeURIComponent("Sapirim · Silitex — " + f.company) + "&body=" + encodeURIComponent(msg)}>✉️ {tr("מייל ללקוח")}</a>}</div>
        </div>
      )}
      {err && <div className="text-sm text-red-600">{err}</div>}
      <div className="flex justify-end"><button className={btnPrimary} disabled={!!busy} onClick={save}>{busy === "save" ? tr("שומר…") : ct ? "💾 " + tr("שמור אצל ") + ct.name + tr(" (Hub) וסגור") : "💾 " + tr("שמור ל-CRM וסגור")}</button></div>
    </div>
  );
}
