// index.ts (src/lib/store/index.ts) · updated 18.10.2026 06:30 (Asia/Jerusalem) — + offline queue exports · 09.10.2026 09:40 — public surface of the store
export { useStore } from "./useStore";
export { STAGES, stageHe, isClosed } from "@/config/stages";
export type { State } from "./state";
export { pendingSync, flushQueue } from "./state";
