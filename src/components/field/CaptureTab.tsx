"use client";
// CaptureTab.tsx (src/components/field/CaptureTab.tsx) · updated 18.10.2026 06:55 (Asia/Jerusalem) — capture only, no AI on the phone: start a meeting (customer or free name) → card photo / photos / voice recording / video / quick note → stored on the phone → uploaded straight to Cloudinary when there is signal. Processing happens later at the office (/capture).
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { inputCls } from "@/components/ui";
import { enqueueCapture, flushUploads, listQueue, type QItem } from "@/lib/upload-queue";
import { useLang } from "@/i18n";
type Meet = { id: string; label: string; lead_id: string; started: string };
const KEY = "field-meeting";
const KIND_HE: Record<QItem["kind"], string> = { card: "כרטיס", photo: "תמונה", audio: "הקלטה", video: "וידאו", note: "הערה" };
export default function CaptureTab() {
  const { t: tr } = useLang();
  const { state } = useStore();
  const [meet, setMeet] = useState<Meet | null>(null); const [lead, setLead] = useState(""); const [label, setLabel] = useState("");
  const [queue, setQueue] = useState<QItem[]>([]); const [busy, setBusy] = useState(false); const [note, setNote] = useState(""); const [rec, setRec] = useState(0); const [msg, setMsg] = useState("");
  const mr = useRef<MediaRecorder | null>(null); const chunks = useRef<Blob[]>([]); const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const refresh = async () => setQueue(await listQueue());
  const push = async () => { setBusy(true); await flushUploads(() => { refresh(); }); await refresh(); setBusy(false); };
  useEffect(() => {
    try { const m = localStorage.getItem(KEY); if (m) setMeet(JSON.parse(m)); } catch {}
    refresh(); const t = setInterval(() => { if (navigator.onLine) push(); }, 20000); const on = () => push(); window.addEventListener("online", on);
    push(); return () => { clearInterval(t); window.removeEventListener("online", on); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const start = () => {
    const l = state.leads.find((x) => x.id === lead); const name = (l?.name || label).trim(); if (!name) return setMsg(tr("בחר לקוח או כתוב שם"));
    const m: Meet = { id: "m" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + Math.random().toString(36).slice(2, 7), label: name, lead_id: l?.id || "", started: new Date().toISOString() };
    setMeet(m); setMsg(""); try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {}
  };
  const end = () => { setMeet(null); setLead(""); setLabel(""); try { localStorage.removeItem(KEY); } catch {} };
  const add = async (kind: QItem["kind"], blob: Blob, name: string) => { if (!meet) return; await enqueueCapture({ meeting_id: meet.id, label: meet.label, lead_id: meet.lead_id, kind, blob, name }); await refresh(); setMsg("✓ " + tr(KIND_HE[kind]) + " " + tr("נשמרה בטלפון")); push(); };
  const files = (kind: QItem["kind"]) => async (fl: FileList | null) => { for (const f of Array.from(fl || [])) await add(kind, f, f.name || kind + ".jpg"); };
  const record = async () => {
    if (mr.current) { mr.current.stop(); return; }
    try {
      const st = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((t) => MediaRecorder.isTypeSupported?.(t)) || "";
      const r = new MediaRecorder(st, type ? { mimeType: type } : undefined); chunks.current = [];
      r.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      r.onstop = async () => { st.getTracks().forEach((t) => t.stop()); if (timer.current) clearInterval(timer.current); setRec(0); mr.current = null; const b = new Blob(chunks.current, { type: r.mimeType || "audio/webm" }); await add("audio", b, "voice-" + Date.now() + (b.type.includes("mp4") ? ".m4a" : ".webm")); };
      r.start(1000); mr.current = r; setRec(1); timer.current = setInterval(() => setRec((s) => s + 1), 1000);
    } catch { setMsg(tr("אין גישה למיקרופון — אשר הרשאה בדפדפן")); }
  };
  const saveNote = async () => { if (!note.trim()) return; await add("note", new Blob([note.trim()], { type: "text/plain" }), "note-" + Date.now() + ".txt"); setNote(""); };
  const big = "w-full py-4 rounded-xl text-base font-medium flex items-center justify-center gap-2 cursor-pointer";
  const mine = meet ? queue.filter((q) => q.meeting_id === meet.id) : [];
  const errs = queue.filter((q) => q.err);
  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-2xl p-3 text-sm flex items-center justify-between gap-2">
        <span>{queue.length ? <><b>{queue.length}</b> {tr("ממתינים להעלאה")}{errs.length ? <span className="text-amber-600"> · {errs[0].err}</span> : ""}</> : <span className="text-green-700">✓ {tr("הכל הועלה ל-Cloudinary")}</span>}</span>
        {queue.length > 0 && <button className="px-3 py-2 rounded-lg border" disabled={busy} onClick={push}>{busy ? "…" : "⬆️ " + tr("העלה")}</button>}
      </div>
      {!meet ? (
        <div className="bg-white border rounded-2xl p-3 space-y-2">
          <div className="font-bold">{tr("פגישה חדשה")}</div>
          <select className={inputCls + " text-base"} value={lead} onChange={(e) => setLead(e.target.value)}><option value="">{tr("— לקוח קיים —")}</option>{[...state.leads].sort((a, b) => a.name.localeCompare(b.name)).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
          {!lead && <input className={inputCls + " text-base"} placeholder={tr("או שם חברה / דוכן חדש")} value={label} onChange={(e) => setLabel(e.target.value)} />}
          <button className={big + " bg-brand-500 text-white"} onClick={start}>▶ {tr("התחל פגישה")}</button>
        </div>
      ) : (
        <>
          <div className="bg-ink-900 text-white rounded-2xl p-3 flex items-center justify-between"><div><div className="text-xs opacity-70">{tr("פגישה פעילה")}</div><div className="font-bold">{meet.label}</div><div className="text-xs opacity-70">{mine.length} {tr("פריטים ממתינים")}</div></div><button className="px-3 py-2 rounded-lg bg-white/10" onClick={end}>■ {tr("סיים")}</button></div>
          <div className="grid grid-cols-2 gap-2">
            <label className={big + " bg-brand-500 text-white"}>📇 {tr("כרטיס ביקור")}<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => files("card")(e.target.files)} /></label>
            <label className={big + " bg-white border"}>📷 {tr("תמונה")}<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => files("photo")(e.target.files)} /></label>
            <button className={big + " " + (rec ? "bg-red-600 text-white" : "bg-white border")} onClick={record}>🎙 {rec ? tr("עצור") + " " + Math.floor((rec - 1) / 60) + ":" + String((rec - 1) % 60).padStart(2, "0") : tr("הקלטה")}</button>
            <label className={big + " bg-white border"}>🎥 {tr("וידאו")}<input type="file" accept="video/*" capture="environment" className="hidden" onChange={(e) => files("video")(e.target.files)} /></label>
          </div>
          <div className="bg-white border rounded-2xl p-3 space-y-2"><textarea rows={3} className={inputCls + " text-base"} placeholder={tr("הערה מהירה…")} value={note} onChange={(e) => setNote(e.target.value)} /><button className="w-full py-3 rounded-xl border" onClick={saveNote}>📝 {tr("שמור הערה")}</button></div>
        </>
      )}
      {msg && <div className="text-sm text-center text-slate-600">{msg}</div>}
      <p className="text-[11px] text-slate-500 text-center">{tr("אין עיבוד בטלפון. הכל נשמר בטלפון ועולה ל-Cloudinary כשיש קליטה (האפליקציה צריכה להישאר פתוחה). עיבוד במשרד: תיבת שטח.")}</p>
    </div>
  );
}
