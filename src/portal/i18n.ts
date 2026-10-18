// i18n.ts (src/portal/i18n.ts) · updated 18.10.2026 17:45 (Asia/Jerusalem) — PUBLIC PORTAL texts in Hebrew / English / Russian (server-side, per-URL language for SEO). Product data itself stays in the catalogue language (English).
import type { PLang } from "./config";
type D = Record<string, string>;
const he: D = {
  brand: "ספירים — סיליקונים לתעשייה", tagline: "35 שנות ניסיון בסיליקונים לתעשייה בישראל — אמולסיות, נוגדי קצף, מרככים ודוחי מים.",
  home: "בית", industries: "תעשיות", alternatives: "חלופות לקודים מוכרים", products: "מוצרים", faq: "שאלות ותשובות", regulation: "רגולציה D4/D5/D6",
  finder: "מצאו חלופה לקוד שאתם עובדים איתו", finderHint: "הקלידו קוד של Dow, Wacker, Momentive, Shin-Etsu, Evonik…", finderNone: "אין התאמה בטבלה — שלחו לנו את הקוד בוואטסאפ ונבדוק.",
  cta: "שיחה טכנית או דוגמה", ctaText: "ספרו לנו מה הבעיה בקו — נחזור עם הצעה טכנית ודוגמה לבדיקה.", wa: "וואטסאפ", email: "מייל", form: "טופס פנייה",
  indIntro: "מוצרים מתאימים מתוך קטלוגי Silitex 2026, עם נתונים טכניים לכל מוצר.", typicalQ: "שאלות נפוצות בתעשייה הזו", seeProduct: "לפרטי המוצר",
  altIntro: "מקבילות לפי טבלת ההשוואה: קודים של יצרנים גלובליים מול המוצר המקביל של Silitex. התאמה חלקית — יש לאמת מול דף נתונים טכני (TDS) לפני שימוש.",
  competitorCodes: "קודים מקבילים אצל יצרנים אחרים", silitexEq: "המקבילה של Silitex", certs: "תעודות", inci: "INCI / חומר פעיל",
  spec: "נתונים טכניים", active: "חומר פעיל", type: "סוג", application: "יישום", dosage: "מינון", compliance: "תקינה / תאימות", sector: "תחום", section: "קבוצה", source: "מקור: קטלוג Silitex", tds: "דף הקטלוג (PDF)",
  regIntro: "מה השתנה בכללים לגבי סילוקסנים מחזוריים, ומה זה אומר על פורמולציות.", regIsrael: "בישראל: לא אושר שהמגבלות האירופיות חלות גם על השוק המקומי — מומלץ לבדוק מול הרגולטור.",
  regWhat: "מה עושים?", regDo: "בודקים בפורמולציה אם יש D4 / D5 / D6 כרכיב או כשארית, ומחפשים חלופה מתאימה ללא סילוקסנים מחזוריים. אנחנו עוזרים לבחור ולבדוק.",
  allIndustries: "כל התעשיות", allProducts: "כל המוצרים", updated: "עודכן", about: "על ספירים", aboutText: "ספירים פועלת בישראל בתחום הסיליקונים לתעשייה כ-35 שנה, ומשווקת היום מוצרי Silitex S.r.l. מאיטליה.",
  disclaimer: "המידע מבוסס על קטלוגים ודפי מוצר של היצרן. התאמה לתהליך מחייבת בדיקה.", lang: "שפה",
};
const en: D = {
  brand: "Sapirim — industrial silicones", tagline: "35 years in industrial silicones in Israel — emulsions, antifoams, softeners and water repellents.",
  home: "Home", industries: "Industries", alternatives: "Alternatives to known codes", products: "Products", faq: "FAQ", regulation: "D4/D5/D6 regulation",
  finder: "Find an alternative to the code you use", finderHint: "Type a Dow, Wacker, Momentive, Shin-Etsu, Evonik… code", finderNone: "No match in the table — send us the code on WhatsApp and we will check.",
  cta: "Technical talk or a sample", ctaText: "Tell us what the problem on the line is — we will come back with a technical proposal and a sample to test.", wa: "WhatsApp", email: "E-mail", form: "Contact form",
  indIntro: "Matching products from the Silitex 2026 catalogues, with technical data for each.", typicalQ: "Typical questions in this industry", seeProduct: "Product details",
  altIntro: "Equivalents from the comparison table: global producers' codes versus the matching Silitex product. Partial match — verify against the technical data sheet (TDS) before use.",
  competitorCodes: "Equivalent codes from other producers", silitexEq: "Silitex equivalent", certs: "Certificates", inci: "INCI / active matter",
  spec: "Technical data", active: "Active matter", type: "Type", application: "Application", dosage: "Dosage", compliance: "Compliance", sector: "Sector", section: "Group", source: "Source: Silitex catalogue", tds: "Catalogue page (PDF)",
  regIntro: "What changed in the rules on cyclic siloxanes, and what it means for formulations.", regIsrael: "Israel: it has not been confirmed that the EU limits apply to the local market — worth checking with the regulator.",
  regWhat: "What to do", regDo: "Check whether the formulation contains D4 / D5 / D6 as an ingredient or residue, and look for a suitable alternative without cyclic siloxanes. We help choose and test.",
  allIndustries: "All industries", allProducts: "All products", updated: "Updated", about: "About Sapirim", aboutText: "Sapirim has worked in industrial silicones in Israel for about 35 years and today markets products of Silitex S.r.l., Italy.",
  disclaimer: "Information based on the producer's catalogues and product pages. Suitability for a process requires testing.", lang: "Language",
};
const ru: D = {
  brand: "Sapirim — промышленные силиконы", tagline: "35 лет в промышленных силиконах в Израиле — эмульсии, пеногасители, мягчители и гидрофобизаторы.",
  home: "Главная", industries: "Отрасли", alternatives: "Аналоги известных марок", products: "Продукты", faq: "Вопросы и ответы", regulation: "Регулирование D4/D5/D6",
  finder: "Найдите аналог марки, с которой вы работаете", finderHint: "Введите код Dow, Wacker, Momentive, Shin-Etsu, Evonik…", finderNone: "В таблице нет совпадения — пришлите код в WhatsApp, и мы проверим.",
  cta: "Техническая консультация или образец", ctaText: "Расскажите, какая проблема на линии — мы вернёмся с техническим предложением и образцом для испытания.", wa: "WhatsApp", email: "E-mail", form: "Форма обращения",
  indIntro: "Подходящие продукты из каталогов Silitex 2026 с техническими данными.", typicalQ: "Типичные вопросы в этой отрасли", seeProduct: "Подробнее о продукте",
  altIntro: "Аналоги по сравнительной таблице: марки мировых производителей и соответствующий продукт Silitex. Частичное соответствие — проверьте по техническому листу (TDS) перед применением.",
  competitorCodes: "Аналогичные марки других производителей", silitexEq: "Аналог Silitex", certs: "Сертификаты", inci: "INCI / активное вещество",
  spec: "Технические данные", active: "Активное вещество", type: "Тип", application: "Применение", dosage: "Дозировка", compliance: "Соответствие", sector: "Сектор", section: "Группа", source: "Источник: каталог Silitex", tds: "Страница каталога (PDF)",
  regIntro: "Что изменилось в правилах для циклических силоксанов и что это значит для рецептур.", regIsrael: "Израиль: не подтверждено, что ограничения ЕС действуют на местном рынке — стоит уточнить у регулятора.",
  regWhat: "Что делать", regDo: "Проверьте, содержит ли рецептура D4 / D5 / D6 как компонент или остаток, и подберите подходящую альтернативу без циклических силоксанов. Мы помогаем подобрать и испытать.",
  allIndustries: "Все отрасли", allProducts: "Все продукты", updated: "Обновлено", about: "О Sapirim", aboutText: "Sapirim около 35 лет работает в сфере промышленных силиконов в Израиле и сегодня продвигает продукты Silitex S.r.l. (Италия).",
  disclaimer: "Информация основана на каталогах и описаниях производителя. Пригодность для процесса требует испытаний.", lang: "Язык",
};
const DICT: Record<PLang, D> = { he, en, ru };
export const pt = (l: PLang, k: string) => DICT[l][k] ?? DICT.en[k] ?? k;
