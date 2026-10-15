// backbone.ts (src/config/backbone.ts) · updated 15.10.2026 17:30 (Asia/Jerusalem)
// "Technical backbone" for /pitch (English — audience Silitex). Non-price reasons an Israeli R&D chemist switches.
// RULE: every product line must exist in the Silitex 2026 catalogues (data/catalog_2026.json, by code) or food_grade.json.
// Anything not yet documented by Silitex goes in BACKBONE_CONFIRM, never in the cards.
// Checked 15/10/2026 against the catalogues. Rejected from the NotebookLM draft: "BERETEX 750 high-active simethicone"
// (catalogue: 7.5% silicone, waste-water antifoam), MICROAMISIL for cosmetics (catalogue: textile softener),
// "Surfactant PE 193", "Silatex D / DM 350", "Velvet Gel SG 9040", "GOTS-ICEA softeners" (not in any Silitex catalogue),
// "15–20% lower dosage" (no Silitex data).
export type BackboneItem = { code: string; name: string; fact: string };
export type BackboneDriver = { icon: string; title: string; problem: string; answer: string; segments: string; items: BackboneItem[]; proof: string };
export const BACKBONE_RULE = "Plant chemists do not risk a failed batch to save a few cents per kg. Every Silitex entry point below solves a regulatory, process or eco-claim problem the incumbent leaves open — and every product named here is in the Silitex 2026 catalogues.";
export const BACKBONE: BackboneDriver[] = [
  {
    icon: "🧬", title: "Cyclic-free silicones (REACH D4 / D5 / D6)",
    problem: "Israeli brands exporting to the EU must remove cyclic siloxanes from wash-off and leave-on products and from textile finishes.",
    answer: "Ready non-cyclic routes, so R&D reformulates once — with Silitex.",
    segments: "Textile finishing · cosmetics exporters · personal care",
    items: [
      { code: "E1352", name: "MICROAMISIL", fact: "Textile softener microemulsion made without cyclic silicones; 35% active; softness lasts ≥ 8 washes" },
      { code: "PO657", name: "C13-15 ALKANE", fact: "Biodegradable emollient replacing cyclopentasiloxane (D5); natural version available" },
      { code: "PO709", name: "ISODODECANE", fact: "Volatile carrier replacing D5 in skin, hair and make-up" },
      { code: "H2057", name: "DIMETIBLEND", fact: "Dimethicone + dimethiconol gum blend — a D5 replacement with silicone skin-feel" },
      { code: "PO653", name: "DIMETHICONE 1,5 cSt", fact: "Linear volatile silicone, non-flammable carrier" },
    ],
    proof: "Silitex written statement per SKU: D4 / D5 / D6 < 0.1 %",
  },
  {
    icon: "🌿", title: "Plant-origin, EO-free antifoams and softeners",
    problem: "Eco-label detergents, green paints and 'natural' claims cannot use conventional silicone or EO-based antifoams.",
    answer: "Vegetable-based actives that let the customer add an eco-claim instead of losing performance.",
    segments: "Eco detergents · water-based / bio paints · waste water · food & fermentation",
    items: [
      { code: "B1952", name: "FISIOREX 1000", fact: "100% active antifoam from plant-origin raw materials, free of ethylene-oxide derivatives; eco-label detergents, green paints, waste water" },
      { code: "C2205", name: "FISIOREX FG", fact: "Vegetable fatty-acid antifoam for direct food contact (FDA – BfR – EU Reg)" },
      { code: "E1441", name: "EVEROIL 35", fact: "Softener emulsion of vegetal origin, designed for Ecolabel formulations" },
      { code: "PO661", name: "ALCASUN VE", fact: "Vegetal emollient replacing D5 in personal care" },
    ],
    proof: "Eco-label / biodegradability data sheets for FISIOREX 1000 and EVEROIL 35",
  },
  {
    icon: "✡️", title: "Food-contact and kosher antifoams",
    problem: "Food, beverage and fermentation plants cannot trial anything without food-contact and kosher documents on file.",
    answer: "A food line with FDA / BfR / EU status and kosher-certified grades — the documents come with the sample.",
    segments: "Fermentation · beverages · yeast & sugar · food processing",
    items: [
      { code: "PO340", name: "SILIFOOD 1000", fact: "Anhydrous antifoam for direct food contact; FDA – BfR – EU Reg – Pharma Reg" },
      { code: "C2239", name: "SILIFOOD 10", fact: "Food-contact antifoam emulsion for fermentation and frying" },
      { code: "", name: "SILIFOOD 1600 · SILIFOOD 3000 K", fact: "Listed by Silitex as kosher & halal certified, FDA compliant" },
    ],
    proof: "Kosher certificates (issuing authority + expiry) for the SILIFOOD grades",
  },
  {
    icon: "⚖️", title: "Cost-in-use by concentration — not price per kg",
    problem: "Buyers compare price per kg of emulsion; what they actually pay for is active silicone delivered and dosed.",
    answer: "One family covers 5 % to 33 % active: ship the concentrate, dilute on site, dose the grade the process needs.",
    segments: "Liquid detergents · waste water & evaporation plants · process industry",
    items: [
      { code: "A003", name: "DYNAPAN 10 D", fact: "10% silicone antifoam emulsion for liquid detergents, up to 100 °C / pH 11" },
      { code: "A041", name: "DYNAPAN 30 D", fact: "33% concentrate — ships about 3× less water per kg of active silicone than a 10% emulsion" },
      { code: "", name: "BERETEX 500 → 1600", fact: "Waste-water / evaporation antifoams from 5% to 16% silicone, stable to dilution" },
    ],
    proof: "Customer-side dosage trial: kg of active silicone per m³ / per tonne of product, Silitex grade vs. incumbent",
  },
  {
    icon: "🧺", title: "One supplier, five sectors, one shipment",
    problem: "Plants buy antifoams, softeners, water repellents and cosmetic raw materials from different agents of different global brands.",
    answer: "292 catalogue grades from one producer: one importer, one consolidated shipment, one set of documents (EUR.1 origin, SDS, CoA).",
    segments: "Paint & Coating 103 · Detergency 79 · Food & Agri 40 · Cosmetics 36 · Water Treatment 34",
    items: [],
    proof: "Silitex price list (EUR, FCA Italy) for the focus grades",
  },
];
/** not claimed on the cards until Silitex confirms in writing */
export const BACKBONE_CONFIRM = [
  "Custom grades: active %, viscosity, emulsifier system adjusted to a customer's matrix — minimum batch?",
  "Sample lead time from Cologna Veneta (1–2 kg lab kits) and who pays freight",
  "Direct lab-to-lab line: which Silitex chemist answers Israeli R&D questions, and in how many days",
  "Written D4/D5/D6 statements and eco-label data for the grades above",
];
