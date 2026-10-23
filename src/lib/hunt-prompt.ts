// hunt-prompt.ts (src/lib/hunt-prompt.ts) · updated 23.10.2026 16:15 (Asia/Jerusalem) — search round keeps its NotebookLM notebook / chat link (📓) · earlier: 23.10.2026 06:10 (Asia/Jerusalem) — NotebookLM: website + source as bare domains (its link filter erased every URL 22/10) · every row exactly 12 cells (Comet's notes slid into E-mail) · 22.10.2026 18:10 (Asia/Jerusalem) — search-round log goes on a REAL customer (FK fix: lead_id "hunt:…" was rejected by the cloud); industry parsed from the log text · 18:00 — payload carries industry / sub / tool + search-round log helpers · created 17:40 — builds the "find companies we miss" research prompt for Comet / NotebookLM / Perplexity / Deep Research. The CSV header = the CRM import column names, so the answer pastes straight into /leads/import (auto-mapped, de-duplicated).
import { hintFor } from "@/config/hunt-uses";

export type HuntTool = "comet" | "notebooklm" | "perplexity" | "deep";
export const HUNT_TOOLS: { id: HuntTool; label: string; url: string }[] = [
  { id: "comet", label: "Comet", url: "https://www.perplexity.ai/" },
  { id: "notebooklm", label: "NotebookLM", url: "https://notebooklm.google.com/" },
  { id: "perplexity", label: "Perplexity (Research)", url: "https://www.perplexity.ai/" },
  { id: "deep", label: "ChatGPT / Gemini Deep Research", url: "https://chatgpt.com/" },
];
/** header row — every name is auto-recognised by lib/lead-import autoMap */
export const HUNT_COLUMNS = ["Company", "Website", "City", "Industry", "Sub-industry", "Application", "Current supplier", "Contact name", "Role", "Phone", "Email", "Notes"];

export type HuntInput = { industry: string; sub: string; similar: string; notes: string; region: string; rows: number; tool: HuntTool; exclude: string[] };

export function discoverQuery(i: HuntInput): string {
  return [i.region || "Israel", i.sub || i.industry, "manufacturers companies list", i.similar ? "similar to " + i.similar : ""].filter(Boolean).join(" ");
}

const HOW: Record<HuntTool, string> = {
  comet: "Work as a web-research task: open several sources (company websites, Israeli industry directories, Dun's 100 / BDI, Manufacturers Association of Israel, trade-show exhibitor lists, LinkedIn company pages) before answering.",
  notebooklm: "Use ONLY the sources in this notebook plus what they cite. If a fact is not in the sources, leave the cell empty.",
  perplexity: "Use Research / Pro mode: search widely (company websites, Israeli directories, Dun's 100 / BDI, Manufacturers Association of Israel, exhibitor lists, LinkedIn) before answering.",
  deep: "Run this as a Deep Research task: search widely (company websites, Israeli directories, Dun's 100 / BDI, Manufacturers Association of Israel, exhibitor lists, LinkedIn) before answering.",
};

