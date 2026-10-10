"use client";
// OutlookBar.tsx (src/components/hub/OutlookBar.tsx) · updated 10.10.2026 06:00 (Asia/Jerusalem) — Phase B banner: connect Outlook (Microsoft login) · status · sync now · last result
import { useEffect, useState } from "react";
import { btnGhost, btnPrimary } from "@/components/ui";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/i18n";
type St = { configured: boolean; connected: boolean; account: string | null; last_sync: string | null; last_result: string | null; domain: string };
export default function OutlookBar({ onSynced }: { onSynced: () => void }) {
  const { t: tr } = useLang(); const [st, setSt] = useState<St | null>(null); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const load = () => fetch("/api/hub/outlook/status").then((r) => r.json()).then(setSt).catch(() => {});
  useEffect(() => { load(); try { const q = new URLSearchParams(window.location.search); if (q.get("outlook") === "connected") setMsg(tr("Outlook חובר: ") + (q.get("account") || "")); if (q.get("outlook") === "error") setMsg(tr("שגיאת חיבור: ") + (q.get("msg") || "")); } catch {} }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const sync = async () => { setBusy(true); setMsg(""); try { const r = await fetch("/api/hub/outlook/sync", { method: "POST" }); const j = await r.json(); setMsg(j.ok ? tr("סונכרן: ") + j.pulled + tr(" מיילים, ") + j.added + tr(" חדשים") : tr("שגיאה: ") + j.error); if (j.ok) { onSynced(); load(); } } catch { setMsg(tr("שגיאה")); } setBusy(false); };
  if (!st) return null;
  return (
    <div className={"rounded-xl border p-3 text-sm flex flex-wrap items-center gap-2 " + (st.connected ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200")}>
      <span className="font-medium">📧 Outlook 365</span>
      {!st.configured && <span className="text-amber-800">{tr("לא מוגדר — חסרים MS_CLIENT_ID / MS_CLIENT_SECRET ב-Vercel")}</span>}
      {st.configured && !st.connected && <><span>{tr("לא מחובר. מושך רק מיילים מ/אל ")}@{st.domain}</span><a className={btnPrimary} href="/api/hub/outlook/connect">{tr("חבר Outlook")}</a></>}
      {st.connected && <><span>{st.account} · {tr("סנכרון אחרון")}: {st.last_sync ? fmtDateTime(st.last_sync) : "—"} {st.last_result && <span className="text-slate-500">({st.last_result})</span>} · {tr("אוטומטי כל 15 דק'")}</span><button className={btnGhost} disabled={busy} onClick={sync}>{busy ? tr("מסנכרן…") : tr("🔄 סנכרן עכשיו")}</button><a className={btnGhost} href="/api/hub/outlook/connect">{tr("חבר מחדש")}</a></>}
      {msg && <span className="text-xs text-slate-600 w-full">{msg}</span>}
    </div>
  );
}
