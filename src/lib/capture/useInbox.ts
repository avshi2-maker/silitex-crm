"use client";
// useInbox.ts (src/lib/capture/useInbox.ts) · updated 19.10.2026 09:45 (Asia/Jerusalem) — refreshes at once after delete / save in the inbox · 09:30 — FIELD INBOX NUDGE: checks /api/capture/count every 60 s + when the window gets focus. Returns the number waiting and a "new" flag when something arrived after the last time the owner opened the Field inbox (remembered in this browser). Tab title shows (N).
import { useCallback, useEffect, useRef, useState } from "react";
const SEEN = "silitex-inbox-seen-v1";
export type Inbox = { count: number; meetings: number; latest: string; fresh: boolean; markSeen: () => void };
export function useInbox(enabled: boolean, onCapturePage: boolean): Inbox {
  const [s, setS] = useState({ count: 0, meetings: 0, latest: "" }); const [seen, setSeen] = useState("");
  const base = useRef("");
  useEffect(() => { try { setSeen(localStorage.getItem(SEEN) || ""); } catch {} }, []);
  const load = useCallback(() => { if (!enabled || document.hidden) return; fetch("/api/capture/count", { cache: "no-store" }).then((r) => r.json()).then((j) => setS({ count: j.count || 0, meetings: j.meetings || 0, latest: j.latest || "" })).catch(() => {}); }, [enabled]);
  useEffect(() => { if (!enabled) return; load(); const t = setInterval(load, 60000); const f = () => load(); window.addEventListener("focus", f); window.addEventListener("silitex-inbox-changed", f); document.addEventListener("visibilitychange", f); return () => { clearInterval(t); window.removeEventListener("focus", f); window.removeEventListener("silitex-inbox-changed", f); document.removeEventListener("visibilitychange", f); }; }, [enabled, load]);
  const markSeen = useCallback(() => { const v = s.latest || new Date().toISOString(); setSeen(v); try { localStorage.setItem(SEEN, v); } catch {} }, [s.latest]);
  useEffect(() => { if (onCapturePage && s.latest && s.latest !== seen) markSeen(); }, [onCapturePage, s.latest, seen, markSeen]);
  useEffect(() => { if (!enabled) return; if (!base.current) base.current = document.title.replace(/^\(\d+\)\s*/, ""); document.title = (s.count ? "(" + s.count + ") " : "") + base.current; }, [s.count, enabled]);
  return { ...s, fresh: !!s.count && !!s.latest && s.latest > seen, markSeen };
}
