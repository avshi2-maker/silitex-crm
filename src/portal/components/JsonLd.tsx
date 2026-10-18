// JsonLd.tsx (src/portal/components/JsonLd.tsx) · updated 18.10.2026 18:00 (Asia/Jerusalem) — structured data block (schema.org) that search engines and AI crawlers read
export default function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
