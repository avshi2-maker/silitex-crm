// wa.ts (src/config/wa.ts) · updated 11.10.2026 08:20 (Asia/Jerusalem) — WhatsApp directory kinds (allow-list categories)
export const WA_KINDS: { key: string; he: string; icon: string }[] = [
  { key: "customer", he: "לקוח", icon: "🏭" },
  { key: "supplier", he: "ספק / Silitex", icon: "🇮🇹" },
  { key: "partner", he: "שותף / מתווך", icon: "🤝" },
  { key: "logistics", he: "לוגיסטיקה / עמיל מכס", icon: "🚢" },
  { key: "lab", he: "מעבדה / טכני", icon: "🧪" },
  { key: "team", he: "צוות", icon: "👥" },
  { key: "other", he: "אחר", icon: "📎" },
];
export const waKind = (k: string) => WA_KINDS.find((x) => x.key === k) || WA_KINDS[WA_KINDS.length - 1];
