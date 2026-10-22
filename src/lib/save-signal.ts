// save-signal.ts (src/lib/save-signal.ts) · created 22.10.2026 17:20 (Asia/Jerusalem) — one global "save happened" signal: the store's Supabase write layer (state.ts sync / remove) fires it, SaveToast shows it. ok = saved to the cloud · queued = no signal, kept on the device · err = cloud refused the save.
export type SaveStatus = "ok" | "queued" | "err" | "deleted";
export const SAVE_EVENT = "silitex:save";
export function emitSave(status: SaveStatus, detail = "") {
  if (typeof window === "undefined") return;
  try { window.dispatchEvent(new CustomEvent(SAVE_EVENT, { detail: { status, detail } })); } catch {}
}
