"use client";
// use-scan-jobs.ts (src/lib/use-scan-jobs.ts) · created 22.10.2026 08:30 (Asia/Jerusalem) — client hook for the SERVER SCAN QUEUE: polls /api/scan/jobs (10 s while working, 60 s idle), applies finished server results to the customers (scan → withScan, failure → withScanErr, never over a newer scan), enqueue + cancel.
import { useEffect, useRef, useState } from "react";
import { withScan, withScanErr, errHe, scanOf, type ScanResult } from "@/lib/scan";
import type { Lead } from "@/lib/types";
export type QStatus = { queued: number; running: { name: string; started_at: string | null }[]; done24: number; failed24: number; cost24: number; avgCost: number; recent: { name: string; status: string; error: string | null; finished_at: string | null; cost_usd: number }[] };
type Res = { id: string; lead_id: string; status: string; result: ScanResult | null; error: string | null; finished_at: string };
const KEY = "silitex-scanjobs-since";
const getSince = () => { try { return localStorage.getItem(KEY) || new Date(Date.now() - 7 * 86400000).toISOString(); } catch { return new Date(Date.now() - 7 * 86400000).toISOString(); } };
export function useScanJobs(leads: Lead[], upsertLead: (l: Lead) => void, ready: boolean) {
  const [st, setSt] = useState<QStatus | null>(null); const [applied, setApplied] = useState(0); const leadsRef = useRef(leads); leadsRef.current = leads;
  const poll = async () => {
    try {
      const r = await fetch("/api/scan/jobs?since=" + encodeURIComponent(getSince()), { cache: "no-store" }); if (!r.ok) return; const j = await r.json(); setSt(j);
      let last = getSince(), n = 0;
      for (const x of (j.results || []) as Res[]) {
        const l = leadsRef.current.find((y) => y.id === x.lead_id);
        if (l) { const cur = scanOf(l); if (x.status === "done" && x.result && (!cur || cur.at < x.result.at)) { upsertLead(withScan(l, x.result)); n++; } else if (x.status === "failed" && (!cur || cur.at < x.finished_at)) { upsertLead(withScanErr(l, errHe(x.error || "error"))); n++; } }
        if (x.finished_at > last) last = x.finished_at;
      }
      try { localStorage.setItem(KEY, last); } catch {}
      if (n) setApplied((a) => a + n);
    } catch {}
  };
  const busy = !!st && (st.queued > 0 || st.running.length > 0);
  useEffect(() => { if (!ready) return; poll(); const t = setInterval(poll, busy ? 10000 : 60000); return () => clearInterval(t); }, [ready, busy]); // eslint-disable-line react-hooks/exhaustive-deps
  const enqueue = async (ls: Lead[]) => { const r = await fetch("/api/scan/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: ls.filter((l) => l.website).map((l) => ({ lead_id: l.id, name: l.name, website: l.website, industry: l.industry })) }) }); const j = await r.json().catch(() => ({})); await poll(); return (j.queued as number) || 0; };
  const cancel = async () => { await fetch("/api/scan/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel" }) }); await poll(); };
  return { st, busy, applied, enqueue, cancel, poll };
}
