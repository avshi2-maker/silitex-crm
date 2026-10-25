// nav-groups.ts (src/config/nav-groups.ts) · created 25.10.2026 04:45 (Asia/Jerusalem)
// MENU BY WORK ORDER (owner view): Dashboard, then 6 groups — daily routine, customers & sales, finding new customers (open by default),
// products & knowledge, Silitex partnership, promotion & reports (closed by default, one click opens, remembered per browser).
// Each group lists its pages in display order. A page not listed falls into the last group so nothing ever disappears.
export type NavGroup = { id: string; he: string; open: boolean; hrefs: string[] };
export const NAV_GROUPS: NavGroup[] = [
  { id: "daily", he: "שגרה יומית", open: true, hrefs: ["/today", "/schedule", "/brief", "/hub", "/visits", "/capture", "/field"] },
  { id: "sales", he: "לקוחות ומכירות", open: true, hrefs: ["/leads", "/pipeline", "/potential", "/scan", "/logistics", "/satisfaction", "/federica"] },
  { id: "hunt", he: "איתור לקוחות חדשים", open: true, hrefs: ["/leads/prompt", "/radar", "/sniper", "/market", "/matrix", "/competitors"] },
  { id: "know", he: "מוצרים וידע", open: false, hrefs: ["/products", "/offsets", "/ask", "/formulations", "/faq", "/kb"] },
  { id: "silitex", he: "Silitex — שותפות", open: false, hrefs: ["/meetings", "/report", "/roadmap", "/partners", "/partner", "/pitch", "/market/gaps", "/notes", "/team"] },
  { id: "promo", he: "קידום ודוחות", open: false, hrefs: ["/promo", "/visibility", "/campaign", "/social", "/studio", "/he", "/partner/preview", "/mobile"] },
];
export const NAV_OPEN_KEY = "silitex-nav-open";
