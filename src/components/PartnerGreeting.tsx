"use client";
// PartnerGreeting.tsx (src/components/PartnerGreeting.tsx) · updated 13.10.2026 08:00 (Asia/Jerusalem) — greeting by the partner's local hour (EN/IT) + "Israel today": Tel Aviv time, live weather, Avshi's hours. Brings the market to her; no data about her own location.
import { useEffect, useState } from "react";
import { useLang } from "@/i18n";
type W = { city: string; temp: number | null; en: string; it: string };
const ICON: Record<string, string> = { sunny: "☀️", "mostly sunny": "🌤️", "partly cloudy": "⛅", cloudy: "☁️", foggy: "🌫️", drizzle: "🌦️", "light rain": "🌧️", rain: "🌧️", "heavy rain": "🌧️", showers: "🌦️", thunderstorm: "⛈️" };
export default function PartnerGreeting({ name }: { name: string }) {
  const { lang } = useLang(); const it = lang === "it";
  const [now, setNow] = useState<Date | null>(null); const [w, setW] = useState<W | null>(null);
  useEffect(() => { setNow(new Date()); const id = setInterval(() => setNow(new Date()), 30000); fetch("/api/partner/weather").then((r) => r.json()).then(setW).catch(() => {}); return () => clearInterval(id); }, []);
  if (!now) return null;
  const h = now.getHours();
  const greet = it ? (h < 12 ? "Buongiorno" : h < 18 ? "Buon pomeriggio" : "Buonasera") : (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  const cap = name ? name.charAt(0).toUpperCase() + name.slice(1) : "";
  const fmt = (tz: string) => now.toLocaleTimeString(it ? "it-IT" : "en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz });
  const local = fmt(Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Rome"), il = fmt("Asia/Jerusalem");
  const ilH = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Jerusalem" }).format(now));
  const online = ilH >= 7 && ilH < 19;
  const wx = w && w.temp !== null ? ` · ${ICON[w.en] || "🌡️"} ${w.temp}°C ${it ? w.it : w.en}` : "";
  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/60 px-4 py-3 text-sm flex flex-wrap items-center gap-x-4 gap-y-1" dir="ltr">
      <div className="text-lg font-bold text-ink-900">{greet}{cap ? ", " + cap : ""} 👋</div>
      <div className="text-slate-600">🕒 {local} {it ? "da voi" : "your time"} · <b>{il} {it ? "in Israele" : "in Israel"}</b>{wx} {it ? "a Tel Aviv" : "in Tel Aviv"}</div>
      <div className={"text-xs px-2 py-0.5 rounded-full " + (online ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600")}>{online ? (it ? "● Avshi è online ora (07–19 ora israeliana)" : "● Avshi is online now (07–19 Israel time)") : (it ? "○ Avshi risponde dalle 07 ora israeliana" : "○ Avshi is back from 07:00 Israel time")}</div>
    </div>
  );
}
