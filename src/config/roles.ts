// roles.ts (src/config/roles.ts) · updated 09.10.2026 19:20 (Asia/Jerusalem)
// Contact job-description groups: used as the role filter on /leads and as suggestions in intake forms. Free text still allowed.
export type RoleGroup = { key: string; he: string; match: RegExp; examples: string[] };
export const ROLE_GROUPS: RoleGroup[] = [
  { key: "rnd", he: "R&D / כימאי ראשי", match: /r&d|r & d|chemist|formulat|technical|technolog|lab|research|develop|כימאי|פיתוח|מעבדה|טכנולוג/i, examples: ["Chief Chemist", "VP R&D", "Formulation Lead", "Technical Director"] },
  { key: "procurement", he: "רכש / קניין", match: /procure|purchas|buyer|sourcing|supply chain|רכש|קניין/i, examples: ["Procurement Manager", "Purchasing Lead", "Buyer"] },
  { key: "qa", he: "איכות / רגולציה", match: /quality|qa|qc|regulator|compliance|safety|ehs|איכות|רגולצ/i, examples: ["QA Manager", "Regulatory Affairs", "EHS Manager"] },
  { key: "ops", he: "תפעול / ייצור", match: /operation|production|plant|process|engineer|manufactur|תפעול|ייצור|מפעל|תהליך/i, examples: ["Plant Manager", "Production Director", "Process Engineer"] },
  { key: "mgmt", he: "הנהלה / בעלים", match: /ceo|cto|coo|owner|general manager|managing|director|vp|founder|מנכ|בעלים|סמנכ/i, examples: ["CEO", "General Manager", "Owner"] },
];
export const ROLE_SUGGESTIONS = ROLE_GROUPS.flatMap((g) => g.examples);
export const roleGroupOf = (text: string) => ROLE_GROUPS.find((g) => g.match.test(text))?.key || "";
