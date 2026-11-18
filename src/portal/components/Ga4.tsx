// Ga4.tsx (src/portal/components/Ga4.tsx) · created 18.11.2026 11:45 (Asia/Jerusalem) — v1.19.0 Google Analytics 4 on the PUBLIC portal only (www.sapirim.com) — counts visits incl. ChatGPT / Perplexity / Gemini referrals for Sapirim Hub 🔎. Loads only when NEXT_PUBLIC_GA4_ID is set; the CRM pages never load it.
import Script from "next/script";
const ID = process.env.NEXT_PUBLIC_GA4_ID;
export default function Ga4() {
  if (!ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ID}');`}</Script>
    </>
  );
}
