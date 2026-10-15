// certs.ts (src/config/certs.ts) · updated 15.10.2026 13:35 (Asia/Jerusalem) — Silitex certifications shown on /pitch and /partner. Company-level ISO certificates seen on Silitex email signature (Certiquality logos, 15/10/2026) + product-level kosher. To attach a certificate PDF: put it in public/certs/ and set pdf: "/certs/<file>.pdf"; set expiry as dd/mm/yyyy when known.
export type Cert = { code: string; title: string; scope: string; why: string; body: string; level: "company" | "product"; pdf?: string; expiry?: string };
export const CERTS: Cert[] = [
  { code: "ISO 9001:2015", title: "Quality management", scope: "Documented, audited production and quality control", why: "Standard entry requirement on Israeli pharma, food and cosmetics approved-supplier lists", body: "Certiquality", level: "company" },
  { code: "ISO 14001:2015", title: "Environmental management", scope: "Environmental impact controlled and audited", why: "Requested by multinationals and in ESG / green tenders", body: "Certiquality", level: "company" },
  { code: "ISO 45001:2023", title: "Occupational health & safety", scope: "Audited safety system at the plant (current 2023 edition)", why: "Signals a serious, audited manufacturer for large corporate tenders", body: "Certiquality", level: "company" },
  { code: "Kosher", title: "Kosher food-grade antifoams", scope: "SILIFOOD 1600 · SILIFOOD 3000 K", why: "Mandatory for Israeli food, fermentation and beverage plants", body: "per product certificate", level: "product" },
];
