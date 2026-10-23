"use client";
// SilitexBriefCard.tsx (src/components/brief/SilitexBriefCard.tsx) · created 23.10.2026 08:45 (Asia/Jerusalem) — 🇮🇹 SILITEX AGENDA for the 📞 quick brief: Federica / Eleonora call → who (tap to call / WhatsApp / mail), what THEY owe us (open register questions, oldest + blockers first), their Teams action items, what WE owe them, recently answered, our news of the last 7 days, ✨ English call-prep (meter + export bar). Live from /api/silitex-brief + the CRM store.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { useStore } from "@/lib/store";
import { useLang } from "@/i18n";
import { Badge, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import { PRIO, isOpen, daysOpen, type Fq } from "@/lib/fq-types";
import { scanOf } from "@/lib/scan";
import { fmtDate } from "@/lib/format";

type Store = ReturnType<typeof useStore>;
type Mtg = { owner: string; task: string; due: string | null; created_at: string };
const tel = (p?: string) => String(p || "").replace(/[^\d+]/g, "");
const wa = (p?: string) => { const d = String(p || "").replace(/\D/g, ""); return d.length >= 9 ? "https://wa.me/" + d : ""; };

export default function SilitexBriefCard({ store, who, onBack, onClose }: { store: Store; who: string; onBack: () => void; onClose: () => void }) {
  const { t: tr } = useLang(); const { state, addSpend } = store;
  const [items, setItems] = useState<Fq[]>([]); const [mtg, setMtg] = useState<Mtg[]>([]); const [err, setErr] = useState("");
  useEffect(() => { fetch("/api/silitex-brief", { cache: "no-store" }).then((r) => r.json()).then((j) => { if (j.items) { setItems(j.items); setMtg(j.mtg || []); } else setErr(j.error || "error"); }).catch(() => setErr("network")); }, []);
  const FALLBACK = [{ id: "fb-fed", dept: "mgmt", name: "Federica Biti", role: "Export Sales Manager", email: "federicabiti@silitex.it", phone: "+39 0442 411808", mobile: "+39 3462658561" }, { id: "fb-ele", dept: "mgmt", name: "Eleonora Pravato (Mrs)", role: "Export sales assistant", email: "eleonora.pravato@silitex.it", phone: "+39 0442 411808", mobile: "" }];
  const found = state.contacts.filter((c) => /federica|eleonora/i.test(c.name));
  const people = (found.length ? found : FALLBACK).sort((a) => (who && a.name.toLowerCase().includes(who) ? -1 : 1)); // contact list not loaded yet → the known contacts
  const theyOwe = items.filter((f) => f.party === "silitex" && isOpen(f)).sort((a, b) => PRIO[a.prio].rank - PRIO[b.prio].rank || daysOpen(b) - daysOpen(a));
  const weOwe = items.filter((f) => f.party === "sapirim" && isOpen(f));
  const answered = items.filter((f) => f.answered_at && Date.now() - Date.parse(f.answered_at) < 14 * 864e5);
  const theirMtg = mtg.filter((m) => !/avshi/i.test(m.owner)); const ourMtg = mtg.filter((m) => /avshi/i.test(m.owner));
  const news = useMemo(() => {
    const ago = Date.now() - 7 * 864e5; const fresh = state.leads.filter((l) => l.created_at && Date.parse(l.created_at) >= ago);
    const by = new Map<string, number>(); fresh.forEach((l) => by.set(l.industry, (by.get(l.industry) || 0) + 1));
    const scans = state.leads.filter((l) => { const s = scanOf(l); return s && Date.parse(s.at) >= ago; });
    const matched = scans.filter((l) => (scanOf(l)?.data.matches || []).some((m) => m.confidence !== "low")).length;
    return { n: fresh.length, by: [...by].sort((a, b) => b[1] - a[1]).slice(0, 4), scans: scans.length, matched, samples: state.samples.filter((s) => s.sent_at && Date.parse(s.sent_at) >= ago).length };
  }, [state]);
  const ctx = [
    "Caller: " + (people[0]?.name || "Silitex") + " (Silitex S.r.l., Italy).",
    "OPEN QUESTIONS SILITEX OWES SAPIRIM (" + theyOwe.length + "): " + theyOwe.slice(0, 12).map((f) => "[" + f.prio + ", " + daysOpen(f) + " days, asked " + f.asked.length + "x] " + f.q).join(" | "),
    "THEIR ACTION ITEMS FROM THE TEAMS MEETING: " + theirMtg.map((m) => m.owner + ": " + m.task).join(" | "),
    "WHAT SAPIRIM OWES SILITEX: " + [...weOwe.map((f) => f.q), ...ourMtg.map((m) => m.task)].join(" | "),
    "ANSWERED IN THE LAST 14 DAYS: " + (answered.map((f) => f.q + " → " + f.answer).join(" | ") || "none"),
    "SAPIRIM NEWS, LAST 7 DAYS: " + news.n + " new producers profiled (" + news.by.map(([k, v]) => k + " " + v).join(", ") + "), " + news.scans + " websites scanned, " + news.matched + " with a Silitex match, " + news.samples + " samples sent.",
  ].join("\n");
  const build = () => ({ prompt: "I am Avshi Sapir (Sapirim, Silitex distributor for Israel). Federica / Eleonora from Silitex is calling me right now. In ENGLISH, short and practical:\n1. Three updates to share first (good news, numbers only, no customer names).\n2. The three most important open questions to push now — polite wording, oldest / blocking first.\n3. What we owe them — what to promise and by when.\n4. One thing to avoid saying.\nUse only the data below.", context: ctx });
  const sec = "border rounded-lg p-2 space-y-1"; const h = "text-xs font-bold text-slate-600";
  return (
    <div className="space-y-3 text-sm" dir="ltr">
      <div className="flex flex-wrap items-start gap-2">
        <button className={btnGhost} onClick={onBack}>← {tr("חזרה לחיפוש")}</button>
        <div className="flex-1 min-w-[12rem]"><div className="font-bold text-base">🇮🇹 Silitex S.r.l. — {tr("סדר יום לשיחה")}</div><div className="text-xs text-slate-500">{theyOwe.length} {tr("שאלות פתוחות אצלם")} · {weOwe.length + ourMtg.length} {tr("אצלנו")}</div></div>
        <Link className={btnGhost} href="/federica" onClick={onClose}>📮 {tr("פנקס השאלות")} ↗</Link>
      </div>
      {err && <div className="text-red-600 text-xs">{err}</div>}
      <div className={sec}>{people.map((c) => <div key={c.id} className="flex flex-wrap gap-2 items-center"><span className="font-medium">{c.name}</span><span className="text-xs text-slate-500">{c.role}</span>{(c.mobile || c.phone) && <a className="text-brand-600 underline" href={"tel:" + tel(c.mobile || c.phone)}>📱 {c.mobile || c.phone}</a>}{wa(c.mobile) && <a className="text-emerald-700 underline" href={wa(c.mobile)} target="_blank" rel="noreferrer">WhatsApp</a>}{c.email && <a className="text-brand-600 underline" href={"mailto:" + c.email}>{c.email}</a>}</div>)}</div>
      <div className={sec}><div className={h}>🔴 {tr("מה הם חייבים לנו")} ({theyOwe.length})</div>{theyOwe.slice(0, 10).map((f) => <div key={f.id} className="flex gap-2 items-start text-[13px]"><span>{PRIO[f.prio].icon}</span><span className="flex-1">{f.q}</span><span className="text-[11px] text-slate-500 whitespace-nowrap">{daysOpen(f)}d · {f.asked.length}×</span></div>)}{theyOwe.length > 10 && <div className="text-xs text-slate-500">+{theyOwe.length - 10}</div>}</div>
      {theirMtg.length > 0 && <div className={sec}><div className={h}>📋 {tr("המשימות שלהם מפגישת Teams")}</div>{theirMtg.map((m, i) => <div key={i} className="text-[13px]"><Badge>{m.owner.split(" ")[0]}</Badge> {m.task}</div>)}</div>}
      <div className={sec}><div className={h}>🟢 {tr("מה אנחנו חייבים להם")} ({weOwe.length + ourMtg.length})</div>{weOwe.map((f) => <div key={f.id} className="text-[13px]">• {f.q}</div>)}{ourMtg.map((m, i) => <div key={i} className="text-[13px]">• {m.task}{m.due ? " · " + fmtDate(m.due) : ""}</div>)}</div>
      {answered.length > 0 && <div className={sec}><div className={h}>✅ {tr("נענו ב-14 הימים האחרונים")}</div>{answered.map((f) => <div key={f.id} className="text-[13px]">{f.q} <span className="text-emerald-700">→ {f.answer}</span></div>)}</div>}
      <div className={sec}><div className={h}>📈 {tr("החדשות שלנו — 7 ימים")}</div><div className="text-[13px]">{news.n} {tr("יצרנים חדשים")}{news.by.length ? " (" + news.by.map(([k, v]) => k + " " + v).join(", ") + ")" : ""} · {news.scans} {tr("אתרים נסרקו")} · {news.matched} {tr("עם התאמת Silitex")} · {news.samples} {tr("דוגמאות נשלחו")}</div></div>
      <div className="border rounded-lg p-2"><AiPanel title={tr("✨ הכנה לשיחה עם Silitex (באנגלית)")} buttonLabel={tr("הכן אותי לשיחה")} lang="en" buildPrompt={build} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} /></div>
    </div>
  );
}
