// campaign.ts (src/prompts/campaign.ts) · updated 09.10.2026 09:40 (Asia/Jerusalem) — industry × channel promo
import type { Lead, Product } from "@/lib/types";
import { CHANNELS, channelHe } from "@/config/channels";
export function campaignContext(indHe: string, angle: string, targets: Lead[], prods: Product[]): string {
  return "תעשייה: " + indHe + "\nזווית: " + angle + "\nלקוחות יעד: " + targets.map((t) => t.name).join(", ") +
    "\n\nמוצרים:\n" + prods.map((p) => "- " + p.product_name + " | " + p.application_field + " | " + p.key_features + " | " + p.food_grade_certifications + " | מחליף: " + p.dow_corning_offset_benchmark).join("\n");
}
export function campaignPrompt(indHe: string, channel: string): string {
  const rules = CHANNELS.find((c) => c.key === channel)?.rules || "";
  return "צור " + channelHe(channel) + " שיווקי בעברית לתעשיית " + indHe + ". ערוץ: " + channel + ". " + rules + " הדגש מוצרים ספציפיים והמקבילות שהם מחליפים.";
}
