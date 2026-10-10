// shipping.ts (src/config/shipping.ts) · updated 10.10.2026 05:30 (Asia/Jerusalem)
// Shipment Data Request checklist (Italy → Israel, chemicals). Merged from Gemini + NotebookLM CSVs (10/10/2026), de-duplicated into 7 sections.
// who: who must fill the field — "sapirim" (prefilled by us), "silitex" (export dept), "forwarder" (Italian forwarder), "customer" (drop-ship consignee).
// Verify before use: Silitex address / EORI / contact / emergency phone are placeholders until Silitex confirms them. HS codes are suggestions — the Israeli customs broker decides.
export type ShipField = { id: string; en: string; it: string; he: string; req: "M" | "C" | "O"; who: "sapirim" | "silitex" | "forwarder" | "customer"; def?: string; purpose: string; note?: string; options?: string[] };
export type ShipSection = { n: number; en: string; it: string; he: string; fields: ShipField[] };
export const IMPORTER = { name: "Avshalom Sapir – Sapirim", vat: "52866969", address: "Kfar Shmaryahu, Israel", contact: "Avshi Sapir · avshi@sapirim.com · +972-50-5231042" };
export const PORTS = { sea_pol: ["Venice", "Genoa", "Trieste", "La Spezia"], sea_pod: ["Haifa", "Ashdod"], air_pol: ["Milan MXP", "Venice VCE", "Bologna BLQ"], air_pod: ["Tel Aviv TLV"] };
export const INCOTERMS_SHIP = ["EXW Silitex", "FCA Silitex", "FOB Venice", "CIF Haifa", "CIF Ashdod", "DAP plant", "DDP plant"];
export const SHIP_DOCS: { key: string; en: string; he: string; who: ShipField["who"] }[] = [
  { key: "invoice", en: "Commercial invoice", he: "חשבונית מסחרית", who: "silitex" }, { key: "packing", en: "Packing list", he: "רשימת אריזה", who: "silitex" },
  { key: "sds", en: "SDS 16-section (GHS, EN)", he: "גיליון בטיחות SDS", who: "silitex" }, { key: "tds", en: "TDS", he: "דף נתונים טכני", who: "silitex" },
  { key: "coa", en: "CoA per batch", he: "תעודת אנליזה לאצווה", who: "silitex" }, { key: "eur1", en: "EUR.1 / origin declaration on invoice", he: "EUR.1 / הצהרת מקור", who: "silitex" },
  { key: "nondg", en: "Non-DG declaration (if non-hazardous)", he: "הצהרת לא-מסוכן", who: "silitex" }, { key: "ispm", en: "ISPM-15 stamped pallets", he: "משטחים ISPM-15", who: "forwarder" },
  { key: "bl", en: "B/L or AWB", he: "שטר מטען / AWB", who: "forwarder" }, { key: "kosher", en: "Kosher / FDA cert (food SKUs)", he: "כשרות / FDA (מזון)", who: "silitex" },
];
const S = (n: number, en: string, it: string, he: string, fields: ShipField[]): ShipSection => ({ n, en, it, he, fields });
export const SHIPPING: ShipSection[] = [
  S(1, "Exporter / shipper", "Esportatore / mittente", "יצואן / שולח", [
    { id: "EXP_NAME", en: "Exporter legal name", it: "Ragione sociale esportatore", he: "שם היצואן", req: "M", who: "silitex", def: "Silitex S.r.l.", purpose: "Invoice, B/L, AWB, EUR.1, export declaration" },
    { id: "EXP_ADDR", en: "Exporter full address", it: "Indirizzo completo", he: "כתובת היצואן", req: "M", who: "silitex", purpose: "All documents", note: "Must match Camera di Commercio record — Silitex to confirm" },
    { id: "EXP_VAT", en: "Italian VAT (P.IVA) & EORI", it: "Partita IVA ed EORI", he: "מע\"מ / EORI איטלקי", req: "M", who: "silitex", purpose: "EU export customs (AES), EUR.1" },
    { id: "EXP_CONTACT", en: "Export contact (name, phone, email)", it: "Contatto export", he: "איש קשר יצוא", req: "M", who: "silitex", purpose: "Pickup booking, DG emergency contact" },
    { id: "EXP_PICKUP", en: "Pickup / warehouse address (if different)", it: "Indirizzo di ritiro", he: "כתובת איסוף", req: "O", who: "silitex", purpose: "Forwarder collection" } ]),
  S(2, "Consignee / importer", "Destinatario / importatore", "נמען / יבואן", [
    { id: "CNE_NAME", en: "Consignee legal name", it: "Ragione sociale importatore", he: "שם היבואן", req: "M", who: "sapirim", def: IMPORTER.name, purpose: "B/L, AWB, Israeli customs entry", note: "Drop-ship: the customer's registered name instead" },
    { id: "CNE_VAT", en: "Israeli VAT / company reg. no.", it: "P.IVA / codice fiscale Israele", he: "ח.פ. / עוסק מורשה", req: "M", who: "sapirim", def: IMPORTER.vat, purpose: "Customs entry + VAT link" },
    { id: "CNE_ADDR", en: "Delivery address / plant", it: "Indirizzo di consegna / stabilimento", he: "כתובת מסירה / מפעל", req: "M", who: "sapirim", def: IMPORTER.address, purpose: "Delivery order, B/L destination" },
    { id: "CNE_CONTACT", en: "Importer contact", it: "Contatto importatore", he: "איש קשר יבואן", req: "M", who: "sapirim", def: IMPORTER.contact, purpose: "Customs broker notification" },
    { id: "CNE_PERMIT", en: "Chemical import permit / poisons permit (if required)", it: "Licenza importazione sostanze chimiche", he: "היתר רעלים (אם נדרש)", req: "C", who: "sapirim", def: "To confirm per SKU — non-DG water emulsions usually exempt", purpose: "Ministry of Environmental Protection release" } ]),
  S(3, "Transport & routing", "Trasporto e instradamento", "הובלה ונתיב", [
    { id: "TR_MODE", en: "Transport mode", it: "Modalità di trasporto", he: "אופן הובלה", req: "M", who: "sapirim", options: ["Sea FCL", "Sea LCL", "Air"], purpose: "Booking & carrier" },
    { id: "TR_INCO", en: "Incoterms 2020", it: "Termini di resa", he: "תנאי מכר", req: "M", who: "sapirim", options: INCOTERMS_SHIP, purpose: "Risk transfer, freight payer, customs value" },
    { id: "TR_POL", en: "Port / airport of loading", it: "Porto / aeroporto di partenza", he: "נמל טעינה", req: "M", who: "forwarder", purpose: "B/L, AWB, export declaration" },
    { id: "TR_POD", en: "Port / airport of discharge", it: "Porto / aeroporto di arrivo", he: "נמל פריקה", req: "M", who: "sapirim", purpose: "Import filing" },
    { id: "TR_READY", en: "Cargo ready date", it: "Data merce pronta", he: "תאריך מוכנות", req: "M", who: "silitex", purpose: "Booking" },
    { id: "TR_ETA", en: "ETD / ETA", it: "ETD / ETA", he: "יציאה / הגעה משוערת", req: "O", who: "forwarder", purpose: "Customer planning" } ]),
  S(4, "Commercial & trade preference", "Commerciale e origine preferenziale", "מסחרי ומקור מועדף", [
    { id: "COM_INV", en: "Commercial invoice no. & date", it: "Numero e data fattura", he: "מס' חשבונית ותאריך", req: "M", who: "silitex", purpose: "Customs valuation" },
    { id: "COM_VALUE", en: "Invoice value & currency (FOB / freight / insurance split)", it: "Valore e valuta", he: "ערך ומטבע", req: "M", who: "silitex", def: "EUR", purpose: "Duty + import VAT base (CIF)" },
    { id: "COM_HS", en: "HS code per line", it: "Codice doganale (Taric)", he: "פרט מכס", req: "M", who: "silitex", def: "3910.00 silicones · 3402.90 surfactant preps · 3824.99 antifoam preps — broker to confirm", purpose: "Tariff classification", note: "3824.90 in the NotebookLM sheet is outdated (3824.99 since HS 2017)" },
    { id: "COM_ORIGIN", en: "Country of origin", it: "Paese di origine", he: "ארץ מקור", req: "M", who: "silitex", def: "Italy (EU)", purpose: "EU–Israel FTA: 0% duty" },
    { id: "COM_EUR1", en: "EUR.1 certificate or approved-exporter declaration on invoice", it: "EUR.1 / dichiarazione su fattura", he: "EUR.1 / הצהרת מקור", req: "M", who: "silitex", purpose: "Duty exemption at Israeli customs" },
    { id: "COM_BATCH", en: "Batch / lot no., production & expiry dates", it: "Lotto, data produzione, scadenza", he: "אצווה, ייצור, תפוגה", req: "M", who: "silitex", purpose: "CoA match, shelf-life control" } ]),
  S(5, "Dangerous goods — SDS §14 (ADR / IMDG / IATA)", "Merci pericolose — SDS §14", "חומ\"ס — SDS §14", [
    { id: "DG_CLASS", en: "DG or Non-DG (per SDS §14)", it: "Classificazione ADR/IMDG/IATA", he: "סיווג חומ\"ס", req: "M", who: "silitex", options: ["Non-DG — not restricted", "DG"], purpose: "Carrier acceptance, surcharge" },
    { id: "DG_ADR", en: "ADR road transport text (Chapter 5.4) or 'NOT RESTRICTED ACCORDING TO ADR/RID'", it: "Testo ADR per spedizioniere", he: "טקסט ADR לשילוח", req: "M", who: "silitex", purpose: "Forwarder quote (hazardous surcharge)", note: "Format: UN XXXX, PSN, CLASS X, PG X, (flash point °C), ENVIRONMENTALLY HAZARDOUS" },
    { id: "DG_UN", en: "UN number / Proper Shipping Name / Class / Packing Group", it: "Numero UN / PSN / Classe / Gruppo", he: "UN / PSN / דרגה / קבוצת אריזה", req: "C", who: "silitex", purpose: "DGD, labels, stowage" },
    { id: "DG_FLASH", en: "Flash point (°C)", it: "Punto di infiammabilità", he: "נקודת הבזקה", req: "M", who: "silitex", purpose: "Liquid chemical screening at ports" },
    { id: "DG_SEA", en: "IMDG: marine pollutant Y/N, segregation group, stowage category", it: "IMDG: inquinante marino, segregazione, stivaggio", he: "IMDG: מזהם ימי, הפרדה, אחסנה", req: "C", who: "silitex", purpose: "Vessel booking, Haifa/Ashdod pre-clearance" },
    { id: "DG_AIR", en: "IATA: packing instruction, max net qty passenger / CAO, DGD required", it: "IATA: istruzione imballaggio, quantità max, DGD", he: "IATA: הוראת אריזה, כמות מקס', DGD", req: "C", who: "silitex", purpose: "Airline booking, AWB" },
    { id: "DG_EMERG", en: "24/7 emergency phone", it: "Telefono emergenza 24/7", he: "טלפון חירום 24/7", req: "M", who: "silitex", purpose: "All chemical manifests" } ]),
  S(6, "Cargo & packaging", "Merce e imballaggio", "מטען ואריזה", [
    { id: "PK_TYPE", en: "Packaging type & count (e.g. 4 × 200 kg HDPE drums)", it: "Tipo e numero colli", he: "סוג וכמות אריזות", req: "M", who: "silitex", purpose: "Packing list, B/L", note: "UN-approved packaging if DG" },
    { id: "PK_NET", en: "Net weight per package & total (kg)", it: "Peso netto per collo e totale", he: "משקל נטו", req: "M", who: "silitex", purpose: "Customs valuation" },
    { id: "PK_GROSS", en: "Gross weight per package & total incl. pallets (kg)", it: "Peso lordo totale", he: "משקל ברוטו", req: "M", who: "silitex", purpose: "AWB, VGM (SOLAS)" },
    { id: "PK_PALLET", en: "Pallet type, count, ISPM-15 heat-treatment stamp", it: "Pallet, numero, marchio ISPM-15", he: "משטחים, כמות, חותמת ISPM-15", req: "M", who: "silitex", def: "EUR pallets 120×80, ISPM-15 HT stamped", purpose: "Israeli plant protection (PPIS) — mandatory on wood" },
    { id: "PK_DIM", en: "Pallet dimensions L×W×H (cm) & total CBM", it: "Dimensioni e volume (m³)", he: "ממדים ונפח", req: "M", who: "silitex", purpose: "Chargeable weight / LCL" },
    { id: "PK_STACK", en: "Stackable Y/N", it: "Sovrapponibile", he: "ניתן לערום", req: "M", who: "silitex", purpose: "Air and consolidation" } ]),
  S(7, "Regulatory & quality documents", "Documenti regolatori e qualità", "מסמכי רגולציה ואיכות", [
    { id: "DOC_SDS", en: "SDS 16-section GHS, English (Hebrew summary welcome)", it: "SDS 16 sezioni", he: "SDS", req: "M", who: "silitex", purpose: "Customs, Ministry of Env. Protection, port" },
    { id: "DOC_TDS", en: "TDS", it: "Scheda tecnica", he: "TDS", req: "M", who: "silitex", purpose: "Importer / regulator verification" },
    { id: "DOC_COA", en: "CoA per batch (lot, mfg date, expiry, active %)", it: "Certificato di analisi", he: "CoA", req: "M", who: "silitex", purpose: "Clearance + customer QC" },
    { id: "DOC_NONDG", en: "Non-dangerous goods declaration (if Non-DG)", it: "Dichiarazione merce non pericolosa", he: "הצהרת לא-מסוכן", req: "C", who: "silitex", purpose: "Airline / carrier acceptance without DG surcharge" },
    { id: "DOC_FOOD", en: "Kosher / FDA certificates (food-grade SKUs)", it: "Certificati Kosher / FDA", he: "כשרות / FDA", req: "C", who: "silitex", purpose: "Food customers, rabbinate" },
    { id: "DOC_ECO", en: "GOTS-ICEA / eco certificates (textile SKUs)", it: "Certificati GOTS-ICEA", he: "GOTS-ICEA", req: "C", who: "silitex", purpose: "Textile customers" } ]),
];
export const SHIP_FIELDS = SHIPPING.flatMap((s) => s.fields);
export const SHIP_STATUS: { key: string; he: string; tone: string }[] = [{ key: "requested", he: "בקשת נתונים נשלחה", tone: "slate" }, { key: "data_received", he: "נתונים התקבלו", tone: "blue" }, { key: "booked", he: "הובלה הוזמנה", tone: "amber" }, { key: "shipped", he: "יצא", tone: "purple" }, { key: "customs", he: "במכס", tone: "amber" }, { key: "delivered", he: "נמסר ✓", tone: "green" }];
