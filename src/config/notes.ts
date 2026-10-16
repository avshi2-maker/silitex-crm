// notes.ts (src/config/notes.ts) · updated 16.10.2026 09:00 (Asia/Jerusalem) — REWRITTEN for the 16/10/2026 Teams call: Silitex presents first; verified products only (technical backbone); no named accounts before signing; direct supply per PO; NuSil second-source ask; corrected Q&A.
// Teleprompter script for the Silitex meeting (English). Open /notes on a second screen or phone — never on the shared screen.
export type Cue = { t: string; min: string; say: string[]; show?: string };
export const NOTES: Cue[] = [
  { t: "Open — hand over to Silitex", min: "0–2", show: "nothing shared yet — camera on", say: [
    "Dr. Federica, Eleonora — thank you for your time and for the catalogues; they answered almost everything I asked on the 12th.",
    "As you suggested, I would love to hear your overview of Silitex first — your sectors and how you like to work with distributors. Then I'll show you how we would run Israel.",
    "(Ask Eleonora: may we record and switch on the transcript? It helps me send an accurate summary.)" ] },
  { t: "Listen — while Silitex presents", min: "2–15", show: "take notes", say: [
    "Note: their priority sectors · who handles samples · export contact · custom grades possible? · minimum batch · sample lead time · certificates.",
    "Good follow-up questions: which sector grows fastest for you? Which countries work best with a distributor like us, and why?" ] },
  { t: "Who we are", min: "15–17", show: "/pitch?lang=en → '35 years … former Dow Corning distributor'", say: [
    "Sapirim has 35 years in Israeli silicones — we were the Dow Corning distributor here. Same plants, same R&D labs, same purchasing managers.",
    "The pink lines are product lines we sold for Dow Corning that Silitex also covers — those are the accounts we re-open first. Israeli market: roughly 5 million dollars, a thousand tonnes a year.",
    "Full disclosure: agriculture, refineries and water purification were not our Dow Corning business — we approach those as new accounts." ] },
  { t: "How we run it — Sapirim 2.0", min: "17–19", show: "/pitch → 'Sapirim 2.0' then/now panel", say: [
    "In the Dow Corning years this needed a full office and SAP at 15,000 dollars a year. Today it's me, one dedicated support person and an external chemist on call — because the system we built does the routine work 24/7.",
    "Every card you see here is a live screen, not a slide. The team grows only when orders justify it — low fixed cost for both of us." ] },
  { t: "Live demo — cross-reference", min: "19–21", show: "/offsets → Quick match → type 'DC 5225C', then 'OFX-0193'", say: [
    "A customer gives me his Dow or Wacker code — the system answers with your grade, the catalogue row and the PDF, during the call.",
    "Try one yourselves — give me any competitor code." ] },
  { t: "Why R&D will switch — not price", min: "21–24", show: "/pitch → 'Technical backbone'", say: [
    "Plant chemists don't risk a failed batch to save a few cents a kilo. We bring them a problem solved:",
    "One — cyclic-free routes for EU exporters: MICROAMISIL E1352 for textile softening; C13-15 alkane, isododecane and DIMETIBLEND for D5-free cosmetics.",
    "Two — plant-origin, EO-free actives for eco-label detergents and green paints: FISIOREX 1000, EVEROIL 35.",
    "Three — cost-in-use, not price per kilo: the DYNAPAN range from 10 to 33 percent — buy the concentrate, dilute on site.",
    "Four — food-contact and kosher antifoams with documents on file: SILIFOOD.",
    "DO NOT SAY: BERETEX 750 simethicone · 15–20 % dosage · '100 % plant-based' · MICROAMISIL for cosmetics · 'certified' D4/D5-free." ] },
  { t: "Realistic timeline", min: "24–25", show: "/pitch → 12-month plan", say: [
    "Honest timeline: industrial antifoams and softeners 3 to 9 months from sample to first order; food 6 to 12; cosmetics 12 to 24. We do not promise volume quotas we cannot control.",
    "Year one target: about ten accounts in lab evaluation, three or four R&D approvals, first trial orders.",
    "Supply direct from Cologna Veneta per firm order — fresh batches, at least 80 % shelf life on delivery, EUR.1 so zero duty. No speculative stock." ] },
  { t: "NuSil second source — the concrete ask", min: "25–26", show: "/pitch → 'Today's spot business — NuSil CareSil → Silitex'", say: [
    "Today I still buy small spot volumes from NuSil in California: four to six months per order, and in COVID their supply stopped for more than eight months — my customers paid for that.",
    "For specialty gels those customers want a second qualified source. Your DIMETIBLEND and SILIBLEND CROSS D are the same chemistry as CareSil CSF-3504 and CXG-1104.",
    "Question: can you make DIMETIBLEND at 50 % dimethiconol, like CSF-3504? Then I have a concrete lab sample to bring them." ] },
  { t: "Our questions to Silitex", min: "26–28", show: "/pitch → 'To confirm with Silitex' box", say: [
    "Custom grades — can you adjust active %, viscosity or emulsifier to a customer's matrix? Minimum batch?",
    "Sample lead time for 1–2 kg kits from Cologna Veneta, and who pays freight?",
    "Which chemist answers our customers' technical questions, and how fast?",
    "Written D4/D5/D6 statements and eco-label data for the grades we lead with; certificate PDFs for ISO 9001 / 14001 / 45001 and kosher.",
    "One open molecule: Cetyl Dimethicone — make, source from a partner, or no?" ] },
  { t: "If they ask — exclusivity", min: "—", show: "/pitch → Q&A 1", say: [
    "Silitex becomes the silicone and emulsion line we build the business on. Exceptions are written, not hidden: molecules you don't make, like Cetyl Dimethicone, and my small NuSil spot accounts while we qualify your equivalents.",
    "We earn only when Silitex product ships — and the agreement carries milestones you can measure." ] },
  { t: "If they ask — 'how do we know customers test?'", min: "—", show: "/pitch → Q&A 2 · /pipeline (no names on screen)", say: [
    "Every account moves through gates: sample, lab result, plant pilot, R&D approval, purchasing — with dates. You receive a monthly principal report from that live data.",
    "Account names are shared under the signed agreement's non-circumvention clause. (Do NOT open lead files with names on the shared screen.)" ] },
  { t: "If they ask — samples / payment", min: "—", show: "/pitch → Q&A 4–5", say: [
    "Proposal: Silitex supplies sample material with TDS and SDS; Sapirim funds the Israeli side — import, hand delivery, technical follow-up to R&D sign-off.",
    "Payment security per account: LC or CAD for new accounts, open terms for proven ones." ] },
  { t: "Close — next steps", min: "28–30", say: [
    "Proposed next steps: one — you send TDS/SDS and certificates for the focus grades. Two — we agree a sample budget. Three — within 30 days I dispatch 2 kg kits to five R&D labs: pulp-and-paper antifoam, eco detergents, textile softening, food fermentation, D5-free cosmetics. Four — we exchange a draft agreement: exclusivity, milestones, non-circumvention.",
    "Who is my counterpart for samples and for export paperwork? I'll send a written summary today." ] },
];
