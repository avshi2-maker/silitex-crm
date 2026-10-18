"use client";
// CardTab.tsx (src/components/field/CardTab.tsx) · updated 18.10.2026 06:45 (Asia/Jerusalem) — my electronic business card: QR (vCard) the customer scans with his camera + share / download .vcf
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { OWNER } from "@/config/app";
import { useLang } from "@/i18n";
const ME = { first: "Avshi", last: "Sapir", org: "Sapirim · Silitex S.r.l. Israel", title: "Commercial partner — Silitex silicones & emulsions", phone: "+972505231042", email: "avshi@sapirim.com" };
export const VCARD = ["BEGIN:VCARD", "VERSION:3.0", "N:" + ME.last + ";" + ME.first + ";;;", "FN:" + ME.first + " " + ME.last, "ORG:" + ME.org, "TITLE:" + ME.title, "TEL;TYPE=CELL:" + ME.phone, "EMAIL:" + ME.email, "END:VCARD"].join("\n");
export default function CardTab() {
  const { t: tr } = useLang();
  const [src, setSrc] = useState("");
  useEffect(() => { QRCode.toDataURL(VCARD, { width: 560, margin: 1 }).then(setSrc).catch(() => setSrc("")); }, []);
  const file = () => new File([VCARD], "Avshi_Sapir.vcf", { type: "text/vcard" });
  const share = async () => { const f = file(); const n = navigator as Navigator & { canShare?: (d: unknown) => boolean }; if (n.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: "Avshi Sapir" }); return; } catch {} } const a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = f.name; a.click(); };
  return (
    <div className="bg-white border rounded-2xl p-5 text-center space-y-3">
      <div className="text-xl font-bold">{ME.first} {ME.last}</div>
      <div className="text-sm text-slate-600" dir="ltr">{ME.org}<br />{ME.title}</div>
      {src ? <img src={src} alt="QR" className="mx-auto w-64 h-64" /> : <div className="h-64 grid place-items-center text-slate-400">QR…</div>}
      <div className="text-xs text-slate-500">{tr("הלקוח סורק במצלמה → איש הקשר נשמר אצלו")}</div>
      <div className="flex flex-wrap justify-center gap-2" dir="ltr">
        <button className="px-4 py-3 rounded-xl bg-brand-500 text-white" onClick={share}>📤 {tr("שתף כרטיס")}</button>
        <a className="px-4 py-3 rounded-xl border" href={"https://wa.me/?text=" + encodeURIComponent(ME.first + " " + ME.last + " · " + ME.org + "\n" + OWNER.phone + " · " + ME.email)} target="_blank" rel="noreferrer">💬 WhatsApp</a>
      </div>
    </div>
  );
}
