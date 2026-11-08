"use client";
// SilitexLeadRequest.tsx (src/components/leads/SilitexLeadRequest.tsx) · created 08.11.2026 07:10 (Asia/Jerusalem) — v1.6.0
// 🇮🇹 On the customer page: transparent lead report to Silitex (Federica, CC Eleonora) — customer name + website, the customer's own
// request (Outlook / Hub), our first answer (Hub sent mail, or the pitch drafted here) → focused technical-support request.
// Outlook draft (you press Send) + the open points go into the Federica register linked to this customer. Token meter + export bar.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, btnPrimary, btnGhost, inputCls, Badge } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { PRIO } from "@/lib/fq-types";
import { mailsFor, rowsInText, catLine, offLine, type CustomerMail } from "@/lib/pitch-data";
import { splitMail, cleanUrl } from "@/lib/mail-text";
import { outlookDraft } from "@/lib/outlook-draft";
import { useLang } from "@/i18n";
import type { Lead, SilitexContact, Usage, HubMsg, Thread } from "@/lib/types";

type Qi = { q: string; cat: string; prio: "blocker" | "important" | "nice"; on: boolean };
type Props = { lead: Lead; contacts: SilitexContact[]; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void; addActivity: (id: string, kind: string, text: string) => void };

export default function SilitexLeadRequest({ lead, contacts, spend, addSpend, addActivity }: Props) {
  const { t: tr } = useLang();
  const mg = contacts.filter((c) => c.dept === "mgmt" && c.email && !/^info@/i.test(c.email));
  const to = (mg.find((c) => /federica/i.test(c.name)) || mg[0])?.email || "info@silitex.it"; const cc = mg.map((c) => c.email).filter((e) => e !== to).join(";");
  const [mails, setMails] = useState<CustomerMail[]>([]); const [reply, setReply] = useState({ text: "", at: "" });
  const [extra, setExtra] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [ok, setOk] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null); const [text, setText] = useState(""); const [qs, setQs] = useState<Qi[]>([]);
  useEffect(() => { fetch("/api/hub/ingest", { cache: "no-store" }).then((r) => r.json()).then((j) => { const m = mailsFor(lead.id, (j.threads || []) as Thread[], (j.msgs || []) as HubMsg[]); setMails(m.inbound); setReply({ text: m.lastReply, at: m.lastReplyAt }); }).catch(() => {}); }, [lead.id]);
  const it = lead.intake || {}; const pitchAt = it.LAST_PITCH_AT || "";
  const answer = pitchAt > reply.at ? it.LAST_PITCH || "" : reply.text || it.LAST_PITCH || "";
  const request = mails.slice(-2).map((m) => "Subject: " + m.subject + "\nFrom: " + m.from + "\n" + m.body).join("\n---\n");
  const site = cleanUrl(lead.website);

  const run = async () => {
    setBusy(true); setErr(""); setOk("");
    try {
      const { cat, off } = rowsInText(request + " " + answer);
      const body = { customer: lead.name, website: site, industry: [lead.industry, lead.sub_industry].filter(Boolean).join(" — "), city: lead.city, contact: [lead.contact_name, lead.contact_role, lead.contact_email].filter(Boolean).join(", "), request, answer, rows: [...cat.map(catLine), ...off.map(offLine)].join("\n"), files: it.LAST_PITCH_FILES || "", extra };
      const r = await fetch("/api/silitex-lead-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json(); if (j.usage) { setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); } if (!r.ok) throw new Error(j.error || "error");
      setText("Subject: " + j.subject + "\n\n" + j.body); setQs((j.questions || []).map((x: Omit<Qi, "on">) => ({ ...x, on: true })));
    } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
    setBusy(false);
  };
  const draft = async () => {
    const win = window.open("", "_blank"); if (!win) return setErr(tr("הדפדפן חסם חלון — אפשר חלונות קופצים לאתר"));
    try {
      const m = splitMail(text, "New lead Israel — " + lead.name); await outlookDraft({ to, cc, subject: m.subject, html: m.html }, win);
      const pick = qs.filter((x) => x.on); const now = new Date().toISOString(); const stamp = Date.now().toString(36);
      const items = pick.map((x, i) => ({ id: "fq-" + stamp + "-" + i, q: x.q, cat: x.cat, who: "Federica", prio: x.prio, party: "silitex", status: "asked", asked: [now], answer: "", answered_at: null, leads: [lead.id], note: "Lead request: " + lead.name + " · " + m.subject.slice(0, 120), created_at: now, due: null }));
      const r = items.length ? await fetch("/api/federica", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) }) : null;
      addActivity(lead.id, "email", "🇮🇹 " + tr("בקשת תמיכה ל-Silitex — טיוטה ב-Outlook") + ": " + m.subject + (items.length ? " · " + items.length + " " + tr("שאלות לרישום") : ""));
      setOk("✓ " + tr("טיוטה מוכנה ב-Outlook") + (r ? (r.ok ? " · " + items.length + " " + tr("שאלות נוספו לרישום פדריקה") : " · " + tr("הרישום נכשל")) : ""));
    } catch (e) { try { win.close(); } catch { /* */ } setErr(e instanceof Error ? e.message : "error"); }
  };
  const missing = !request && !answer;
  return (
    <Card className="space-y-2 border-brand-100">
      <div className="flex flex-wrap items-center gap-2"><b className="flex-1">🇮🇹 {tr("בקשת תמיכה מ-Silitex על הליד הזה")}</b><span className="text-xs text-slate-500" dir="ltr">{to}{cc ? " · cc " + cc.replace(/;/g, ", ") : ""}</span><button className={btnPrimary} disabled={busy || missing} onClick={run}>{busy ? tr("כותב…") : text ? "🔄 " + tr("כתוב מחדש") : "✨ " + tr("טיוטת מייל ל-Silitex")}</button></div>
      <div className="text-xs text-slate-500 flex flex-wrap gap-x-3">
        <span>{tr("שקיפות מלאה")}: {lead.name}{site && <> · <a className="underline" href={site} target="_blank" rel="noreferrer" dir="ltr">{site}</a></>}</span>
        <span>{mails.length ? "✓ " + tr("בקשת הלקוח") + " (" + mails.length + ")" : "— " + tr("אין מייל לקוח ב-Hub")}</span>
        <span>{answer ? "✓ " + tr("התשובה הראשונה שלנו") : "— " + tr("עוד לא ענינו")}</span>
      </div>
      {missing && <div className="text-xs text-amber-700">{tr("אין עדיין בקשת לקוח או תשובה שלנו לצטט — צור קודם תשובה בכרטיס הפיץ'.")}</div>}
      <input className={inputCls + " text-sm"} placeholder={tr("הערה נוספת לפדריקה (לא חובה) — למשל: לקוח חשוב, דחוף, פוטנציאל…")} value={extra} onChange={(e) => setExtra(e.target.value)} />
      <TokenMeter usage={usage} sessionTokens={spend.tokens} sessionCost={spend.cost} busy={busy} />
      {err && <div className="text-sm text-red-600">{err}</div>}
      {text && <>
        <textarea className={inputCls + " text-sm leading-6"} dir="ltr" rows={16} value={text} onChange={(e) => setText(e.target.value)} />
        <div className="border rounded-xl p-2 space-y-1">
          <div className="text-sm font-medium">{tr("שאלות לרישום פדריקה")} <Badge tone="blue">{qs.filter((x) => x.on).length}</Badge></div>
          {qs.map((x, i) => (<label key={i} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={x.on} onChange={(e) => setQs(qs.map((y, k) => (k === i ? { ...y, on: e.target.checked } : y)))} className="mt-1" /><span>{PRIO[x.prio]?.icon}</span><span className="flex-1" dir="ltr">{x.q}</span><span className="text-[11px] text-slate-400">{x.cat}</span></label>))}
        </div>
        <div className="flex flex-wrap items-center gap-2"><button className={btnPrimary} onClick={draft}>📧 {tr("טיוטה ב-Outlook + רישום")}</button><button className={btnGhost} disabled={busy} onClick={run}>↻ {tr("צור מחדש")}</button>{ok && <span className="text-xs text-emerald-700">{ok} · <Link href="/federica" className="underline">/federica</Link></span>}</div>
        <ExportBar title={"Silitex — " + lead.name} text={text} />
      </>}
    </Card>
  );
}
