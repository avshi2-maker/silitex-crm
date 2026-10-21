// article-d5.ts (src/portal/article-d5.ts) · created 21.10.2026 10:50 (Asia/Jerusalem) — PUBLIC PORTAL article: EU D4 / D5 / D6 restrictions (Regulation (EU) 2024/1328, REACH Annex XVII entry 70) — timeline 2020 → 2031 and how to move to a formulation without cyclic siloxanes. he / en / ru / it. Facts checked 21/10/2026 (cosmeticobs.com, chemlinked.com); the Official Journal text prevails.
import type { PLang } from "./config";
type Sec = { h: string; p?: string; li?: string[] };
export type Article = { title: string; lead: string; secs: Sec[]; alts: string; cta: string; check: string; legal: string };
export const ART_PATH = "/articles/d4-d5-d6-2027";
export const ART_DATE = "2026-10-21";
export const ART: Record<PLang, Article> = {
  he: {
    title: "D4, D5, D6 — מה משתנה ב-2026–2027 ואיך עוברים לפורמולציה ללא סילוקסנים מחזוריים",
    lead: "האיחוד האירופי מגביל בשלבים את הסילוקסנים המחזוריים D4, D5 ו-D6 לפחות מ-0.1% במוצרים. מי שמייצר קוסמטיקה, מוצרי ניקוי, פוליש או ווקס — ובמיוחד מי שמייצא לאירופה — צריך לבדוק את הפורמולציה עכשיו.",
    secs: [
      { h: "מה הם D4, D5 ו-D6", p: "סילוקסנים מחזוריים נדיפים: Cyclotetrasiloxane (D4), Cyclopentasiloxane (D5) ו-Cyclohexasiloxane (D6). הם נותנים תחושה קלילה ומתאדים מהעור, ולכן שימשו שנים כנשאים ואמוליינטים בקרמים, דאודורנטים, איפור ומוצרי שיער. הם יכולים להגיע גם כשאריות בחומרי גלם סיליקוניים אחרים — למשל באמולסיות דימתיקון." },
      { h: "לוח הזמנים (תקנה (EU) 2024/1328, REACH נספח XVII ערך 70)", li: [
        "31/01/2020 — D4 ו-D5 מעל 0.1% אסורים בקוסמטיקה בשטיפה (שמפו, סבון, מרכך).",
        "06/06/2026 — המגבלה הכללית: D4, D5 ו-D6 מעל 0.1% אסורים בשיווק כחומר או בתערובות — כולל קוסמטיקה בשטיפה (גם D6) ומוצרי צריכה ומקצוע כמו תכשירי ניקוי, פוליש ווקסים.",
        "06/06/2027 — קוסמטיקה ללא שטיפה: קרמים, דאודורנטים, איפור, סרומים ומוצרי טיפוח שיער.",
        "06/06/2031 — אביזרים רפואיים, תרופות ותרופות וטרינריות.",
        "D4 עצמו מופיע ברשימת החומרים האסורים בקוסמטיקה באיחוד (נספח II)." ] },
      { h: "למה זה נוגע ליצרנים בישראל", li: [
        "כל מוצר שמיוצא לאירופה חייב לעמוד בתקנה.",
        "רשתות ומותגים בינלאומיים כבר דורשים מספקים הצהרת \"D4/D5/D6-free\".",
        "הרגולציה בישראל נוטה לאמץ את הכללים האירופיים — עדיף להתכונן מראש." ] },
      { h: "איך עוברים — 3 צעדים", li: [
        "בודקים את רשימת ה-INCI של כל מוצר (Cyclopentasiloxane, Cyclohexasiloxane, Cyclomethicone).",
        "מבקשים מכל ספק חומר גלם סיליקוני תעודת שאריות D4/D5/D6 מתחת ל-0.1%.",
        "מחליפים את הנשא הנדיף בחלופה ובודקים במעבדה: תחושה, התאדות, יציבות." ] },
    ],
    alts: "חלופות מקטלוג Silitex לבדיקה",
    cta: "רוצים שנבדוק את הפורמולציה שלכם? שלחו INCI בוואטסאפ — ונחזור עם חלופה ודוגמה.",
    check: "בדקו את ה-INCI שלכם עכשיו — בחינם",
    legal: "המידע כללי ואינו ייעוץ משפטי. הנוסח הקובע הוא נוסח התקנה בכתב העת הרשמי של האיחוד האירופי.",
  },
  en: {
    title: "D4, D5, D6 — what changes in 2026–2027 and how to move to a formulation without cyclic siloxanes",
    lead: "The EU is restricting the cyclic siloxanes D4, D5 and D6 to below 0.1 % in products, step by step. Anyone making cosmetics, cleaning products, polishes or waxes — especially for export to Europe — should check formulations now.",
    secs: [
      { h: "What D4, D5 and D6 are", p: "Volatile cyclic siloxanes: Cyclotetrasiloxane (D4), Cyclopentasiloxane (D5) and Cyclohexasiloxane (D6). They give a light feel and evaporate from the skin, so for years they were used as carriers and emollients in creams, deodorants, make-up and hair care. They can also arrive as residues in other silicone raw materials — for example in dimethicone emulsions." },
      { h: "The timeline (Regulation (EU) 2024/1328, REACH Annex XVII entry 70)", li: [
        "31/01/2020 — D4 and D5 above 0.1 % banned in rinse-off cosmetics (shampoo, soap, conditioner).",
        "06/06/2026 — the general restriction: D4, D5 and D6 above 0.1 % may not be placed on the market as substances or in mixtures — including rinse-off cosmetics (now also D6) and consumer / professional products such as cleaning products, polishes and waxes.",
        "06/06/2027 — leave-on cosmetics: creams, deodorants, make-up, serums and hair care.",
        "06/06/2031 — medical devices, medicinal and veterinary medicinal products.",
        "D4 itself is on the list of substances prohibited in EU cosmetics (Annex II)." ] },
      { h: "Why it matters for manufacturers in Israel", li: [
        "Every product exported to Europe must comply.",
        "International retailers and brands already ask suppliers for a \"D4/D5/D6-free\" statement.",
        "Israeli regulation tends to follow EU rules — better to prepare early." ] },
      { h: "How to switch — 3 steps", li: [
        "Check the INCI list of every product (Cyclopentasiloxane, Cyclohexasiloxane, Cyclomethicone).",
        "Ask every silicone raw-material supplier for a D4/D5/D6 residue certificate below 0.1 %.",
        "Replace the volatile carrier with an alternative and test in the lab: feel, evaporation, stability." ] },
    ],
    alts: "Alternatives from the Silitex catalogue to test",
    cta: "Want us to check your formulation? Send the INCI on WhatsApp — we come back with an alternative and a sample.",
    check: "Check your INCI now — free",
    legal: "General information, not legal advice. The text published in the Official Journal of the EU prevails.",
  },
  ru: {
    title: "D4, D5, D6 — что меняется в 2026–2027 годах и как перейти на рецептуру без циклических силоксанов",
    lead: "ЕС поэтапно ограничивает циклические силоксаны D4, D5 и D6 уровнем ниже 0,1 % в продуктах. Производителям косметики, моющих средств, полиролей и восков — особенно для экспорта в Европу — стоит проверить рецептуры уже сейчас.",
    secs: [
      { h: "Что такое D4, D5 и D6", p: "Летучие циклические силоксаны: Cyclotetrasiloxane (D4), Cyclopentasiloxane (D5) и Cyclohexasiloxane (D6). Они дают лёгкое ощущение и испаряются с кожи, поэтому годами использовались как носители и эмоленты в кремах, дезодорантах, макияже и средствах для волос. Они также могут попадать как остатки в другое силиконовое сырьё — например, в эмульсии диметикона." },
      { h: "Сроки (Регламент (ЕС) 2024/1328, REACH Приложение XVII, позиция 70)", li: [
        "31/01/2020 — D4 и D5 выше 0,1 % запрещены в смываемой косметике (шампунь, мыло, кондиционер).",
        "06/06/2026 — общее ограничение: D4, D5 и D6 выше 0,1 % нельзя выпускать на рынок в виде веществ или в смесях — включая смываемую косметику (теперь и D6) и потребительские / профессиональные продукты: моющие средства, полироли, воски.",
        "06/06/2027 — несмываемая косметика: кремы, дезодоранты, макияж, сыворотки и средства для волос.",
        "06/06/2031 — медицинские изделия, лекарственные и ветеринарные препараты.",
        "Сам D4 входит в список веществ, запрещённых в косметике ЕС (Приложение II)." ] },
      { h: "Почему это важно для производителей в Израиле", li: [
        "Любой продукт, экспортируемый в Европу, должен соответствовать регламенту.",
        "Международные сети и бренды уже требуют от поставщиков заявления «без D4/D5/D6».",
        "Израильское регулирование обычно следует правилам ЕС — лучше подготовиться заранее." ] },
      { h: "Как перейти — 3 шага", li: [
        "Проверьте список INCI каждого продукта (Cyclopentasiloxane, Cyclohexasiloxane, Cyclomethicone).",
        "Запросите у каждого поставщика силиконового сырья сертификат остатков D4/D5/D6 ниже 0,1 %.",
        "Замените летучий носитель альтернативой и проверьте в лаборатории: ощущение, испарение, стабильность." ] },
    ],
    alts: "Альтернативы из каталога Silitex для испытаний",
    cta: "Хотите, чтобы мы проверили вашу рецептуру? Пришлите INCI в WhatsApp — предложим альтернативу и образец.",
    check: "Проверьте свой INCI сейчас — бесплатно",
    legal: "Общая информация, не юридическая консультация. Приоритет имеет текст, опубликованный в Официальном журнале ЕС.",
  },
  it: {
    title: "D4, D5, D6 — cosa cambia nel 2026–2027 e come passare a una formulazione senza silossani ciclici",
    lead: "L'UE limita per fasi i silossani ciclici D4, D5 e D6 a meno dello 0,1 % nei prodotti. Chi produce cosmetici, detergenti, polish o cere — soprattutto per l'export in Europa — dovrebbe verificare le formulazioni adesso.",
    secs: [
      { h: "Cosa sono D4, D5 e D6", p: "Silossani ciclici volatili: Cyclotetrasiloxane (D4), Cyclopentasiloxane (D5) e Cyclohexasiloxane (D6). Danno una sensazione leggera ed evaporano dalla pelle, per questo sono stati usati per anni come veicoli ed emollienti in creme, deodoranti, make-up e prodotti per capelli. Possono arrivare anche come residui in altre materie prime siliconiche — ad esempio nelle emulsioni di dimeticone." },
      { h: "Le scadenze (Regolamento (UE) 2024/1328, REACH Allegato XVII voce 70)", li: [
        "31/01/2020 — D4 e D5 oltre lo 0,1 % vietati nei cosmetici a risciacquo (shampoo, sapone, balsamo).",
        "06/06/2026 — la restrizione generale: D4, D5 e D6 oltre lo 0,1 % non possono essere immessi sul mercato come sostanze o in miscele — inclusi i cosmetici a risciacquo (ora anche D6) e i prodotti per consumatori / professionisti come detergenti, polish e cere.",
        "06/06/2027 — cosmetici senza risciacquo: creme, deodoranti, make-up, sieri e prodotti per capelli.",
        "06/06/2031 — dispositivi medici, medicinali e medicinali veterinari.",
        "Il D4 è già nell'elenco delle sostanze vietate nei cosmetici UE (Allegato II)." ] },
      { h: "Perché riguarda i produttori in Israele", li: [
        "Ogni prodotto esportato in Europa deve essere conforme.",
        "Catene e marchi internazionali chiedono già ai fornitori una dichiarazione \"senza D4/D5/D6\".",
        "La normativa israeliana tende a seguire le regole UE — meglio prepararsi in anticipo." ] },
      { h: "Come passare — 3 passi", li: [
        "Controllate la lista INCI di ogni prodotto (Cyclopentasiloxane, Cyclohexasiloxane, Cyclomethicone).",
        "Chiedete a ogni fornitore di materie prime siliconiche un certificato dei residui D4/D5/D6 sotto lo 0,1 %.",
        "Sostituite il veicolo volatile con un'alternativa e testate in laboratorio: sensazione, evaporazione, stabilità." ] },
    ],
    alts: "Alternative dal catalogo Silitex da provare",
    cta: "Volete che verifichiamo la vostra formulazione? Inviate l'INCI su WhatsApp — torniamo con un'alternativa e un campione.",
    check: "Verificate ora il vostro INCI — gratis",
    legal: "Informazione generale, non consulenza legale. Prevale il testo pubblicato nella Gazzetta ufficiale dell'UE.",
  },
};
/** catalogue products / families named in the leaflet as cyclopentasiloxane replacements or D-free grades */
export const ART_PRODUCTS = ["c13-15-alkane-po657", "c15-19-alkane-po599", "isododecane-po709", "alcasun-ve-po661", "dimethicone-1-5-cst-po653", "disiloxane-po587"];
export const ART_FAMILIES = ["cyclomethicone-volatile-siloxane", "silicone-elastomer-gel-d5-d5-free", "d4-d5-free-amino-silicone-macroemulsions"];
