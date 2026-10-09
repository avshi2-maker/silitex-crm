// notes.ts (src/config/notes.ts) · updated 09.10.2026 16:55 (Asia/Jerusalem)
// Teleprompter script for the Silitex meeting (English). Open /notes on a second screen or phone — never on the shared screen.
export type Cue = { t: string; min: string; say: string[]; show?: string };
export const NOTES: Cue[] = [
  { t: "Open", min: "0–1", show: "/pitch?lang=en&demo=1 (counters running)", say: [
    "Thank you for the time. I'll show you a working system, not slides — everything you see is live at silitex.marble-art.co.il.",
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
    "At the same time your catalog still lists CM 040, a D5 carrier, for applications where it is permitted. I don't hide that. I tell the customer: read SDS section 3, and for REACH-sensitive uses we move you to the non-cyclic line. Customers respect the claim more when the gap is explained, not when it is denied.",
    "If any of that needs correcting, I'd rather hear it from you now than from a customer's chemist later." ] },
  { t: "Ask Silitex", min: "7–10", show: "/ask → food-industry example → Answer; then let THEM ask", say: [
    "Everything — your catalog, the cross-reference, the Kosher line, 50 Q&A built from your website — is indexed. Ask it something.",
    "Every answer cites its source. If the system doesn't know, it says so; it does not invent chemistry." ] },
  { t: "Daily discipline", min: "10–13", show: "/leads/LEAD-001 → action plan → sample tracker → Generate pitch", say: [
    "Each account carries its phase, next action, recommended SKU and the incumbent it replaces. Samples are tracked from shipment to lab result.",
    "A bot writes my call list every morning. Nothing waits in a mailbox." ] },
  { t: "Visibility", min: "13–15", show: "/report → Generate", say: [
    "This is what you receive monthly — pipeline by stage, samples in field, wins, forecast — generated from live data, not from my memory.",
    "Later we add a gated portal where your export, lab and invoicing people each see their own threads with us." ] },
  { t: "Ask", min: "15–18", show: "/pitch → What we need", say: [
    "What I need from you: exclusive distribution for Israel for 24 months with a 36-month renewal option, customer-of-record protection, the TDS/MSDS pack, sample kits for Phase 1, a distributor price list and current certificates.",
    "I carry the investment — the system, the visits, the samples logistics. The agreement is how that investment is protected. Logistics — DDP through my forwarder or direct invoicing for container volumes — is the customer's choice; commission terms go in the contract, not on this screen." ] },
  { t: "Close", min: "18–20", say: [
    "Proposed next step: you send the sample kits and documents, I start Phase 1 the week they land, and you get the first principal report 30 days later. Who on your side is my counterpart for samples and for export paperwork?" ] },
];
