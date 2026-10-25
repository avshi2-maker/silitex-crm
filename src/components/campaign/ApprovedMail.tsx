"use client";
// ApprovedMail.tsx (src/components/campaign/ApprovedMail.tsx) · created 25.10.2026 05:30 (Asia/Jerusalem) — ✅ approved campaign text for the chosen industry + channel: subject + body, 📋 copy subject / body, ✉ open in Outlook, 5-button export bar.
import { useState } from "react";
import { useLang } from "@/i18n";
import { Card, Badge, btnPrimary, btnGhost } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import { CAMPAIGN_TEMPLATES } from "@/config/campaign-templates";

export default function ApprovedMail({ ind, channel }: { ind: string; channel: string }) {
  const { t: tr } = useLang(); const [copied, setCopied] = useState("");
  const t = CAMPAIGN_TEMPLATES.find((x) => x.ind === ind && x.channel === channel);
  if (!t) return null;
  const copy = async (txt: string, what: string) => { try { await navigator.clipboard.writeText(txt); setCopied(what); setTimeout(() => setCopied(""), 2000); } catch {} };
  const mail = "mailto:?subject=" + encodeURIComponent(t.subject) + "&body=" + encodeURIComponent(t.body);
  return (
    <Card className="space-y-2 border-2 border-emerald-300">
      <div className="flex flex-wrap items-center gap-2"><Badge tone="green">✅ {tr("נוסח מאושר")}</Badge><h3 className="font-bold">{tr(t.title)}</h3>
        <span className="ms-auto flex gap-1"><button className={btnGhost} onClick={() => copy(t.subject, "s")}>{copied === "s" ? "✓" : "📋"} {tr("העתק נושא")}</button><button className={btnPrimary} onClick={() => copy(t.body, "b")}>{copied === "b" ? "✓" : "📋"} {tr("העתק גוף")}</button><a className={btnGhost} href={mail}>✉ Outlook</a></span></div>
      <div className="text-sm"><span className="text-slate-500">{tr("נושא")}:</span> <b dir="rtl">{t.subject}</b></div>
      <pre dir="rtl" className="whitespace-pre-wrap font-sans text-sm bg-slate-50 rounded-lg p-3 max-h-[28rem] overflow-y-auto">{t.body}</pre>
      <ExportBar title={t.subject} text={t.body} filename={t.id + ".txt"} />
    </Card>
  );
}
