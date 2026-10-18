// route.ts (src/app/api/portal/llms/route.ts) · updated 18.10.2026 18:20 (Asia/Jerusalem) — llms.txt for the PUBLIC PORTAL: a short plain-text map of the site for AI assistants (who we are, what is where, contact)
import { PORTAL_URL, CONTACT } from "@/portal/config";
import { P_INDUSTRIES, P_FAMILIES, P_PRODUCTS } from "@/portal/data";
export function GET() {
  const u = (p: string) => PORTAL_URL + "/en" + p;
  const body = [
    "# Sapirim — industrial silicones in Israel",
    "",
    "> Sapirim (Avshi Sapir) has worked in industrial silicones in Israel for about 35 years and markets silicone emulsions, antifoams, softeners and water repellents of Silitex S.r.l. (Italy). Content is available in Hebrew (/he), English (/en) and Russian (/ru). Product data comes from the Silitex 2026 catalogues.",
    "",
    "## Key pages",
    "- [Alternatives to known codes](" + u("/alternatives") + "): " + P_FAMILIES.length + " product families mapping Dow/DOWSIL/XIAMETER, Wacker, Momentive, Shin-Etsu, Evonik, Elkem codes to the Silitex equivalent",
    "- [Products](" + u("/products") + "): " + P_PRODUCTS.length + " products with INCI, active matter, application and compliance",
    "- [Industries](" + u("/industries") + "): " + P_INDUSTRIES.map((i) => i.name.en).join(", "),
    "- [D4 / D5 / D6 regulation](" + u("/regulation") + "): EU limits on cyclic siloxanes and what they mean for formulators",
    "- [FAQ](" + u("/faq") + ")",
    "",
    "## Alternatives (examples)",
    ...P_FAMILIES.slice(0, 15).map((f) => "- [" + f.dow_corning.split("/")[0].trim() + " → " + f.silitex_product.split(" - ")[0] + "](" + u("/alternatives/" + f.slug) + ")"),
    "",
    "## Contact",
    "- " + CONTACT.name + " · " + CONTACT.phone + " (WhatsApp) · " + CONTACT.email,
    "",
    "Equivalents are partial matches from a comparison table; suitability must be verified against the technical data sheet and tested in the customer's process.",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
