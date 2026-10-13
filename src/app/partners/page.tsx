// page.tsx (src/app/partners/page.tsx) · updated 13.10.2026 06:40 (Asia/Jerusalem) — OWNER view: partner (Silitex staff) usage — logins, AI questions, tokens, cost per partner + last 50 questions. Server component (service role). Not visible to partners (not in PARTNER_PREFIXES).
import { partnerStats } from "@/lib/partner-usage";
import { Card, H1, Badge } from "@/components/ui";
export const dynamic = "force-dynamic";
const d = (s: string | null) => s ? new Date(s).toLocaleString("en-GB", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
export default async function PartnersPage() {
  const { stats, recent } = await partnerStats();
  const pins = (process.env.PARTNER_PINS || "").split(",").map((x) => x.split(":")[0]?.trim()).filter(Boolean);
  const tot = stats.reduce((a, s) => ({ asks: a.asks + s.asks, cost: a.cost + s.cost_usd }), { asks: 0, cost: 0 });
  return (
    <div className="space-y-4">
      <H1 sub="גישת שותף (צוות Silitex): עמודי ידע בלבד — Ask / קטלוג / מקבילות / נוסחאות / FAQ. כל שאלת AI נרשמת עם טוקנים ועלות — הבסיס לשיחת 'הצוות שלכם שאל N שאלות' בעוד חצי שנה.">🤝 שותפים — שימוש Silitex</H1>
      <Card className="text-sm flex flex-wrap gap-2 items-center"><b>משתמשים מוגדרים (PARTNER_PINS ב-Vercel):</b>{pins.length ? pins.map((p) => <Badge key={p} tone="blue">{p}</Badge>) : <Badge tone="amber">לא הוגדר — הוסף PARTNER_PINS="federica:XXXX" ב-Vercel</Badge>}<span className="text-slate-500">· כניסה: /login → לשונית Silitex partner · שם + PIN</span><Badge tone="green">{tot.asks} שאלות</Badge><Badge tone="slate">${tot.cost.toFixed(2)}</Badge></Card>
      <Card><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-2 text-start">שותף</th><th className="p-2 text-start">כניסות</th><th className="p-2 text-start">שאלות AI</th><th className="p-2 text-start">טוקנים</th><th className="p-2 text-start">עלות $</th><th className="p-2 text-start">אחרון</th></tr></thead>
        <tbody>{stats.length === 0 && <tr><td className="p-2 text-slate-400" colSpan={6}>אין שימוש עדיין (או טבלת partner_usage לא נוצרה — הרץ את ה-SQL מ-supabase/schema.sql).</td></tr>}{stats.map((s) => <tr key={s.partner} className="border-t"><td className="p-2 font-medium">{s.partner}</td><td className="p-2">{s.logins}</td><td className="p-2">{s.asks}</td><td className="p-2">{s.tokens.toLocaleString()}</td><td className="p-2">{s.cost_usd.toFixed(3)}</td><td className="p-2" dir="ltr">{d(s.last_at)}</td></tr>)}</tbody></table></Card>
      <Card><div className="font-bold mb-2">50 השאלות האחרונות</div><div className="space-y-1 text-sm">{recent.map((r, i) => <div key={i} className="border-t pt-1 flex gap-2"><span className="text-slate-400 whitespace-nowrap" dir="ltr">{d(r.at)}</span><Badge tone="blue">{r.partner}</Badge><span dir="auto" className="flex-1">{r.question}</span><span className="text-slate-400">${Number(r.cost_usd || 0).toFixed(3)}</span></div>)}{recent.length === 0 && <div className="text-slate-400">—</div>}</div></Card>
    </div>
  );
}
