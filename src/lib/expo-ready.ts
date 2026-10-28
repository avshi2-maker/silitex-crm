// expo-ready.ts (src/lib/expo-ready.ts) · created 28.10.2026 08:30 (Asia/Jerusalem) — v1.3.0 🎪 Expo Ready packs for Federica (Fi Europe Frankfurt + Paint & Coatings Barcelona): types, loader, plain-text export
import fi from "@/data/expo-ready/fi-europe-2026.json";
import pc from "@/data/expo-ready/paint-coatings-2026.json";

export type Stand = {
  company: string; country?: string; hall?: string | null; stand?: string | null; stand_verified?: boolean; list_year?: number;
  website?: string; listing_url?: string; what_they_make: string; angle?: string; grade: "A" | "B";
  silitex_products: string[]; why_silitex: string; opening_questions: string[]; avoid?: string; sources?: string[];
};
export type Minor = { company: string; country?: string; hall?: string | null; stand?: string | null; grade?: string; one_line?: string; website?: string };
export type Show = { name: string; city: string; venue: string; dates: string; hours?: string; own_stand?: string; halls?: string[]; sources?: string[]; notes?: string };
export type Pack = { id: string; pdf: string; show: Show; screened_count: number; top: Stand[]; distributors?: Minor[]; competitors?: Minor[]; others?: Minor[] };

export const PACKS: Pack[] = [
  { id: "fi-europe-2026", pdf: "/expo-ready/Silitex_Expo_Ready_Fi_Europe_2026.pdf", ...(fi as unknown as Omit<Pack, "id" | "pdf">) },
  { id: "paint-coatings-2026", pdf: "/expo-ready/Silitex_Expo_Ready_Paint_Coatings_2026.pdf", ...(pc as unknown as Omit<Pack, "id" | "pdf">) },
];

/** stand label: "Hall 3.1 · B42" — "stand to confirm" when not on the official list */
export const where = (s: { hall?: string | null; stand?: string | null; stand_verified?: boolean }) =>
  [s.hall ? (/^\d/.test(String(s.hall)) ? "Hall " : "") + String(s.hall).replace(/^hall\s*/i, "") : "", s.stand || ""].filter(Boolean).join(" · ") + (s.stand && s.stand_verified !== false ? "" : " (stand to confirm)");

/** walking route: stands grouped by hall, in the order given */
export function route(top: Stand[]): [string, Stand[]][] {
  const m = new Map<string, Stand[]>();
  for (const s of top) { const h = s.hall ? String(s.hall) : "Hall not listed"; m.set(h, [...(m.get(h) || []), s]); }
  return Array.from(m);
}

/** plain-text version for the export bar (mail / WhatsApp / save) */
export function packText(p: Pack): string {
  const head = p.show.name + " — " + p.show.city + " · " + p.show.dates + " · " + p.show.venue;
  const body = p.top.map((s, i) => (i + 1) + ". " + s.company + (s.country ? " (" + s.country + ")" : "") + " — " + where(s) + " — grade " + s.grade +
    "\n   Makes: " + s.what_they_make + "\n   Silitex: " + s.silitex_products.join(", ") + " — " + s.why_silitex +
    "\n   Ask: " + s.opening_questions.join(" / ") + (s.avoid ? "\n   Avoid: " + s.avoid : "")).join("\n\n");
  return head + "\n\n" + body;
}
