"use client";
// NewMeeting.tsx (src/components/salesmeet/NewMeeting.tsx) · created 27.10.2026 05:05 (Asia/Jerusalem) — v1.0.0
// 🤝 New sales meeting / call: date · with whom · type · typed notes and/or PHOTOS of handwritten pages → ✨ AI reads → review → ✅ apply:
// note on every linked customer card, ticks (customer of Pini / TDS / sample) on the card, tasks to "My day", meeting saved. Nothing is written before you press apply.
import { useState } from "react";
import { Card, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import ReviewEditor from "./ReviewEditor";
import { shrinkImage } from "@/lib/img-shrink";
import { SM_KINDS, type SmSummary } from "@/lib/sales-meeting-types";
import { todayIso, addDays, fmtDate } from "@/lib/format";
import type { Lead, Task, Usage } from "@/lib/types";
type Img = { data: string; type: "image/jpeg"; preview: string };
type Props = { leads: Lead[]; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void; addActivity: (id: string, kind: string, text: string) => void; addTask: (t: Omit<Task, "id" | "done">) => void; upsertLead: (l: Lead) => void; onSaved: () => void };
const TICK_KEY = { pini: "SHEET_PINI", tds: "SHEET_TDS", sample: "SHEET_SAMPLE" } as const;

export function smText(s: SmSummary, held: string, withWho: string, kind: string): string {
  const k = SM_KINDS.find((x) => x.k === kind)?.he || kind;
  return [s.title, fmtDate(held) + " · " + k + " · עם " + withWho, "", s.summary, "", ...s.points.filter(Boolean).map((p) => "• " + p), "",
    ...s.customers.map((c) => "▸ " + c.name + (c.decision ? " — " + c.decision : "") + (c.next_step ? " → " + c.next_step : "")), "", ...s.tasks.map((t) => "☐ " + t.title + (t.due ? " (" + fmtDate(t.due) + ")" : ""))].join("\n");
}

export default function NewMeeting({ leads, spend, addSpend, addActivity, addTask, upsertLead, onSaved }: Props) {
  const [held, setHeld] = useState(todayIso()); const [withWho, setWithWho] = useState("פיני"); const [kind, setKind] = useState("physical");
  const [notes, setNotes] = useState(""); const [imgs, setImgs] = useState<Img[]>([]); const [busy, setBusy] = useState(""); const [err, setErr] = useState("");
  const [s, setS] = useState<SmSummary | null>(null); const [usage, setUsage] = useState<Usage | undefined>(); const [done, setDone] = useState("");
  const addPhotos = async (files: FileList | null) => { if (!files) return; setBusy("img"); try { const out: Img[] = []; for (const f of Array.from(files).slice(0, 6 - imgs.length)) out.push(await shrinkImage(f)); setImgs([...imgs, ...out]); } catch { setErr("לא הצלחתי לקרוא את התמונה"); } setBusy(""); };
  const read = async () => {
    setBusy("ai"); setErr(""); setDone("");
    try {
      const r = await fetch("/api/sales-meetings/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ held_at: held, with_who: withWho, kind, notes, images: imgs.map(({ data, type }) => ({ data, type })), leads: leads.map((l) => ({ id: l.id, name: l.name })) }) });
      const j = await r.json(); if (j.usage) { setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); }
      if (!r.ok) throw new Error(j.error || "AI error");
      setS({ ...j.summary, tasks: j.summary.tasks.map((t: SmSummary["tasks"][number]) => ({ ...t, due: t.due || addDays(held, 7) })) });
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "שגיאה"); }
    setBusy("");
  };
  const apply = async () => {
    if (!s) return; setBusy("save"); setErr("");
    const head = "🤝 " + fmtDate(held) + " · " + (SM_KINDS.find((x) => x.k === kind)?.he || kind) + " עם " + withWho + ": ";
    let acts = 0, tasks = 0, ticks = 0;
    for (const c of s.customers) {
      const l = leads.find((x) => x.id === c.lead_id); if (!l) continue;
      addActivity(l.id, "meeting", head + [c.decision, c.next_step && "הצעד הבא: " + c.next_step].filter(Boolean).join(" · ")); acts++;
      const intake = { ...(l.intake || {}) } as Record<string, string>; let changed = false;
      for (const k of ["pini", "tds", "sample"] as const) if (c[k]) { intake[TICK_KEY[k]] = c[k] as string; changed = true; ticks++; }
      if (changed) upsertLead({ ...l, intake: intake as Lead["intake"] });
    }
    for (const t of s.tasks) { if (!t.title.trim()) continue; const l = leads.find((x) => x.id === t.lead_id); addTask({ lead_id: l?.id || "", lead_name: l?.name || t.lead_name || withWho, title: "🤝 " + t.title, due: t.due || addDays(held, 7), cadence: "once", kind: "followup" }); tasks++; }
    try {
      const r = await fetch("/api/sales-meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ held_at: held, kind, with_who: withWho, title: s.title, notes, photo_count: imgs.length, summary: s, applied: { activities: acts, tasks, ticks }, usage }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "save failed");
      setDone("✓ נשמר · " + acts + " כרטיסי לקוח עודכנו · " + tasks + " משימות ב'היום שלי' · " + ticks + " סימונים"); setS(null); setNotes(""); setImgs([]); onSaved();
    } catch (e: unknown) { setErr("המשימות והכרטיסים עודכנו, אבל שמירת הפגישה נכשלה: " + (e instanceof Error ? e.message : "")); }
    setBusy("");
  };
  const lbl = "text-xs text-slate-500";
  return (
    <Card className="space-y-3">
      <b>➕ פגישה / שיחה חדשה</b>
      <div className="grid md:grid-cols-3 gap-2">
        <label className={lbl}>תאריך<input type="date" className={inputCls + " mt-1"} value={held} onChange={(e) => setHeld(e.target.value)} /></label>
        <label className={lbl}>עם מי<input className={inputCls + " mt-1"} value={withWho} onChange={(e) => setWithWho(e.target.value)} placeholder="פיני / שם לקוח" /></label>
        <label className={lbl}>סוג<select className={inputCls + " mt-1"} value={kind} onChange={(e) => setKind(e.target.value)}>{SM_KINDS.map((k) => <option key={k.k} value={k.k}>{k.icon} {k.he}</option>)}</select></label>
      </div>
      <label className={lbl + " block"}>הערות (הקלד / הדבק / הכתבה) — אפשר להשאיר ריק אם מצרפים צילום<textarea rows={5} className={inputCls + " mt-1"} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
      <div className="flex flex-wrap items-center gap-2">
        <label className={btnGhost + " cursor-pointer"}>📷 צילום דפים בכתב יד ({imgs.length}/6)<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} /></label>
        {imgs.map((im, i) => <span key={i} className="relative"><img src={im.preview} alt="" className="h-14 w-14 object-cover rounded border" /><button className="absolute -top-2 -end-2 bg-white rounded-full border text-xs px-1" onClick={() => setImgs(imgs.filter((_, j) => j !== i))}>✕</button></span>)}
        <button className={btnPrimary + " ms-auto"} disabled={!!busy || (notes.trim().length < 10 && !imgs.length)} onClick={read}>{busy === "ai" ? "⏳ קורא…" : "✨ קרא וסכם עם AI"}</button>
      </div>
      <TokenMeter usage={usage} sessionTokens={spend.tokens} sessionCost={spend.cost} busy={busy === "ai"} />
      {err && <div className="text-sm text-red-600">⚠ {err}</div>}
      {done && <div className="text-sm text-emerald-700">{done}</div>}
      {s && (<div className="border-t pt-3 space-y-3">
        <ReviewEditor s={s} setS={setS} leads={leads} />
        <div className="flex flex-wrap gap-2"><button className={btnPrimary} disabled={!!busy} onClick={apply}>{busy === "save" ? "⏳" : "✅ שמור והחל על ה-CRM"}</button><button className={btnGhost} onClick={() => setS(null)}>ביטול</button></div>
        <ExportBar title={"סיכום פגישה — " + withWho + " — " + fmtDate(held)} text={smText(s, held, withWho, kind)} />
      </div>)}
    </Card>
  );
}