export function buildHuntPrompt(i: HuntInput): string {
  const h = hintFor(i.industry); const seg = i.sub ? i.industry + " → " + i.sub : i.industry; const where = i.region || "Israel";
  const ex = i.exclude.filter(Boolean).slice(0, 150);
  const lines = [
    "TASK: Build a CSV of companies in " + where + " in this segment that a silicone-chemicals distributor may be MISSING.",
    "Segment: " + seg,
    i.similar && "Find companies that do the same kind of work as: " + i.similar + " (same products / processes / customers).",
    i.notes && "My notes / context (use as extra direction):\n\"\"\"\n" + i.notes.trim() + "\n\"\"\"",
    "",
    "Who to include: " + h.who + ". Only companies with real production, formulation or R&D activity in " + where + " (plant, lab or factory). Exclude pure retailers, import-only traders and foreign companies with no local activity.",
    "Typical silicone uses in this segment (for the Application column — function only): " + h.uses + ".",
    ex.length ? "\nALREADY IN MY LIST — do NOT return these (or their subsidiaries / other names):\n" + ex.join("; ") : "",
    "",
    "Return " + i.rows + " rows, most relevant / largest first. Every row must have exactly " + HUNT_COLUMNS.length + " cells — write an empty cell (,,) when a value is unknown, never skip a column.",
    HOW[i.tool],
    "",
    "OUTPUT: ONE CSV inside a single code block. Comma-separated; wrap any cell containing a comma in double quotes. Header row EXACTLY:",
    HUNT_COLUMNS.join(","),
    "",
    "Column rules:",
    "- Company: official company name (English; Hebrew name in brackets if known).",
    i.tool === "notebooklm" ? "- Website: the company domain ONLY, written as plain text without https:// or www (e.g. example.co.il) — never a link." : "- Website: the real company homepage (https://…).",
    "- City: city / industrial zone of the plant in " + where + ".",
    "- Industry: exactly \"" + i.industry + "\" in every row.",
    "- Sub-industry: a few words on what THIS company makes" + (i.sub ? " (e.g. \"" + i.sub + "\")" : "") + ".",
    "- Application: the most likely silicone function(s) for this company — function only. Do NOT name any supplier product, brand or grade.",
    "- Current supplier: only if publicly stated (distributor / brand), else empty.",
    "- Contact name, Role, Phone, Email: only from the company's own website or public listings (R&D, technical, purchasing or plant manager preferred). Empty if not found — never guess.",
    "- Notes: \"Main products: …; Employees: ~…; Address: …; Why relevant: …; Confidence: High/Medium/Low; Source: " + (i.tool === "notebooklm" ? "<domain of the source page, plain text, no link>" : "<URL>") + "\".",
    "- Never invent companies, people, phones, e-mails or numbers. An empty cell is better than a guess.",
    "After the code block, list in one short line each any company you were unsure about.",
  ];
  const body = lines.filter((l): l is string => typeof l === "string").join("\n").replace(/\n{3,}/g, "\n\n");
  if (i.tool === "notebooklm") return "STEP 1 — In NotebookLM: Sources → \"Discover\" → paste this search, import the web sources:\n" + discoverQuery(i) + "\n\nSTEP 2 — Paste everything below into the notebook chat.\nSTEP 3 — Copy the notebook address from the browser bar → paste it in the CRM import box \"🔗 קישור לסבב\" (so this round can be reopened later).\n\n" + body;
  return body;
}

/** pasted answer → just the CSV (code-block content if present, else from the header row on) */
export function extractCsv(text: string): string {
  const t = (text || "").replace(/\r\n/g, "\n");
  const fence = t.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const lines = t.split("\n"); const hi = lines.findIndex((l) => /company/i.test(l) && l.split(",").length >= 4);
  return (hi >= 0 ? lines.slice(hi) : lines).join("\n").trim();
}
export const PASTE_KEY = "silitex-import-paste";
export type PastePayload = { csv: string; src: string; tier: string; industry?: string; sub?: string; tool?: string };
/** one search round logged as an activity (kind "import") on the FIRST imported customer (activities.lead_id must be a real customer — FK) — parsed back by the search history */
export const huntLogText = (tool: string, seg: string, n: number, u: number, s: number, link = "") => "🧲 " + tool + " · " + seg + " · new " + n + " · updated " + u + " · scan " + s + (link ? " · 📓 " + link : "");
/** link = the search session to reopen later (NotebookLM notebook / Gemini or Comet chat), optional */
export function parseHuntLog(t: string): { tool: string; seg: string; industry: string; n: number; u: number; s: number; link: string } | null {
  const m = (t || "").match(/^🧲 (.*?) · (.*) · new (\d+) · updated (\d+) · scan (\d+)(?: · 📓 (\S+))?$/); return m ? { tool: m[1], seg: m[2], industry: m[2].split(" → ")[0], n: +m[3], u: +m[4], s: +m[5], link: m[6] || "" } : null;
}
/** a pasted session link → https URL or "" */
export const cleanLink = (v: string) => { const u = (v || "").trim().split(/\s+/)[0]; return /^https:\/\/[^\s]+\.[^\s]+/.test(u) ? u : ""; };
