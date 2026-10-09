// team.ts (src/config/team.ts) · updated 09.10.2026 18:30 (Asia/Jerusalem)
// Sapirim team shown on /team and in the pitch. Fill names / bios here only. Photos: public/team/<photo>.
export type Member = { role: string; roleHe: string; name: string; bio: string; owns: string[]; photo?: string; external?: boolean };
export const TEAM: Member[] = [
  { role: "General Manager", roleHe: "מנכ\"ל", name: "Avshi Sapir", bio: "30+ years in industrial supply and flooring systems; distributor of Cosmochem silicone fluids and Topcret in Israel. Owns the account relationships, pricing and the principal reporting.", owns: ["Account ownership & visits", "Price offers & negotiation", "Principal report to Silitex", "CRM & automation"] },
  { role: "Back-office & Logistics", roleHe: "בק-אופיס ולוגיסטיקה", name: "Sapirim back-office", bio: "Order processing, TDS/MSDS dispatch, sample shipments from Tel Aviv stock, import files (Standards Institute, MoH), invoicing and collection.", owns: ["Data-sheet packs & samples", "Import documentation", "Local stock, 2-day delivery", "Invoicing & payment follow-up"] },
  { role: "Chemist — external consultant", roleHe: "כימאי — יועץ חיצוני", name: "External formulation chemist", bio: "Independent silicone/formulation chemist retained per project: reads the customer's spec, runs the lab qualification protocol with the customer's chief chemist and routes open questions to the Silitex laboratory.", owns: ["Technical qualification visits", "Drop-in replacement protocols", "REACH / D4-D5 guidance", "Liaison with Silitex lab"], external: true },
];
export const TEAM_INTRO = "A small, specialised team: one commercial owner, one back-office, one chemist on call — and the CRM doing the daily discipline.";
