"use client";
// page.tsx (src/app/market/page.tsx) · updated 11.10.2026 08:50 (Asia/Jerusalem) — 🧭 Market Development Engine (MOCKUP v1): the method (R&D → lab → pilot → purchasing → contract), funnel of target factories, account deep-dive (product lines × Silitex), offset finder. Pitch item for the Silitex team meeting.
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, H1, Badge } from "@/components/ui";
import Funnel, { stageOf } from "@/components/market/Funnel";
import MatchMatrix from "@/components/market/MatchMatrix";
import OffsetFinder from "@/components/market/OffsetFinder";
import { useLang } from "@/i18n";
export default function MarketPage() {
  const { t: tr } = useLang(); const { state, ready } = useStore(); const [sel, setSel] = useState("LEAD-020");
  if (!ready) return null;
  const leads = state.leads; const lead = leads.find((l) => l.id === sel) || leads[0];
  const yr1 = leads.reduce((a, l) => a + l.value_usd, 0), tons = leads.reduce((a, l) => a + l.volume_tons, 0), tam = leads.reduce((a, l) => a + (l.tam_tons || 0), 0);
  const inRd = leads.filter((l) => ["1", "2", "3"].includes(stageOf(l).key)).length, inBuy = leads.filter((l) => stageOf(l).key === "4").length;
  return (
    <div className="space-y-4">
      <H1 sub={tr("מפעלים שכבר משתמשים בסיליקון בייצור → מיפוי קו מוצרים מול קטלוג Silitex → פנייה למו\"פ → דגימה → הסמכה → מעבר לרכש אחרי אישור Silitex. זו העבודה לשנים הבאות.")}>🧭 {tr("מנוע פיתוח שוק — Silitex ישראל")} <Badge tone="amber">MOCKUP v1</Badge></H1>
      <section className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {[[tr("מפעלי יעד"), leads.length, ""], [tr("בתהליך מו\"פ / מעבדה / פיילוט"), inRd, ""], [tr("במשא ומתן רכש"), inBuy, ""], [tr("יעד שנה 1"), "$" + (yr1 / 1000).toFixed(0) + "k", tons + " t"], [tr("קיבולת שוק (TAM)"), tam + " t", tr("לשנה")], [tr("קווי מוצר ממופים"), 7, "AHAVA"]].map(([k, v, s]) => (
          <Card key={String(k)}><div className="text-xs text-slate-500">{k}</div><div className="text-2xl font-bold text-brand-600">{v}</div><div className="text-[11px] text-slate-400">{s}</div></Card>))}
      </section>
      <Card className="bg-slate-900 text-white">
        <div className="font-bold mb-2">{tr("השיטה — 5 שלבים, בעל תפקיד אחד בכל שלב")}</div>
        <div className="grid md:grid-cols-5 gap-2 text-sm">
          {[["🔬", tr("1. פנייה למו\"פ"), tr("מצגת טכנית + דוסייה REACH/FDA/Kosher. יעד: כימאי ראשי מסכים לבדוק.")], ["🧪", tr("2. הסמכה במעבדה"), tr("דגימת 1–5 ק\"ג, בנצ'מרק מול המוצר הקיים (offset). יעד: אישור טכני בכתב.")], ["🏭", tr("3. פיילוט תעשייתי"), tr("חבית / IBC בקו אמיתי. יעד: אישור תפעולי של מנהל המפעל.")], ["🤝", tr("4. רכש"), tr("רק אחרי אישור טכני — מחירון, MOQ, תנאי אספקה, אחרי אישור Silitex.")], ["📜", tr("5. חוזה שנתי"), tr("תחזית שנתית, מלאי בישראל, הזמנה חוזרת. דיווח רבעוני ל-Silitex.")]].map(([i, h, d]) => (<div key={String(h)} className="bg-white/10 rounded-lg p-2"><div className="font-bold">{i} {h}</div><div className="text-xs text-slate-300 mt-1">{d}</div></div>))}
        </div>
      </Card>
      <Funnel leads={leads} sel={lead.id} onSel={setSel} />
      <MatchMatrix lead={lead} />
      <OffsetFinder />
      <Card className="text-xs text-slate-500">{tr("Mockup — להערכה: מה חסר כדי שזה יהיה המסך המרכזי של העבודה היומית? (רעיונות: ניתוח אתר אוטומטי לכל מפעל, מעקב דגימות לפי שלב, דוח רבעוני ל-Silitex בלחיצה)")}</Card>
    </div>
  );
}
