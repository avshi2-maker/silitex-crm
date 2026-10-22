// repair-2210.ts (src/data/repair-2210.ts) · created 22.10.2026 18:50 (Asia/Jerusalem) — one-time repair of the NotebookLM import (22/10 18:16): 24 new + 6 updated customers came in with SHIFTED columns → lib/lead-repair puts every value back; source + search-round log get the missing industry; the repaired companies are re-sent to the server scan (their queued scans were paused).
export const REPAIR_FLAG = "silitex-repair-nlm-2210";
export const REPAIR_SINCE = "2026-10-22T15:00:00.000Z"; // only customers touched by the 22/10 evening imports
export const NLM_SOURCE = "NotebookLM — Masterbatch, additives & compounds for plastics 22/10/2026";
export const NLM_LOG = { id: "act-entvq9lotnl", text: "🧲 NotebookLM · Rubber & Plastics Processing → Masterbatch, additives & compounds for plastics · new 24 · updated 6 · scan 24" };
