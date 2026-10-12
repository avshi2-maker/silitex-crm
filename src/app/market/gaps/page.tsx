"use client";
// page.tsx (src/app/market/gaps/page.tsx) · updated 12.10.2026 12:40 (Asia/Jerusalem) — "Israel Market Request": the cosmetic silicone molecules Silitex does not make (data/gaps.json), who buys them in Israel, incumbents, and Silitex answer boxes (Make / Source / Resell / No) for the meeting. Print + export bar + Excel/CSV for Federica to fill and mail back (alphabetical, answer columns).
import { useState } from "react";
import Link from "next/link";
import { Card, H1, Badge, btnGhost, inputCls } from "@/components/ui";
import { useLang } from "@/i18n";
import ExportBar from "@/components/ExportBar";
import gaps from "@/data/gaps.json";
import leads from "@/data/leads.json";
import { buildRows, downloadXlsx, downloadCsv } from "@/lib/gaps-export";
type Gap = { id: string; query: string; aliases: string[]; what: string; producers: string; silitex: string; history?: string; action: string; status: string; added: string };
const GAPS = gaps as Gap[];
const COSMETIC = (leads as { id: string; name: string; industry: string }[]).filter((l) => /Cosmet|Personal/i.test(l.industry)).map((l) => l.name.replace(/\s*\(.*\)/, ""));
const ANSWERS = ["Make", "Source from partner", "Resell under Silitex label", "No"];
const EST: Record<string, string> = { "GAP-001": "~5", "GAP-002": "~2–3", "GAP-003": "~8–12", "GAP-004": "~5–8", "GAP-005": "~1–2", "GAP-006": "~3" };
export default function GapsPage() {
  const { t: tr, lang } = useLang();
  const [ans, setAns] = useState<Record<string, { a: string; lt: string; note: string }>>({});
  const [est, setEst] = useState<Record<string, string>>(EST);
  const set = (id: string, k: "a" | "lt" | "note", v: string) => setAns((s) => { const cur = s[id] || { a: "", lt: "", note: "" }; return { ...s, [id]: { ...cur, [k]: v } }; });
  const FN = "Silitex_Israel_Market_Request_" + new Date().toLocaleDateString("en-GB").replace(/\//g, "") ;
  const rows = () => buildRows(GAPS, COSMETIC.join(", "), est);
  const text = ["ISRAEL MARKET REQUEST — silicone molecules not in the Silitex catalogue (verified silitex.it 12/10/2026)", "", ...GAPS.map((g) => [g.id + " · " + g.query + " · status: " + g.status, "What: " + g.what, "Israeli buyers: " + COSMETIC.join(", "), "Est. Israeli market: " + (est[g.id] || "?") + " t/yr", "Incumbents: " + g.producers, "Silitex today: " + g.silitex, "Silitex answer: " + (ans[g.id]?.a || "____") + " · lead time: " + (ans[g.id]?.lt || "____") + (ans[g.id]?.note ? " · " + ans[g.id].note : ""), ""].join("\n")), "Ask: for every 'No' — written carve-out so Sapirim may source that molecule elsewhere and keep the Israeli cosmetics basket under one hand."].join("\n");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden"><Link href="/market" className={btnGhost}>← {tr("מנוע פיתוח שוק")}</Link><Badge tone="red">{GAPS.length} {tr("פערים")}</Badge></div>
      <H1 sub={tr("מולקולות סיליקון שלקוחות הקוסמטיקה בישראל קונים ו-Silitex לא מייצרת — אומת מול silitex.it (318 מוצרים, 35 קטגוריות). לכל שורה: תשובת Silitex בפגישה.")}>{tr("🇮🇱 בקשת שוק ישראל — פערי קטלוג")}</H1>
      <Card className="text-sm bg-amber-50/50 border-amber-200">
        <b>{tr("איך להציג:")}</b> {tr("לא תלונה — מודיעין שוק שאני מביא ל-Silitex. הסחורה הגנרית (דימתיקון, D5) לא המשחק שלנו מול Wacker / Shin-Etsu במלאי מקומי; אלה 5–6 המולקולות שסוגרות סל קוסמטיקה שלם תחת יד אחת.")}
      </Card>
      <div className="overflow-auto"><table className="w-full text-xs border">
        <thead className="bg-slate-50 text-slate-500"><tr><th className="p-2 text-start">#</th><th className="p-2 text-start">{tr("מולקולה (INCI)")}</th><th className="p-2 text-start">{tr("מי קונה בישראל")}</th><th className="p-2 text-start">{tr("שוק משוער ט/שנה")}</th><th className="p-2 text-start">{tr("ספק נוכחי")}</th><th className="p-2 text-start">Silitex {tr("היום")}</th><th className="p-2 text-start print:hidden">{tr("תשובת Silitex")}</th></tr></thead>
        <tbody>{GAPS.map((g) => { const a = ans[g.id] || { a: "", lt: "", note: "" }; return (
          <tr key={g.id} className="border-t align-top">
            <td className="p-2 whitespace-nowrap"><b>{g.id}</b><div>{g.status === "partial" ? <Badge tone="amber">{tr("חלקי")}</Badge> : <Badge tone="red">{tr("פער")}</Badge>}</div></td>
            <td className="p-2 min-w-[180px]"><b>{g.query}</b><div className="text-slate-600 mt-1">{g.what}</div><div className="text-[11px] text-slate-400 mt-1" dir="ltr">{g.aliases.slice(0, 5).join(" · ")}</div></td>
            <td className="p-2">{COSMETIC.join(", ")}</td>
            <td className="p-2"><input className={inputCls + " w-20 print:border-0"} value={est[g.id] || ""} onChange={(e) => setEst((s) => ({ ...s, [g.id]: e.target.value }))} /><div className="text-[10px] text-slate-400 print:hidden">{tr("הערכה — החלף בניסיון שלך")}</div></td>
            <td className="p-2" dir="ltr">{g.producers}</td>
            <td className="p-2">{g.silitex}</td>
            <td className="p-2 print:hidden min-w-[200px] space-y-1">
              <div className="flex flex-wrap gap-1">{ANSWERS.map((x) => <button key={x} onClick={() => set(g.id, "a", x)} className={"px-2 py-0.5 rounded border text-[11px] " + (a.a === x ? (x === "No" ? "bg-red-600 text-white" : "bg-emerald-600 text-white") : "bg-white")}>{x}</button>)}</div>
              <input className={inputCls} placeholder={tr("זמן אספקה / MOQ")} value={a.lt} onChange={(e) => set(g.id, "lt", e.target.value)} />
              <input className={inputCls} placeholder={tr("הערת Silitex")} value={a.note} onChange={(e) => set(g.id, "note", e.target.value)} />
            </td>
          </tr>); })}</tbody></table></div>
      <Card className="text-sm"><b>▶ {tr("הסגירה:")}</b> {tr("לכל \"No\" — סעיף חוזי כתוב: Sapirim רשאי לרכוש את המולקולה הזו מספק שני, כדי שסל הקוסמטיקה הישראלי (AHAVA, Peer Pharm, Moroccanoil) יישאר שלם תחת יד אחת. ")}<span className="text-slate-500">{tr("מקור: docs/GAPS_ANNEX.md · data/gaps.json")}</span></Card>
      <Card className="text-sm flex flex-wrap items-center gap-2 print:hidden"><b>📤 {tr("לפדריקה — למילוי ולהחזרה במייל:")}</b><button className={btnGhost} onClick={() => downloadXlsx(rows(), FN)}>📊 Excel (.xlsx)</button><button className={btnGhost} onClick={() => downloadCsv(rows(), FN)}>📄 CSV</button><a className={btnGhost} href={"mailto:federicabiti@silitex.it?subject=" + encodeURIComponent("Israel Market Request — molecules not in the Silitex catalogue") + "&body=" + encodeURIComponent("Dear Federica,\n\nAttached is the Israel Market Request sheet: " + GAPS.length + " silicone molecules our cosmetics accounts buy that I could not find in the Silitex catalogue. Could you fill columns K-O (answer / lead time / MOQ / indicative price / notes) and send it back?\n\nThank you,\nAvshi Sapir · Sapirim")}>📧 {tr("מייל לפדריקה (צרף את הקובץ)")}</a><span className="text-xs text-slate-500">{tr("ממוין א-ב · עמודת עדיפות לפי נפח משוער · עמודות K–O ריקות למילוי Silitex")}</span></Card>
      <ExportBar title={lang === "he" ? "בקשת שוק ישראל — פערי קטלוג Silitex" : "Israel Market Request — Silitex catalogue gaps"} text={text} filename="silitex_gaps_annex_12102026" />
    </div>
  );
}
