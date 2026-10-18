"use client";
// StudioResult.tsx (src/components/studio/StudioResult.tsx) · updated 18.10.2026 19:05 (Asia/Jerusalem) — 🔄 rewrite button · 17:35 — + Italian tab · 17:15 — POST STUDIO output: tab per language → LinkedIn post · Facebook post · 30 s reel script (scene table) · AI image prompt — each with 📋 copy + open-in-LinkedIn/Facebook; export bar per language.
import { useState } from "react";
import ExportBar from "@/components/ExportBar";
import { Card } from "@/components/ui";
import type { StudioPack, StudioItem } from "@/lib/studio/history";
import { useLang } from "@/i18n";
const NAME: Record<string, string> = { he: "עברית", ru: "Русский", en: "English", it: "Italiano" };
export function itemText(it: StudioItem): string {
  return ["LinkedIn:\n" + it.linkedin, "Facebook:\n" + it.facebook, "Reel — " + it.reel.hook + "\n" + it.reel.scenes.map((s) => s.sec + "s · " + s.visual + " · " + s.voice).join("\n") + "\n" + it.reel.caption, "Hashtags: " + it.hashtags.join(" "), "Image prompt: " + it.image_prompt].join("\n\n");
}
function Copy({ text }: { text: string }) {
  const { t: tr } = useLang(); const [ok, setOk] = useState(false);
  return <button className="text-xs px-2 py-1 rounded border bg-white hover:bg-slate-50" onClick={() => { navigator.clipboard?.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}>{ok ? "✓" : "📋 " + tr("העתק")}</button>;
}
function Block({ title, text, open }: { title: string; text: string; open?: string }) {
  return (
    <div className="border rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between gap-2"><b>{title}</b><div className="flex gap-1"><Copy text={text} />{open && <a className="text-xs px-2 py-1 rounded border bg-white" href={open} target="_blank" rel="noreferrer">↗</a>}</div></div>
      <div className="whitespace-pre-wrap text-sm" dir="auto">{text}</div>
    </div>
  );
}
export default function StudioResult({ pack, busy, onRewrite }: { pack: StudioPack; busy?: boolean; onRewrite?: (lang: string) => void }) {
  const { t: tr } = useLang();
  const [lang, setLang] = useState(pack.items[0]?.lang || "he");
  const it = pack.items.find((x) => x.lang === lang) || pack.items[0]; if (!it) return null;
  const li = it.linkedin + (it.hashtags.length && !it.linkedin.includes("#") ? "\n\n" + it.hashtags.join(" ") : "");
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-2"><b className="flex-1" dir="auto">{pack.topic}</b>{pack.items.map((x) => <button key={x.lang} onClick={() => setLang(x.lang)} className={"px-3 py-1 rounded-full border text-sm " + (x.lang === lang ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{NAME[x.lang] || x.lang}</button>)}{onRewrite && <button disabled={busy} onClick={() => onRewrite(it.lang)} className="px-3 py-1 rounded-full border text-sm bg-white hover:bg-slate-50 disabled:opacity-40" title={tr("גרסה חדשה לשפה הזו")}>{busy ? "…" : "🔄 " + tr("כתוב מחדש")} · {NAME[it.lang] || it.lang}</button>}</div>
      <div className="grid lg:grid-cols-2 gap-3">
        <Block title="💼 LinkedIn" text={li} open="https://www.linkedin.com/feed/?shareActive=true" />
        <Block title="📘 Facebook" text={it.facebook} open="https://www.facebook.com/" />
      </div>
      <div className="border rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between"><b>🎬 {tr("ריל 30 שניות")}</b><Copy text={it.reel.hook + "\n" + it.reel.scenes.map((s) => s.sec + " · " + s.visual + " · " + s.voice).join("\n") + "\n\n" + it.reel.caption} /></div>
        <div className="text-sm font-medium" dir="auto">🪝 {it.reel.hook}</div>
        <table className="w-full text-sm"><thead><tr className="text-xs text-slate-500 text-start"><th className="text-start p-1">⏱</th><th className="text-start p-1">{tr("מה מצלמים")}</th><th className="text-start p-1">{tr("קריינות")}</th></tr></thead>
          <tbody>{it.reel.scenes.map((s, i) => <tr key={i} className="border-t align-top"><td className="p-1 whitespace-nowrap text-slate-500">{s.sec}</td><td className="p-1" dir="ltr">{s.visual}</td><td className="p-1" dir="auto">{s.voice}</td></tr>)}</tbody></table>
        <div className="text-sm text-slate-600" dir="auto">{it.reel.caption}</div>
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        <Block title="#️⃣ Hashtags" text={it.hashtags.join(" ")} />
        <Block title={"🖼️ " + tr("פרומפט לתמונה (AI)")} text={it.image_prompt} />
      </div>
      <ExportBar title={"Post Studio — " + pack.topic + " (" + (NAME[it.lang] || it.lang) + ")"} text={itemText(it)} filename={"post_" + it.lang + ".txt"} />
    </Card>
  );
}
