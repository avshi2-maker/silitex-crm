"use client";
// history.ts (src/lib/studio/history.ts) · updated 18.10.2026 17:10 (Asia/Jerusalem) — POST STUDIO history: last 40 generated packs on this computer (localStorage)
export type Reel = { hook: string; scenes: { sec: string; visual: string; voice: string }[]; caption: string };
export type StudioItem = { lang: string; linkedin: string; facebook: string; reel: Reel; hashtags: string[]; image_prompt: string };
export type StudioPack = { id: string; at: string; topic: string; brand: string; items: StudioItem[] };
const KEY = "silitex-studio-v1";
export function loadPacks(): StudioPack[] { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
export function savePack(p: StudioPack): StudioPack[] { const all = [p, ...loadPacks().filter((x) => x.id !== p.id)].slice(0, 40); try { localStorage.setItem(KEY, JSON.stringify(all)); } catch {} return all; }
export function removePack(id: string): StudioPack[] { const all = loadPacks().filter((x) => x.id !== id); try { localStorage.setItem(KEY, JSON.stringify(all)); } catch {} return all; }
