"use client";
// store.ts (src/lib/expo/store.ts) · updated 18.10.2026 11:30 (Asia/Jerusalem) — EXPO (guest field mode for Silitex staff) storage: lives ONLY on the user's phone (localStorage "silitex-expo-v1"). Never touches the owner CRM store or Supabase — no owner leads in, nothing of hers out.
import { useCallback, useEffect, useState } from "react";
export type ExpoMeeting = { id: string; at: string; company: string; contact_name: string; contact_role: string; phone: string; email: string; website: string; city: string; industry: string; note: string; summary: string; products: string[]; next_step: string; due: string; done: boolean; followup: string };
export type ExpoProfile = { first: string; last: string; title: string; company: string; phone: string; email: string; website: string };
export type ExpoState = { meetings: ExpoMeeting[]; profile: ExpoProfile; spend: { tokens: number; cost: number } };
const KEY = "silitex-expo-v1";
export const EMPTY_PROFILE: ExpoProfile = { first: "", last: "", title: "", company: "Silitex S.r.l.", phone: "", email: "", website: "www.silitex.it" };
const EMPTY: ExpoState = { meetings: [], profile: EMPTY_PROFILE, spend: { tokens: 0, cost: 0 } };
function load(): ExpoState { try { const r = localStorage.getItem(KEY); if (r) { const s = JSON.parse(r); return { ...EMPTY, ...s, profile: { ...EMPTY_PROFILE, ...(s.profile || {}) } }; } } catch {} return EMPTY; }
export function useExpo() {
  const [state, setState] = useState<ExpoState>(EMPTY); const [ready, setReady] = useState(false);
  useEffect(() => { setState(load()); setReady(true); }, []);
  const update = useCallback((fn: (s: ExpoState) => ExpoState) => { setState((prev) => { const next = fn(prev); try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} return next; }); }, []);
  return {
    state, ready,
    saveMeeting: (m: ExpoMeeting) => update((s) => ({ ...s, meetings: [m, ...s.meetings.filter((x) => x.id !== m.id)] })),
    patchMeeting: (id: string, p: Partial<ExpoMeeting>) => update((s) => ({ ...s, meetings: s.meetings.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
    removeMeeting: (id: string) => update((s) => ({ ...s, meetings: s.meetings.filter((x) => x.id !== id) })),
    setProfile: (p: ExpoProfile) => update((s) => ({ ...s, profile: p })),
    addSpend: (tokens: number, cost: number) => update((s) => ({ ...s, spend: { tokens: s.spend.tokens + tokens, cost: s.spend.cost + cost } })),
  };
}
export type Expo = ReturnType<typeof useExpo>;
