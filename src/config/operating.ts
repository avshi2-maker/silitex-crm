// operating.ts (src/config/operating.ts) · updated 16.10.2026 06:05 (Asia/Jerusalem)
// /pitch "How Sapirim runs Silitex Israel": lean team + AI-run system (then vs now), what the system does 24/7 (every item = a live screen
// in this CRM), and the 2-year build-up with hiring triggers. English — audience Silitex. Facts from Avshi 16/10/2026.
export const OPS = {
  title: "Sapirim 2.0 — a lean team running on its own AI system",
  sub: "In the Dow Corning years Sapirim needed a full office to run the same territory. Today one experienced owner, one dedicated support person and an external chemist cover it — because the system we built does the routine work 24/7 and leaves the human touch to us.",
  then: {
    label: "Then — Dow Corning era",
    people: ["General manager", "Specialist chemist (PhD)", "Economist", "Order processing", "Logistics runner — deliveries, samples, customs", "External bookkeeping / CPA"],
    tools: "SAP to run the operation — about $15,000 a year in licences alone",
  },
  now: {
    label: "Now — Sapirim for Silitex",
    people: ["Avshi Sapir — accounts, offers, R&D relationships, principal reporting", "Dedicated support — orders, samples, customs clearance, deliveries", "External formulation chemist — on call for lab qualifications", "External CPA"],
    tools: "Our own CRM + AI knowledge system, built for this territory — running for a fraction of the old SAP licence",
  },
  system: [
    ["🗺️", "Mapped market", "Target accounts with decision-maker roles, incumbent supplier, matched Silitex grade and volume — the pipeline Silitex sees in the monthly report."],
    ["⚡", "Instant cross-reference", "Any Dow / XIAMETER / Wacker / Momentive / Evonik code → the Silitex grade, catalogue row and PDF, in seconds, during the customer call."],
    ["🔎", "Ask Silitex (AI on your catalogues)", "Answers technical questions in English, Italian or Hebrew from the Silitex 2026 catalogues with sources — no source, no answer: the question goes to a human."],
    ["🧪", "R&D-gated pipeline", "Every account moves through lab sample → plant pilot → R&D approval → purchasing, with exit criteria and a follow-up task at each gate."],
    ["📧", "One-click sample requests", "The sample request to Silitex is written from the customer's technical file: product, kg, documents, application, needed-by date — and tracked to the lab result."],
    ["📬", "Correspondence hub", "Outlook and WhatsApp threads with Silitex and customers filed automatically by department and account; nothing waits unanswered."],
    ["🤖", "Daily brief & schedule", "Every morning: who to call, which sample is due, which offer to chase — generated from live data."],
    ["📑", "Principal report", "Pipeline by stage, samples in field, forecast tonnage and wins — generated for Silitex from the same data, no spreadsheets."],
    ["🤝", "Partner portal", "Silitex staff get read-only access to the knowledge tools, with a direct line to Sapirim answered within 24 hours."],
  ] as [string, string, string][],
  buildup: [
    { when: "Months 0–12", head: "Launch on the existing team", text: "Avshi + dedicated support + external chemist on call. Focus: 6–8 active R&D evaluations at a time, first plant pilots and trial orders. Direct supply per PO, no stock." },
    { when: "Months 12–24", head: "Grow when the pipeline proves it", text: "Trigger: 3 or more accounts in plant pilot or ordering → add a technical sales chemist (part-time first). Trigger: repeat orders from proven accounts → selective local buffer for those accounts only, paid by the account." },
  ],
  note: "The system scales; the team grows only when orders justify it. Silitex gets a channel with low fixed cost, full visibility and a decision-maker who answers the phone.",
};
