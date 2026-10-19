"use client";
// VoiceOver.tsx (src/components/studio/VoiceOver.tsx) · updated 19.10.2026 06:10 (Asia/Jerusalem) — engine switch ElevenLabs (natural voices, Hebrew via Eleven v3) / OpenAI; voice list loaded from your ElevenLabs account (add Hebrew voices in their Voice Library → they appear here); characters + cost shown · 18.10.2026 19:20 — POST STUDIO 🎙️ voice-over for the reel → play here + download MP3 for CapCut.
import { useEffect, useState } from "react";
import { useLang } from "@/i18n";
type V = { id: string; name: string; info: string };
const OA: V[] = [["ash", "Ash ♂"], ["onyx", "Onyx ♂"], ["echo", "Echo ♂"], ["sage", "Sage ♀"], ["coral", "Coral ♀"], ["nova", "Nova ♀"]].map(([id, name]) => ({ id, name, info: "" }));
let cache: { eleven: boolean; voices: V[]; error: string } | null = null;
const LS = "silitex-voice-v1";
export default function VoiceOver({ text, lang, name }: { text: string; lang: string; name: string }) {
  const { t: tr } = useLang();
  const [cfg, setCfg] = useState(cache); const [engine, setEngine] = useState("eleven"); const [voice, setVoice] = useState("");
  const [busy, setBusy] = useState(false); const [url, setUrl] = useState(""); const [err, setErr] = useState(""); const [cost, setCost] = useState(0);
  useEffect(() => {
    const done = (c: NonNullable<typeof cache>) => { cache = c; setCfg(c); let saved: { engine?: string; voice?: string } = {}; try { saved = JSON.parse(localStorage.getItem(LS) || "{}"); } catch {} const eng = c.eleven ? saved.engine || "eleven" : "openai"; setEngine(eng); const list = eng === "eleven" ? c.voices : OA; setVoice(list.some((v) => v.id === saved.voice) ? saved.voice! : list[0]?.id || ""); };
    if (cache) done(cache); else fetch("/api/studio/tts").then((r) => r.json()).then(done).catch(() => done({ eleven: false, voices: [], error: "" }));
  }, []);
  const list = engine === "eleven" ? cfg?.voices || [] : OA;
  const pick = (eng: string, v: string) => { setEngine(eng); setVoice(v); try { localStorage.setItem(LS, JSON.stringify({ engine: eng, voice: v })); } catch {} };
  const estimate = engine === "eleven" ? text.length * 0.0001 : (text.length / 1e6) * 15 + 0.01;
  const run = async () => {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/studio/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, lang, voice, engine }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || "error " + r.status); }
      setCost(Number(r.headers.get("X-Cost-USD") || 0));
      if (url) URL.revokeObjectURL(url); setUrl(URL.createObjectURL(await r.blob()));
    } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
    setBusy(false);
  };
  const chip = (on: boolean) => "px-2 py-1 rounded-lg border text-xs " + (on ? "bg-brand-500 text-white border-brand-500" : "bg-white");
  return (
    <div className="border-t pt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">🎙️ {tr("קריינות AI")}</span>
        <button className={chip(engine === "eleven")} disabled={!cfg?.eleven} onClick={() => pick("eleven", cfg?.voices[0]?.id || "")} title={cfg?.eleven ? "" : tr("חסר ELEVENLABS_API_KEY ב-Vercel")}>ElevenLabs</button>
        <button className={chip(engine === "openai")} onClick={() => pick("openai", "ash")}>OpenAI</button>
        <select className="border rounded-lg px-2 py-1 text-sm bg-white max-w-[16rem]" value={voice} onChange={(e) => pick(engine, e.target.value)}>{list.map((v) => <option key={v.id} value={v.id}>{v.name}{v.info ? " — " + v.info : ""}</option>)}</select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className="px-3 py-1.5 rounded-lg bg-ink-900 text-white text-sm disabled:opacity-40" disabled={busy || !text.trim() || !voice} onClick={run}>{busy ? tr("מקליט…") : "▶️ " + tr("צור קריינות")}</button>
        <span className="text-xs text-slate-500"><span dir="ltr">{text.length}</span> {tr("תווים")} · ≈ <span dir="ltr">${(cost || estimate).toFixed(3)}</span></span>
        {url && <><audio src={url} controls className="h-9" /><a href={url} download={name} className="px-3 py-1.5 rounded-lg border text-sm bg-white">⬇️ MP3</a></>}
      </div>
      {cfg && !cfg.eleven && <div className="text-xs text-amber-700">{tr("ElevenLabs לא מחובר — להוסיף ELEVENLABS_API_KEY ב-Vercel ולעשות Redeploy.")}</div>}
      {cfg?.error && <div className="text-xs text-red-600">ElevenLabs: {cfg.error}</div>}
      {err && <div className="text-xs text-red-600">{err}</div>}
    </div>
  );
}
