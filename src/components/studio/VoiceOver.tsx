"use client";
// VoiceOver.tsx (src/components/studio/VoiceOver.tsx) · updated 18.10.2026 19:20 (Asia/Jerusalem) — POST STUDIO 🎙️ voice-over for the reel: reads the scene voice lines aloud (HE / RU / EN / IT, choice of voice) → play here + download MP3 for CapCut. Cost shown.
import { useState } from "react";
import { useLang } from "@/i18n";
const VOICES: [string, string][] = [["ash", "Ash ♂"], ["onyx", "Onyx ♂"], ["echo", "Echo ♂"], ["sage", "Sage ♀"], ["coral", "Coral ♀"], ["nova", "Nova ♀"]];
export default function VoiceOver({ text, lang, name, onCost }: { text: string; lang: string; name: string; onCost?: (usd: number) => void }) {
  const { t: tr } = useLang();
  const [voice, setVoice] = useState("ash"); const [busy, setBusy] = useState(false); const [url, setUrl] = useState(""); const [err, setErr] = useState(""); const [cost, setCost] = useState(0);
  const run = async () => {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/studio/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, lang, voice }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || "error " + r.status); }
      const c = Number(r.headers.get("X-Cost-USD") || 0); setCost(c); onCost?.(c);
      if (url) URL.revokeObjectURL(url); setUrl(URL.createObjectURL(await r.blob()));
    } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
    setBusy(false);
  };
  return (
    <div className="flex flex-wrap items-center gap-2 border-t pt-2">
      <select className="border rounded-lg px-2 py-1 text-sm bg-white" value={voice} onChange={(e) => setVoice(e.target.value)}>{VOICES.map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select>
      <button className="px-3 py-1.5 rounded-lg bg-ink-900 text-white text-sm disabled:opacity-40" disabled={busy || !text.trim()} onClick={run}>{busy ? tr("מקליט…") : "🎙️ " + tr("קריינות AI")}</button>
      {url && <><audio src={url} controls className="h-9" /><a href={url} download={name} className="px-3 py-1.5 rounded-lg border text-sm bg-white">⬇️ MP3</a></>}
      {cost > 0 && <span className="text-xs text-slate-500">≈ ${cost.toFixed(3)}</span>}
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
