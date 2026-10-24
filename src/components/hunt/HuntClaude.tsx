"use client";
// HuntClaude.tsx (src/components/hunt/HuntClaude.tsx) · created 24.10.2026 05:40 (Asia/Jerusalem)
// 🤖 "Search now with Claude" — runs the builder's prompt inside the CRM (/api/hunt/search: Claude + web search), live timer,
// then the answer drops into box 3 (ready to import) + token / search / cost meter + 5-button export bar.
import { useEffect, useState } from "react";
import { useLang } from "@/i18n";
import { Badge, btnPrimary } from "@/components/ui";
import ExportBar from "@/components/ExportBar";

type Usage = { input_tokens: number; output_tokens: number; searches: number; cost_usd: number; model: string; seconds: number };
const mmss = (s: number) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");

export default function HuntClaude({ prompt, title, onAnswer, spend, addSpend }: { prompt: string; title: string; onAnswer: (text: string) => void; spend: { tokens: number; cost: number }; addSpend: (tokens: number, cost: number) => void }) {
  const { t: tr } = useLang();
  const [busy, setBusy] = useState(false); const [start, setStart] = useState(0); const [now, setNow] = useState(0);
  const [u, setU] = useState<Usage | null>(null); const [text, setText] = useState(""); const [err, setErr] = useState("");
  useEffect(() => { if (!busy) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [busy]);
  const run = async () => {
    setBusy(true); setErr(""); setU(null); setText(""); const s = Date.now(); setStart(s); setNow(s);
    try {
      const r = await fetch("/api/hunt/search", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt }) });
      const j = await r.json().catch(() => ({ error: "server " + r.status }));
      if (!r.ok || !j.text) setErr(j.error || tr("אין תשובה"));
      else { setText(j.text); setU(j.usage); onAnswer(j.text); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); }
    } catch { setErr(tr("תקלת רשת — נסה שוב")); }
    setBusy(false);
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button className={btnPrimary} disabled={!prompt || busy} onClick={run}>{busy ? "⏳ " + tr("Claude מחפש ברשת…") + " " + mmss((now - start) / 1000) : "🔎 " + tr("חפש עכשיו עם Claude")}</button>
        <span className="text-xs text-slate-500">{busy ? tr("בדרך כלל 1–4 דקות — אפשר להמשיך לעבוד בלשונית אחרת") : tr("בלי Comet ובלי העתק-הדבק · עלות משוערת ≈ $0.5–1.5 לסבב")}</span>
      </div>
      {err && <div className="text-sm text-red-600">{err}</div>}
      {u && (
        <div className="rounded-lg border bg-slate-50 p-2 text-xs flex flex-wrap items-center gap-2">
          <Badge tone="green">✓ {tr("התשובה הועברה לתיבה 3")}</Badge>
          <span>🔎 {u.searches} {tr("חיפושים")} · {(u.input_tokens + u.output_tokens).toLocaleString()} tokens · <b>${u.cost_usd.toFixed(3)}</b> · {u.model} · {mmss(u.seconds)}</span>
          <span className="ms-auto text-slate-500">{tr("סה״כ בסשן")}: {spend.tokens.toLocaleString()} tokens · ${spend.cost.toFixed(3)}</span>
        </div>
      )}
      {text && <ExportBar title={title} text={text} filename={"claude-search.txt"} />}
    </div>
  );
}
