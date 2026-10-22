"use client";
// PartnersView.tsx (src/components/PartnersView.tsx) · created 22.10.2026 08:45 (Asia/Jerusalem) — owner view of partner (Silitex staff) usage, moved out of the server page so every label translates (EN / IT / RU).
import PartnerFeedbackList from "@/components/PartnerFeedbackList";
import { Card, H1, Badge } from "@/components/ui";
import { useLang } from "@/i18n";
const d = (s: string | null) => s ? new Date(s).toLocaleString("en-GB", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
type Stat = { partner: string; logins: number; asks: number; tokens: number; cost_usd: number; last_at: string | null };
type Recent = { at: string; partner: string; question: string | null; cost_usd: number | string | null };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = { stats: Stat[]; recent: Recent[]; feedback: any[]; pins: string[]; tot: { asks: number; cost: number }; openCount: number };
export default function PartnersView({ stats, recent, feedback, pins, tot, openCount }: Props) {
  const { t: tr } = useLang();
  return (
    <div className="space-y-4">
      <H1 sub={tr("גישת שותף (צוות Silitex): עמודי ידע בלבד — Ask / קטלוג / מקבילות / נוסחאות / FAQ. כל שאלת AI נרשמת עם טוקנים ועלות — הבסיס לשיחת 'הצוות שלכם שאל N שאלות' בעוד חצי שנה.")}>🤝 {tr("שותפים — שימוש Silitex")}</H1>
      <Card className="text-sm flex flex-wrap gap-2 items-center"><b>{tr("משתמשים מוגדרים (PARTNER_PINS ב-Vercel):")}</b>{pins.length ? pins.map((p) => <Badge key={p} tone="blue">{p}</Badge>) : <Badge tone="amber">{tr("לא הוגדר — הוסף PARTNER_PINS=\"federica:XXXX\" ב-Vercel")}</Badge>}<span className="text-slate-500">{tr("· כניסה: /login → לשונית Silitex partner · שם + PIN")}</span><Badge tone="green">{tot.asks} {tr("שאלות")}</Badge><Badge tone="slate">${tot.cost.toFixed(2)}</Badge></Card>
      <Card><div className="font-bold mb-2">💬 {tr("הודעות \"Ask Sapirim\" מהשותפים")} {openCount > 0 && <Badge tone="amber">{openCount} {tr("פתוחות")}</Badge>}</div><PartnerFeedbackList rows={feedback} /></Card>
      <Card><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-2 text-start">{tr("שותף")}</th><th className="p-2 text-start">{tr("כניסות")}</th><th className="p-2 text-start">{tr("שאלות AI")}</th><th className="p-2 text-start">{tr("טוקנים")}</th><th className="p-2 text-start">{tr("עלות $")}</th><th className="p-2 text-start">{tr("אחרון")}</th></tr></thead>
        <tbody>{stats.length === 0 && <tr><td className="p-2 text-slate-400" colSpan={6}>{tr("אין שימוש עדיין (או טבלת partner_usage לא נוצרה — הרץ את ה-SQL מ-supabase/schema.sql).")}</td></tr>}{stats.map((s) => <tr key={s.partner} className="border-t"><td className="p-2 font-medium">{s.partner}</td><td className="p-2">{s.logins}</td><td className="p-2">{s.asks}</td><td className="p-2">{s.tokens.toLocaleString()}</td><td className="p-2">{s.cost_usd.toFixed(3)}</td><td className="p-2" dir="ltr">{d(s.last_at)}</td></tr>)}</tbody></table></Card>
      <Card><div className="font-bold mb-2">{tr("50 השאלות האחרונות")}</div><div className="space-y-1 text-sm">{recent.map((r, i) => <div key={i} className="border-t pt-1 flex gap-2"><span className="text-slate-400 whitespace-nowrap" dir="ltr">{d(r.at)}</span><Badge tone="blue">{r.partner}</Badge><span dir="auto" className="flex-1">{r.question}</span><span className="text-slate-400">${Number(r.cost_usd || 0).toFixed(3)}</span></div>)}{recent.length === 0 && <div className="text-slate-400">—</div>}</div></Card>
    </div>
  );
}
