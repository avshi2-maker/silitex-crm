// merge-2310.ts (src/data/merge-2310.ts) · created 23.10.2026 05:45 (Asia/Jerusalem) — approved by Avshi 23/10: merge the duplicate customers found by the 22/10 searches (Comet / Gemini / NotebookLM found the same company under different names). Keeper = the older CRM record (has tasks / history), else the scanned one, else the earliest. Infinya (paper) vs Infinya Packaging kept apart (two divisions).
export const MERGE_FLAG = "silitex-merge-dups-2310";
export const MERGES: { keep: string; drop: string[] }[] = [
  { keep: "LEAD-072", drop: ["LEAD-rqryzy4y9sd"] },            // Amiad
  { keep: "LEAD-132", drop: ["LEAD-nbfp755hj90"] },            // BlueGen
  { keep: "LEAD-5idh5ohy9sd", drop: ["LEAD-diuicqmhj90"] },    // Carmel Olefins
  { keep: "LEAD-h1h2cnahj90", drop: ["LEAD-ig1l2lwopza"] },    // IPU
  { keep: "LEAD-nu95vf2hj90", drop: ["LEAD-h6tt5biy9sd", "LEAD-cpvx49xopza"] }, // Kafrit
  { keep: "LEAD-075", drop: ["LEAD-n35044yy9sd"] },            // Netafim
  { keep: "LEAD-h2f795dhj90", drop: ["LEAD-p131kz4opza"] },    // Palgal
  { keep: "LEAD-vhtiiu9y9sd", drop: ["LEAD-89vegs3opza"] },    // Plasson
  { keep: "LEAD-xbus62khj90", drop: ["LEAD-00n4q9fopza"] },    // Plastopil Hazorea
  { keep: "LEAD-kpiktcjy9sd", drop: ["LEAD-o3s836eopza"] },    // Plazit-Polygal
  { keep: "LEAD-aywcpvchj90", drop: ["LEAD-05q85s7y9sd"] },    // Rimoni
  { keep: "LEAD-ze0zd60y9sd", drop: ["LEAD-56dpgicopza"] },    // Rion
  { keep: "LEAD-56o2ee5hj90", drop: ["LEAD-r4ez9qtopza"] },    // ROP
  { keep: "LEAD-t7ai38xhj90", drop: ["LEAD-kqh7ceuy9sd"] },    // Rosenshine Plast
  { keep: "LEAD-fcawcifhj90", drop: ["LEAD-lic3v83y9sd"] },    // Shahak-Tec
  { keep: "LEAD-0drzc60y9sd", drop: ["LEAD-b9d03q9opza"] },    // Tama
  { keep: "LEAD-cpuemkdhj90", drop: ["LEAD-1r69h9iopza"] },    // Techno Ad
  { keep: "LEAD-jis42wxhj90", drop: ["LEAD-nzp4dt6opza"] },    // Terraflex
  { keep: "LEAD-8f19w3ohj90", drop: ["LEAD-1rd4qntopza"] },    // Uniflex
  { keep: "LEAD-mefbl8phj90", drop: ["LEAD-lme6n4eopza"] },    // YSR
];
