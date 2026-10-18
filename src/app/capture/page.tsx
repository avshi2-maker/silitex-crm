"use client";
// page.tsx (src/app/capture/page.tsx) · updated 18.10.2026 07:05 (Asia/Jerusalem) — OWNER ONLY. Field inbox: everything captured on the phone (cards, photos, voice, video, notes) waiting in Cloudinary, grouped by meeting → process at the office → CRM
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { H1, Card, btnGhost } from "@/components/ui";
import MeetingGroup from "@/components/capture/MeetingGroup";
import type { InboxGroup } from "@/app/api/capture/inbox/route";
import { useLang } from "@/i18n";
export default function CapturePage() {
  const { t: tr } = useLang();
  const { ready } = useStore();
  const [groups, setGroups] = useState<InboxGroup[] | null>(null); const [err, setErr] = useState("");
  const load = async () => { setErr(""); setGroups(null); const r = await fetch("/api/capture/inbox", { cache: "no-store" }); const j = await r.json().catch(() => ({})); if (!r.ok) { setErr(j.error || "error"); setGroups([]); } else setGroups(j.groups); };
  useEffect(() => { load(); }, []);
  if (!ready) return null;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2"><H1 sub={tr("מה שצולם והוקלט בשטח (Cloudinary) ועדיין לא עובד — פגישה אחרי פגישה: עיבוד AI → שמירה ל-CRM.")}>📥 {tr("תיבת שטח")}</H1><div className="flex gap-2"><button className={btnGhost} onClick={load}>🔄 {tr("רענן")}</button><Link href="/field" className={btnGhost}>📱 {tr("מצב שטח")}</Link></div></div>
      {err && <Card className="border-amber-300 bg-amber-50 text-sm">⚠️ {err}<div className="mt-1">{tr("הגדרה חד-פעמית ב-Vercel → Settings → Environment Variables: CLOUDINARY_URL (מ-Cloudinary → API Keys) ו-OPENAI_API_KEY, ואז Redeploy.")}</div></Card>}
      {groups === null && <div className="text-sm text-slate-400">{tr("טוען…")}</div>}
      {groups && groups.length === 0 && !err && <Card className="text-sm text-slate-500">✓ {tr("אין פריטים ממתינים. העלאות חדשות מופיעות כאן תוך דקה.")}</Card>}
      {groups?.map((g) => <MeetingGroup key={g.meeting} g={g} onDone={() => setGroups((p) => (p || []).filter((x) => x.meeting !== g.meeting))} />)}
    </div>
  );
}
