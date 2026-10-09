// industries.ts (src/config/industries.ts) · updated 09.10.2026 09:40 (Asia/Jerusalem)
// Edit here to add/rename an industry. 'match' classifies products + leads by free text.
export type Industry = { key: string; he: string; match: RegExp };
export const INDUSTRIES: Industry[] = [
  { key: "food", he: "מזון ומשקאות", match: /food|beverage|sugar|yeast|ferment|kosher|bottling/i },
  { key: "water", he: "טיפול במים ושפכים", match: /water|wastewater|effluent|aeration|sludge/i },
  { key: "agro", he: "אגרוכימיה ודשנים", match: /agro|fertig|spray|crop|organic agro/i },
  { key: "textile", he: "טקסטיל", match: /textile|fabric|yarn|dyeing|towel|apparel|garment|microfiber|activewear|sewing/i },
  { key: "paper", he: "נייר ואריזה", match: /paper|pulp|tissue|cardboard|packaging|cellulose/i },
  { key: "paint", he: "צבעים וציפויים", match: /paint|coating|ink|adhesive|varnish/i },
  { key: "clean", he: "דטרגנטים וניקוי", match: /detergent|clean|cip|laundry|washing/i },
  { key: "build", he: "בנייה ואיטום", match: /masonry|concrete|mortar|stone|building/i },
  { key: "plastic", he: "פלסטיק וגומי", match: /mold|rubber|plastic|molding|welding|gasket/i },
  { key: "auto", he: "רכב ופוליש", match: /automotive|tire|polish|car/i },
  { key: "cosm", he: "קוסמטיקה", match: /cosmetic|hair/i },
  { key: "metal", he: "מתכת ותעשייה כבדה", match: /metal|mining|drilling|hydrocarbon|slurry|electronics/i },
];
export const industryHe = (key: string) => INDUSTRIES.find((i) => i.key === key)?.he || key;
