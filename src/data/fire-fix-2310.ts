// fire-fix-2310.ts (src/data/fire-fix-2310.ts) · created 23.10.2026 06:40 (Asia/Jerusalem) — one-time fix of the 23/10 NotebookLM fire-safety import: it added its own Source column (URL → source label) and wrote its own industry names; 4 rows lost their link to NotebookLM's link filter. → industry = Flame Retardants & Fire Safety (old text kept as sub-industry), source = NotebookLM label, website kept. Plus 3 existing customers renamed by the import get their names back.
export const FIREFIX_FLAG = "silitex-firefix-2310";
export const FIRE_IND = "Flame Retardants & Fire Safety";
export const FIRE_SRC = "NotebookLM — Fire safety & flame retardants 23/10/2026";
export const FIRE_IDS = ["LEAD-w39zuo5rm1s", "LEAD-u3ald57rm1s", "LEAD-4a6570jrm1r", "LEAD-jo98rzfrm1r", "LEAD-cygui32rm1r", "LEAD-ogy1wf7rm1s", "LEAD-tai4lierm1r", "LEAD-r86zhilrm1r", "LEAD-fz3k935rm1s", "LEAD-njnrfqqrm1s"];
export const NAME_BACK: Record<string, string> = { "LEAD-nu95vf2hj90": "Kafrit Industries Ltd. (Kafrit IL)", "LEAD-xbus62khj90": "Plastopil Hazorea Company Ltd.", "LEAD-8giqnxxopza": "Palziv (פלזיו)" };
