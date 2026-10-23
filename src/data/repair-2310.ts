// repair-2310.ts (src/data/repair-2310.ts) · created 23.10.2026 05:20 (Asia/Jerusalem) — second, exact repair of the 22/10 NotebookLM import. Cause found: NotebookLM's link filter replaced every URL with "[suspicious link removed]" and swallowed the comma + next word → shifted columns, no websites. Per customer: website (recovered from the scan queue history / the "Source:" in the notes / verified by web search 23/10 — never guessed), city (from the Address), industry. 6 = Gemini customers that NotebookLM had overwritten.
export const REPAIR2_FLAG = "silitex-repair-nlm-2310";
export const REPAIR2_INDUSTRY = "Rubber & Plastics Processing";
export const REPAIR2: Record<string, { website: string; city: string }> = {
  // Gemini customers overwritten by the NotebookLM import (websites from the scan-queue history)
  "LEAD-d6dtbz3y9sd": { website: "https://www.ginegar.com/", city: "Kibbutz Ginegar" },
  "LEAD-p7zuo0fy9sd": { website: "https://pexgolan.com/", city: "Kibbutz Shaar HaGolan" },
  "LEAD-ofl0mg2y9sd": { website: "https://www.palram.com/", city: "Kibbutz Ramat Yohanan" },
  "LEAD-0f6s64vy9sd": { website: "https://pas-gon.com/", city: "Kibbutz Gonen" },
  "LEAD-05q85s7y9sd": { website: "https://www.rimoni.com/", city: "Kiryat Shmona" },
  "LEAD-kqh7ceuy9sd": { website: "https://tplastic.co.il/", city: "Holon" },
  // NotebookLM customers — website from the "Source:" that survived in the notes
  "LEAD-vguph38opza": { website: "https://www.amraz.co.il/", city: "Rishon LeZion" },
  "LEAD-ig1l2lwopza": { website: "https://www.ipu.co.il/", city: "Kiryat Gat" },
  "LEAD-cpvx49xopza": { website: "https://kafrit.com/", city: "Kibbutz Kfar Aza" },
  "LEAD-cfmuj5mopza": { website: "https://www.paladhy.com/", city: "Migdal HaEmek" },
  "LEAD-00n4q9fopza": { website: "https://www.plastopil.com/", city: "Kibbutz Hazorea" },
  "LEAD-w53ejkvopza": { website: "http://www.tremco.co.il/", city: "Netanya" },
  // NotebookLM customers — website verified by web search 23/10
  "LEAD-xferlfqopza": { website: "https://www.pachmas.com/", city: "Kibbutz Ein HaHoresh" },
  "LEAD-x77rl6aopza": { website: "https://plassim.co.il/", city: "Kibbutz Merhavia" },
  // NotebookLM customers — no reliable website found (left empty, fix inline on /scan)
  "LEAD-p6ssekpopza": { website: "", city: "Afula (Alon Tavor)" },
  "LEAD-915deu2opza": { website: "", city: "Kibbutz Kinneret" },
  "LEAD-8giqnxxopza": { website: "", city: "Kibbutz Ein HaNatziv" },
  "LEAD-cbena15opza": { website: "", city: "Kibbutz Shefayim" },
  "LEAD-rsubs5bopza": { website: "", city: "Afula (Alon Tavor)" },
  "LEAD-nf4bpfdopza": { website: "", city: "Karmiel" },
  // NotebookLM customers that are duplicates of Comet / Gemini customers (kept until Avshi approves a merge)
  "LEAD-89vegs3opza": { website: "", city: "Kibbutz Maagan Michael" },
  "LEAD-o3s836eopza": { website: "", city: "Kibbutz Gazit" },
  "LEAD-r4ez9qtopza": { website: "", city: "Kibbutz HaHotrim" },
  "LEAD-56dpgicopza": { website: "", city: "Kibbutz Cabri" },
  "LEAD-b9d03q9opza": { website: "", city: "Kibbutz Mishmar HaEmek" },
  "LEAD-1r69h9iopza": { website: "", city: "Rishon LeZion" },
  "LEAD-nzp4dt6opza": { website: "", city: "Kibbutz Reshafim" },
  "LEAD-1rd4qntopza": { website: "", city: "Netanya" },
  "LEAD-lme6n4eopza": { website: "", city: "Kiryat Gat" },
  "LEAD-p131kz4opza": { website: "", city: "Kibbutz Hefzibah" },
};
