"use client";
// PitchFiles.tsx (src/components/leads/PitchFiles.tsx) · created 08.11.2026 06:40 (Asia/Jerusalem) — v1.5.0
// 📎 Data sheets for the pitch: Silitex 2026 catalogue PDFs (suggested from the matched products, ticked by default)
// + any PDF from your computer (TDS / SDS / CoA received from Silitex). Everything ticked is attached to the Outlook draft.
import { useRef } from "react";
import { btnGhost } from "@/components/ui";
import { useLang } from "@/i18n";
import type { DraftFile } from "@/lib/outlook-draft";

export type PitchFile = { name: string; kind: "catalogue" | "upload"; on: boolean; file?: DraftFile };
type Props = { files: PitchFile[]; setFiles: (f: PitchFile[]) => void };
const toB64 = (f: File) => new Promise<string>((ok, bad) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1] || ""); r.onerror = () => bad(r.error); r.readAsDataURL(f); });

export default function PitchFiles({ files, setFiles }: Props) {
  const { t: tr } = useLang(); const inp = useRef<HTMLInputElement>(null);
  const add = async (list: FileList | null) => {
    if (!list) return; const next = [...files];
    for (const f of Array.from(list)) {
      if (next.some((x) => x.name === f.name)) continue;
      next.push({ name: f.name, kind: "upload", on: true, file: { filename: f.name, base64: await toB64(f), type: f.type || "application/pdf" } });
    }
    setFiles(next); if (inp.current) inp.current.value = "";
  };
  const toggle = (n: string) => setFiles(files.map((x) => (x.name === n ? { ...x, on: !x.on } : x)));
  const drop = (n: string) => setFiles(files.filter((x) => x.name !== n));
  return (
    <div className="border rounded-lg p-2 bg-slate-50/60">
      <div className="flex items-center justify-between mb-1"><b className="text-sm">📎 {tr("דפי נתונים מצורפים")}</b><button type="button" className={btnGhost + " text-xs"} onClick={() => inp.current?.click()}>+ {tr("הוסף PDF (TDS / SDS / CoA)")}</button></div>
      <input ref={inp} type="file" accept=".pdf,application/pdf" multiple className="hidden" onChange={(e) => add(e.target.files)} />
      {files.length === 0 && <div className="text-xs text-slate-500">{tr("אין קבצים — הוסף דף נתונים מהמחשב.")}</div>}
      <ul className="text-xs space-y-1">{files.map((f) => (
        <li key={f.name} className="flex items-center gap-2">
          <input type="checkbox" checked={f.on} onChange={() => toggle(f.name)} />
          <span className="flex-1 truncate" dir="ltr">{f.kind === "catalogue" ? "📘 " : "📄 "}{f.name}</span>
          <span className="text-slate-400">{f.kind === "catalogue" ? tr("קטלוג Silitex 2026") : tr("מהמחשב")}</span>
          {f.kind === "upload" && <button type="button" className="text-red-500" onClick={() => drop(f.name)}>✕</button>}
        </li>))}</ul>
    </div>
  );
}
