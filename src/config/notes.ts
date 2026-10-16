// notes.ts (src/config/notes.ts) · updated 16.10.2026 05:45 — + the testing gate (price objection) and the integrity line (Asia/Jerusalem)
// Teleprompter script for the Silitex meeting (English). Open /notes on a second screen or phone — never on the shared screen.
export type Cue = { t: string; min: string; say: string[]; show?: string };
export const NOTES: Cue[] = [
  { t: "Open", min: "0–1", show: "/pitch?lang=en&demo=1 (counters running)", say: [
    "Thank you for the time. I'll show you a working system, not slides — everything you see is live at silitex.marble-art.co.il.",
    "One honesty line first: the numbers you will see are desk estimates built from your catalogues and the plants' own product lines — not customer commitments. The system marks what is backed by your 2026 catalogues and what still needs a catalogue from you.",
    "I am the commercial channel for Israel: 19 named plants, mapped by decision-maker and by the Silitex SKU that fits. My job is to put Silitex in front of them with discipline, and to give you full visibility." ] },
  { t: "Market", min: "1–4", show: "map + priorities", say: [
    "Every pin is a plant within two hours of Tel Aviv. Five product families carry most of the potential: water repellents for building, process antifoams, Kosher/FDA food-grade, green chemistry, GOTS textile softeners.",
    "Israel has one specific lever most global brands cannot show on the drum: the Kosher certificate. For food, beverage, yeast and sugar it is specified by the rabbinate, not by R&D." ] },
  { t: "Cross-reference", min: "4–7", show: "/offsets → search 'SAG 30' → /sniper → Load sample → Draft offer", say: [
    "This is how I sell against the incumbents: a customer sends me his Dow, Wacker or Momentive purchase list and gets back the Silitex equivalent and a replacement offer in a minute.",
    "I want to be clear about my role: I am not a chemist. I don't argue formulations — I bring the lead, the sample and the lab slot, and I route every technical question to your people. That is why this system exists." ] },
  { t: "REACH / D4 — say this only if it comes up", min: "—", show: "/products banner (amber)", say: [
    "I have followed the cyclic-siloxane issue for years from the customer side. Israeli formulators who export to the EU ask about D4 and D5 first.",
    "The way I present it to customers is this: Silitex has dedicated non-cyclic lines — MACROAMISIL E1386, MICROAMISIL E1352, IDROAMISIL 250 — linear DM dimethicones, and fully vegetal options like EVEROIL and FISIOREX. That is a real advantage over legacy competitor products.",
    "At the same time your catalog still lists CICLOPENTASILOSSANO, a D5 carrier, for applications where it is permitted. I don't hide that. I tell the customer: read SDS section 3, and for REACH-sensitive uses we move you to the non-cyclic line. Customers respect the claim more when the gap is explained, not when it is denied.",
    "If any of that needs correcting, I'd rather hear it from you now than from a customer's chemist later." ] },
  { t: "Ask Silitex", min: "7–10", show: "/ask → food-industry example → Answer; then let THEM ask", say: [
    "Everything — your catalog, the cross-reference, the Kosher line, 50 Q&A built from your website — is indexed. Ask it something.",
    "Every answer cites its source. If the system doesn't know, it says so; it does not invent chemistry." ] },
  { t: "Daily discipline", min: "10–13", show: "/leads/LEAD-001 → action plan → sample tracker → Generate pitch", say: [
    "Each account carries its phase, next action, recommended SKU and the incumbent it replaces. Samples are tracked from shipment to lab result.",
    "A bot writes my call list every morning. Nothing waits in a mailbox." ] },
  { t: "How I run a sale + who does what", min: "—", show: "/team?lang=en (team cards + 9-step process)", say: [
    "Three people and a system. I own the accounts, the offers and your report. Back-office runs data sheets, samples shipped direct from Silitex, import files and invoicing. An external formulation chemist joins the lab-qualification visits and routes open chemistry to your laboratory — I never answer those myself.",
    "Every sale follows nine steps, each with an owner and a screen: lead in with company, name and mobile mandatory; intake; TDS pack; sample; RFQ; price offer in EUR per kg with validity; negotiation; order; follow-up. A follow-up task is created automatically two days after a data sheet and three days after an offer. The daily brief bot tells me what to do each morning." ] },
  { t: "Visibility", min: "13–15", show: "/report → Generate", say: [
    "This is what you receive monthly — pipeline by stage, samples in field, wins, forecast — generated from live data, not from my memory.",
    "Later we add a gated portal where your export, lab and invoicing people each see their own threads with us." ] },
  { t: "The testing gate — say this when they ask 'how will you get the first order'", min: "—", show: "/market → integrity panel + /offsets", say: [
    "I will be straight with you about the biggest wall in this market. When I offer an equivalent silicone to a plant's R&D, the first answer is: give me a better price than what I use today, otherwise I won't spend lab hours on testing. In commodities we will lose that argument every time — Wacker and Shin-Etsu sit in Israeli warehouses.",
    "So I do not sell price-per-kilo. I sell three things the incumbent cannot: a formulated product that costs less per batch because it works at a lower dose; a trial that costs the plant nothing — sample, dosage protocol, and our lab note; and a reason to test that is not price: a Kosher drum, an Ecolabel, a D5-free reformulation they are forced into by 2027, an MBR-compatible antifoam, a supplier who answers in Hebrew the same day.",
    "What I need from you for that: a sample policy up to 25 kg at no charge, a trial-lot price for the first 500 kg, dosage data per application from your lab, and a 60-day answer on any technical question. With those four I convert tests; without them I am one more agent with a price list." ] },
  { t: "Ask", min: "15–18", show: "/pitch → What we need", say: [
    "What I need from you: exclusive distribution for Israel for 24 months with a 36-month renewal option, customer-of-record protection, the TDS/MSDS pack, sample kits for Phase 1, a distributor price list and current certificates.",
    "I carry the investment — the system, the visits, the samples logistics. The agreement is how that investment is protected. Logistics — DDP through my forwarder or direct invoicing for container volumes — is the customer's choice; commission terms go in the contract, not on this screen." ] },
  { t: "Close", min: "18–20", say: [
    "Proposed next step: you send the sample kits and documents, I start Phase 1 the week they land, and you get the first principal report 30 days later. Who on your side is my counterpart for samples and for export paperwork?" ] },
];
