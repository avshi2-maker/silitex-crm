"use client";
// page.tsx (src/app/mobile/page.tsx) · updated 18.10.2026 12:10 (Asia/Jerusalem) — + WhatsApp invite button, partner PIN step · 10:30 — QR → own field address (silitex-field.marble-art.co.il) · — OWNER ONLY. Mobile apps: QR to scan with the phone camera → open → Add to Home screen. List lives in config/mobile-apps.ts (more apps later).
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { H1, Card, Badge, btnGhost } from "@/components/ui";
import { MOBILE_APPS, type MobileApp } from "@/config/mobile-apps";
import { useLang } from "@/i18n";
function AppCard({ app, origin }: { app: MobileApp; origin: string }) {
  const { t: tr } = useLang();
  const url = app.url || origin + app.path; const pinStep = app.who === "partner" ? "השותף נכנס עם שם + PIN אישי (פעם אחת)" : "הזן PIN בעלים פעם אחת"; const [src, setSrc] = useState("");
  useEffect(() => { if (origin) QRCode.toDataURL(url, { width: 520, margin: 2, errorCorrectionLevel: "H" }).then(setSrc).catch(() => setSrc("")); }, [url, origin]);
  const download = () => { if (!src) return; const a = document.createElement("a"); a.href = src; a.download = "QR_" + app.name.replace(/\s+/g, "_") + ".png"; a.click(); };
  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2"><span className="text-3xl">{app.icon}</span><div><div className="font-bold text-lg" dir="ltr">{app.name}</div><div className="text-xs text-slate-500" dir="ltr">{url}</div></div><Badge tone={app.status === "live" ? "green" : "slate"}>{app.status === "live" ? tr("פעיל") : tr("בקרוב")}</Badge></div>
      <p className="text-sm text-slate-600">{tr(app.he)}</p>
      <div className="grid md:grid-cols-[260px_1fr] gap-4 items-start">
        <div className="text-center">{src ? <img src={src} alt="QR" className="w-60 h-60 mx-auto border rounded-xl" /> : <div className="w-60 h-60 mx-auto grid place-items-center text-slate-400 border rounded-xl">QR…</div>}
          <div className="flex justify-center gap-2 mt-2"><button className={btnGhost + " text-xs"} onClick={download}>⬇️ {tr("הורד QR")}</button><a className={btnGhost + " text-xs"} href={url} target="_blank" rel="noreferrer">↗ {tr("פתח")}</a>{app.share && <a className={btnGhost + " text-xs bg-green-600 text-white"} href={"https://wa.me/?text=" + encodeURIComponent(app.share)} target="_blank" rel="noreferrer">💬 {tr("שלח בוואטסאפ")}</a>}</div></div>
        <div className="text-sm space-y-3">
          <div><b>🤖 Android (Chrome)</b><ol className="list-decimal ps-5 mt-1 space-y-0.5"><li>{tr("סרוק את ה-QR עם מצלמת הטלפון → פתח בכרום")}</li><li>{tr(pinStep)}</li><li>{tr("⋮ → הוסף למסך הבית → הוסף")}</li></ol></div>
          <div><b>🍏 iPhone (Safari)</b><ol className="list-decimal ps-5 mt-1 space-y-0.5"><li>{tr("סרוק עם המצלמה → פתח ב-Safari")}</li><li>{tr(pinStep)}</li><li>{tr("שיתוף (□↑) → הוסף למסך הבית → הוסף")}</li></ol></div>
          <div className="text-xs text-slate-500">{tr("בשימוש ראשון: אשר מצלמה ומיקרופון. אל תמחק נתוני דפדפן — פריטים שממתינים להעלאה נשמרים בטלפון.")}</div>
        </div>
      </div>
    </Card>
  );
}
export default function MobilePage() {
  const { t: tr } = useLang();
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);
  return (
    <div className="space-y-4">
      <H1 sub={tr("סרוק עם הטלפון והתקן כאייקון במסך הבית — בלי חנות אפליקציות. אפליקציות נוספות יתווספו כאן.")}>📲 {tr("אפליקציות נייד")}</H1>
      <div className="grid xl:grid-cols-2 gap-4">{MOBILE_APPS.map((a) => <AppCard key={a.key} app={a} origin={origin} />)}</div>
    </div>
  );
}
