// pitch.ts (src/config/pitch.ts) · updated 16.10.2026 06:05 (Asia/Jerusalem) — DRYSIL = water repellent (Silitex overlap); + full-disclosure new ground · — supply model = direct per PO (no speculative local stock); + TRACK record (former Dow Corning distributor)
// All copy for the /pitch executive page (English — audience is Silitex management). Edit text here only.
export const PITCH = {
  title: "Israel — Exclusive Distribution Proposal",
  subtitle: "A ready-to-run commercial system for Silitex S.r.l. in the Israeli industrial market",
  presenter: "Avshi Sapir · Sapirim / Marble Art · Tel Aviv",
  phases: [
    { n: 1, title: "Account reactivation", months: "Months 1–2", text: "Intro binders, 2 kg lab samples, Kosher/FDA certificate packs to 19 mapped accounts." },
    { n: 2, title: "Lab qualification", months: "Months 3–5", text: "On-site technical meetings with chief chemists; 5 kg trials; drop-in replacement protocols vs. Dow / Wacker." },
    { n: 3, title: "Commercial pilots", months: "Months 6–8", text: "1-ton drums / IBC pilots at Mekorot, Infinya, GES, fermentation producers." },
    { n: 4, title: "Annual contracts", months: "Months 9–12", text: "FCL / LCL supply agreements shipped direct from Cologna Veneta per PO — fresh batches, ≥ 80 % shelf life on delivery." },
  ],
  gets: [
    ["Mapped market", "19 named accounts, 12 industries, decision-maker roles, $5.25M annual potential — already in the CRM."],
    ["Technical selling", "37-category cross-reference: every Silitex SKU vs. Dow Corning / DOWSIL / XIAMETER, Wacker, Momentive, Evonik + 20 producers."],
    ["Regulatory handling", "Kosher & FDA line positioned for food, water and agro; Israeli Standards Institute and MoH import files handled locally."],
    ["Full visibility", "Monthly principal report: pipeline by stage, samples in field, forecast tons, wins — generated from live CRM data."],
    ["Daily discipline", "Automated daily call plan, weekly review, sample tracker, AI-drafted outreach in Hebrew and English."],
    ["REACH-ready portfolio", "D4/D5-free amino emulsions (MACROAMISIL E1386, MICROAMISIL E1352, IDROAMISIL 250 E1453), linear PDMS carriers and 100% bio-based alternatives — the regulatory argument Israeli formulators following ECHA need to drop legacy cyclic-siloxane products."],
    ["Fresh supply, no dead stock", "Direct from Cologna Veneta per firm PO — fresh batches with ≥ 80 % shelf life on delivery (a standard Israeli PO clause), FIFO by design. No hazardous-goods storage risk. A selective local buffer only for proven repeat accounts that cover its cost — case by case. Hebrew technical support throughout."],
  ],
  model: {
    title: "Commercial model",
    lines: [
      "Sapirim acts as Silitex's agent of record for Israel: exclusive territory, customer-of-record protection, non-circumvention.",
      "Logistics: direct supply per firm PO — (A) DAP / CIF to the customer plant via our forwarder, with Sapirim handling documents, customs and delivery, or (B) direct Silitex invoicing with a customer-nominated forwarder for container volumes.",
      "No speculative local stock: customer POs require ≥ 80 % remaining shelf life, and a licensed hazardous-goods warehouse (environmental and fire-department rules, segregation, no stacking of pails, FIFO) makes general stock uneconomic. 35 years of practice: a selective buffer only for repeat accounts that pay for it.",
      "Commission scales with volume and product class; terms in the agency agreement, not on this page.",
    ],
  },
  process: { title: "How we run every sale", sub: "Nine steps, each with an owner and a screen in the CRM — see /team for the people." },
  needs: ["Exclusive distribution for Israel — 24 months, with a 36-month renewal option", "TDS / MSDS pack for the 45 focus SKUs", "Sample kits: 2 kg × 19 accounts (Phase 1)", "Distributor price list (EUR, FCA Italy) + MOQ", "Kosher / FDA / HACCP certificates (current)", "Joint technical visit in Month 3"],
};
/** Sapirim track record as Dow Corning distributor in Israel — from Avshi's sales history (dc_history_sales.xlsx, 16/10/2026). silitex = product line also covered by the Silitex range. */
export const TRACK = {
  title: "35 years in Israeli silicones — former Dow Corning distributor",
  sub: "The same plants, the same R&D labs, the same purchasing managers. Israeli silicone market: about $5M / 1,000 t a year (Sapirim estimate).",
  groups: [
    { pack: "Container loads", items: [["Building sealants (acetoxy / neutral)", ">100", false], ["Paper coating", ">20", true], ["LSR rubber", ">10", false], ["Detergent antifoams", ">10", true], ["Syltherm heat-transfer fluids", "5", false]] },
    { pack: "Drums", items: [["200 Fluids, all viscosities", ">300", true], ["Personal care & cosmetics", ">100 drums + >500 pails", true], ["Fire retardants / DC 1107 reactive fluid", ">100", true], ["Surfactants (silicone polyethers)", ">50", true], ["Antifoams (process)", ">50", true], ["Transformer fluids", ">50", false], ["Household products", "~50", true], ["DRYSIL water repellent", "~50", true], ["Textile finishes", "~10", true], ["Brake fluid", "~10", false], ["Antifoam RD (food)", "~5", true]] },
    { pack: "Pails", items: [["Mold-making rubbers", ">100", false]] },
    { pack: "Cartridges & small packs (high volume)", items: [["Paint additives", "", true], ["RTVs for electronics", "", false], ["Silicone greases", "", false], ["Sylgard encapsulants", "", false], ["Silanes", "", false], ["Medical-grade fluids", "", false], ["Fluorosilicones (electronics)", "", false]] },
  ] as { pack: string; items: [string, string, boolean][] }[],
  newGround: { title: "Full disclosure — new ground for Sapirim", text: "Agriculture, oil refineries and water purification were not part of our Dow Corning business. They are in our target map because Silitex has strong grades there (antifoams, food-contact and plant-origin lines) — we approach them as new accounts, not existing relationships." },
};
/** Today's NuSil spot business (CareSil personal-care line) and the Silitex grade that replaces it. Checked 16/10/2026 against the NuSil CareSil product guide + Silitex Cosmetics 2026 catalogue. */
export const NUSIL_SWITCH = {
  title: "Today's spot business — NuSil CareSil → Silitex",
  sub: "Small-volume orders we still buy from NuSil (Avantor, California): a 4–6-month order-and-ship cycle. These are the first volumes Silitex takes over once its grades are approved.",
  rows: [
    { nusil: "CareSil CSF-3504", what: "Gum blend — Dimethicone (and) Dimethiconol, 50 % dimethiconol, cyclic-free (D4 < 0.05 %)", silitex: "DIMETIBLEND (H2057) — same INCI, Dimethicone + Dimethiconol, 12 % active; ALKABLEND 6800 (H2256) as silicone-light option", fit: "Same chemistry, lower concentration — ask Silitex for a 50 % version" },
    { nusil: "CareSil CXG-1104", what: "Elastomer gel — Dimethicone (and) Dimethicone/Vinyl Dimethicone Crosspolymer, 12 % solids, cyclic-free", silitex: "SILIBLEND CROSS D (PO597) — same INCI, 7 % gel; DIVICROSS (PO680) 100 % crosspolymer to build up to 12 %", fit: "Same chemistry — match solids % in the lab" },
  ],
};

