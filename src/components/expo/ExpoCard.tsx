"use client";
// ExpoCard.tsx (src/components/expo/ExpoCard.tsx) · updated 18.10.2026 11:45 (Asia/Jerusalem) — EXPO electronic business card: she fills her own details once (kept on her phone) → QR (vCard) the visitor scans with the camera · share .vcf · WhatsApp. No paper cards to run out of.
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { inputCls } from "@/components/ui";
import { vcard } from "@/lib/expo/util";
import type { Expo, ExpoProfile } from "@/lib/expo/store";
import { useLang } from "@/i18n";
export default function ExpoCard({ expo }: { expo: Expo }) {
  const { t: tr } = useLang();
  const p = expo.state.profile; const empty = !p.first.trim() || !p.phone.trim();
  const [edit, setEdit] = useState(empty); const [d, setD] = useState<ExpoProfile>(p);
  const [src, setSrc] = useState("");
  useEffect(() => { setD(p); if (!p.first.trim() || !p.phone.trim()) setEdit(true); }, [expo.ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const vc = vcard(p);
  useEffect(() => { if (!empty) QRCode.toDataURL(vc, { width: 560, margin: 1 }).then(setSrc).catch(() => setSrc("")); }, [vc, empty]);
  const fname = ((p.first + "_" + p.last).trim() || "Silitex") + ".vcf";
  const share = async () => { const f = new File([vc], fname, { type: "text/vcard" }); const n = navigator as Navigator & { canShare?: (x: unknown) => boolean }; if (n.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: p.first + " " + p.last }); return; } catch {} } const a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = f.name; a.click(); };
  if (edit) {
    const fld = (k: keyof ExpoProfile, ph: string, type = "text") => <input className={inputCls + " text-base"} type={type} dir={type === "text" ? "auto" : "ltr"} placeholder={ph} value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} />;
    return (
      <div className="bg-white border rounded-2xl p-4 space-y-2">
        <div className="font-bold">🪪 {tr("הכרטיס שלי — פעם אחת")}</div>
        <div className="text-xs text-slate-500">{tr("הפרטים נשמרים רק בטלפון שלך.")}</div>
        <div className="grid grid-cols-2 gap-2">{fld("first", tr("שם פרטי *"))}{fld("last", tr("שם משפחה"))}</div>
        {fld("title", tr("תפקיד"))}{fld("company", tr("חברה"))}
        {fld("phone", tr("נייד * (עם קידומת, למשל +39…)"), "tel")}{fld("email", tr("אימייל"), "email")}{fld("website", "www.silitex.it", "url")}
        <button className="w-full py-3 rounded-xl bg-brand-500 text-white disabled:opacity-40" disabled={!d.first.trim() || !d.phone.trim()} onClick={() => { expo.setProfile({ ...d, first: d.first.trim(), last: d.last.trim(), phone: d.phone.trim() }); setEdit(false); }}>💾 {tr("שמור כרטיס")}</button>
      </div>
    );
  }
  return (
    <div className="bg-white border rounded-2xl p-5 text-center space-y-3">
      <div className="text-xl font-bold" dir="auto">{p.first} {p.last}</div>
      <div className="text-sm text-slate-600" dir="ltr">{p.company}{p.title && <><br />{p.title}</>}<br />{p.phone}{p.email && " · " + p.email}</div>
      {src ? <img src={src} alt="QR" className="mx-auto w-64 h-64" /> : <div className="h-64 grid place-items-center text-slate-400">QR…</div>}
      <div className="text-xs text-slate-500">{tr("הלקוח סורק במצלמה → איש הקשר נשמר אצלו")}</div>
      <div className="flex flex-wrap justify-center gap-2" dir="ltr">
        <button className="px-4 py-3 rounded-xl bg-brand-500 text-white" onClick={share}>📤 {tr("שתף כרטיס")}</button>
        <a className="px-4 py-3 rounded-xl border" href={"https://wa.me/?text=" + encodeURIComponent([(p.first + " " + p.last).trim() + " · " + p.company, p.title, p.phone + (p.email ? " · " + p.email : ""), p.website].filter(Boolean).join("\n"))} target="_blank" rel="noreferrer">💬 WhatsApp</a>
        <button className="px-4 py-3 rounded-xl border" onClick={() => { setD(p); setEdit(true); }}>✏️ {tr("ערוך")}</button>
      </div>
    </div>
  );
}
