// radar.ts (src/lib/radar.ts) · updated 24.10.2026 06:10 (Asia/Jerusalem) — tolerant JSON parse · created 24.10.2026 06:00
// 🛰️ INDUSTRY GAP RADAR — prompt + row type. Claude (web search) reads the industry / market pages of the 5 global silicone producers,
// keeps only industries where Silitex-type products (fluids, emulsions, antifoams, softeners, waxes, release agents, water repellents) sell,
// and maps each to our CRM industry list → the rows with no match are the GAPS.
export const PRODUCERS = ["Dow (Dow Corning)", "Wacker", "Momentive", "Shin-Etsu", "KCC Basildon"];
export const EXCLUDE = "electronics / electrical / semiconductors / LED / solar, medical / healthcare / implants / pharma devices, baby care, aerospace, automotive OEM parts, silicone rubber moulding (LSR / HCR / RTV mould-making), batteries / EV";
export type RadarRow = { industry: string; producers: string[]; functions: string; silitex_fit: "yes" | "partly" | "no"; our_match: string; israel: string; who: string; uses: string; sources: string[] };
export type RadarRun = { id: string; created_at: string; model: string; searches: number; input_tokens: number; output_tokens: number; cost_usd: number; rows: RadarRow[] };

export function radarPrompt(ours: string[]): string {
  return [
    "TASK: Map the END-USE INDUSTRIES served by the world's major silicone producers: " + PRODUCERS.join(", ") + ".",
    "Use web_search: read each producer's own industries / markets / applications pages (and their product-selector or brochure pages). At least 2 searches per producer.",
    "KEEP only industries where they sell silicone FLUIDS, EMULSIONS, ANTIFOAMS / DEFOAMERS, SOFTENERS, WAXES, RELEASE AGENTS, WATER REPELLENTS, SURFACTANTS or ADDITIVES — the product families of Silitex (Italian maker of silicone emulsions, antifoams, softeners, fluids and waxes).",
    "EXCLUDE: " + EXCLUDE + ".",
    "Split broad markets into useful buying industries (e.g. 'Household care' vs 'Industrial & institutional cleaning'; 'Leather finishing'; 'Polishes & waxes').",
    "",
    "OUR CURRENT CRM INDUSTRY LIST (Israel):",
    ours.map((x) => "- " + x).join("\n"),
    "",
    "For EACH industry you find, set our_match = the EXACT name from our list that already covers it, or \"\" when none does (that is a GAP).",
    "Output ONLY a JSON array inside one ```json code block, 20–40 objects, gaps first, then by size. Each object:",
    '{"industry": "short English industry name (max 6 words)", "producers": ["Dow", "Wacker", …], "functions": "silicone functions used, comma-separated", "silitex_fit": "yes|partly|no", "our_match": "", "israel": "one line: is this industry present in Israel? name 1–3 Israeli producers if you know them, else \\"unknown\\"", "who": "who to look for (types of companies)", "uses": "typical silicone functions for a search brief", "sources": ["https://…", "https://…"]}',
    "silitex_fit: yes = fluids / emulsions / antifoams / softeners / waxes are the main silicone use; partly = some uses fit, others need rubber / resins / specialty; no = mainly products Silitex does not make.",
    "Never invent producers' claims — every industry must be backed by at least one producer page in sources.",
  ].join("\n");
}

export function parseRows(text: string): RadarRow[] {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/); const body = (m ? m[1] : text).trim().replace(/[\u0000-\u001f]+/g, " "); // stray newlines inside strings → spaces
  const s = body.indexOf("["), e = body.lastIndexOf("]"); if (s < 0 || e <= s) return [];
  try {
    const arr = JSON.parse(body.slice(s, e + 1)) as Partial<RadarRow>[];
    return arr.filter((r) => r && r.industry).map((r) => ({ industry: String(r.industry).slice(0, 80), producers: Array.isArray(r.producers) ? r.producers.map(String) : [], functions: String(r.functions || ""), silitex_fit: (["yes", "partly", "no"].includes(String(r.silitex_fit)) ? r.silitex_fit : "partly") as RadarRow["silitex_fit"], our_match: String(r.our_match || ""), israel: String(r.israel || ""), who: String(r.who || ""), uses: String(r.uses || ""), sources: Array.isArray(r.sources) ? r.sources.map(String).filter((u) => /^https?:\/\//.test(u)).slice(0, 4) : [] }));
  } catch { return []; }
}

export function radarText(run: RadarRun, inList: (r: RadarRow) => string): string {
  return run.rows.map((r) => [r.industry, r.silitex_fit, inList(r) || "GAP", r.producers.join("/"), r.functions, r.israel].join(" · ")).join("\n");
}
