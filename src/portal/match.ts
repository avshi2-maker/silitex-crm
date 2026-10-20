// match.ts (src/portal/match.ts) · created 20.10.2026 18:30 (Asia/Jerusalem) — FREE MATCH REPORT (lead magnet): texts he / en / ru / it, portal-industry → CRM-industry map, validators shared by the public form.
import type { PLang } from "./config";
export const MT: Record<string, Record<PLang, string>> = {
  nav: { he: "🎁 דוח התאמה חינם", en: "🎁 Free match report", ru: "🎁 Бесплатный отчёт", it: "🎁 Report gratuito" },
  title: { he: "דוח התאמה חינם לפס הייצור שלכם", en: "A free match report for your production", ru: "Бесплатный отчёт о подборе для вашего производства", it: "Un report di abbinamento gratuito per la vostra produzione" },
  intro: { he: "השאירו את כתובת האתר של החברה. מערכת ה-AI שלנו קוראת את האתר, מזהה אילו מוצרים אתם מייצרים ואיפה סיליקונים (ותוספים ללא סיליקון) משמשים בתהליך — ואבשי, 35 שנה בסיליקונים לתעשייה, עובר על התוצאה ושולח לכם דוח אישי עם המוצרים המתאימים מ-Silitex. בלי עלות ובלי התחייבות.", en: "Leave your company website. Our AI reads it, identifies what you produce and where silicones (and silicone-free additives) are used in your process — then Avshi, 35 years in industrial silicones, reviews the result and sends you a personal report with the matching Silitex products. Free, no commitment.", ru: "Оставьте адрес сайта компании. Наш AI изучит его, определит, что вы производите и где в процессе применяются силиконы (и добавки без силикона), а Авши — 35 лет в промышленных силиконах — проверит результат и пришлёт персональный отчёт с подходящими продуктами Silitex. Бесплатно и без обязательств.", it: "Lasciateci il sito della vostra azienda. La nostra AI lo legge, individua cosa producete e dove nel processo si usano siliconi (e additivi senza silicone) — poi Avshi, 35 anni nei siliconi industriali, verifica il risultato e vi invia un report personale con i prodotti Silitex adatti. Gratis e senza impegno." },
  steps: { he: "1. משאירים אתר · 2. ה-AI מנתח · 3. אבשי בודק אישית · 4. הדוח אצלכם במייל תוך 2 ימי עסקים", en: "1. Leave your website · 2. AI analyses · 3. Avshi reviews personally · 4. The report reaches your inbox within 2 business days", ru: "1. Оставьте сайт · 2. AI анализирует · 3. Авши проверяет лично · 4. Отчёт у вас на почте в течение 2 рабочих дней", it: "1. Lasciate il sito · 2. L'AI analizza · 3. Avshi verifica di persona · 4. Il report arriva via e-mail entro 2 giorni lavorativi" },
  company: { he: "שם החברה", en: "Company", ru: "Компания", it: "Azienda" },
  website: { he: "אתר החברה", en: "Company website", ru: "Сайт компании", it: "Sito aziendale" },
  name: { he: "שם מלא", en: "Full name", ru: "Имя и фамилия", it: "Nome e cognome" },
  email: { he: "אימייל", en: "E-mail", ru: "E-mail", it: "E-mail" },
  phone: { he: "נייד", en: "Mobile", ru: "Мобильный", it: "Cellulare" },
  industry: { he: "תעשייה", en: "Industry", ru: "Отрасль", it: "Settore" },
  other: { he: "אחר", en: "Other", ru: "Другое", it: "Altro" },
  notes: { he: "מה מעניין אתכם? (לא חובה)", en: "What interests you? (optional)", ru: "Что вас интересует? (необязательно)", it: "Cosa vi interessa? (facoltativo)" },
  consent: { he: "אני מאשר/ת שאבשי ספיר (ספירים) ייצור איתי קשר לגבי הדוח.", en: "I agree that Avshi Sapir (Sapirim) may contact me about the report.", ru: "Я согласен(на), чтобы Авши Сапир (Sapirim) связался со мной по поводу отчёта.", it: "Acconsento a essere contattato da Avshi Sapir (Sapirim) in merito al report." },
  send: { he: "שלחו לי דוח התאמה", en: "Send me a match report", ru: "Пришлите мне отчёт", it: "Inviatemi il report" },
  sending: { he: "שולח…", en: "Sending…", ru: "Отправка…", it: "Invio…" },
  ok: { he: "קיבלנו! אבשי יעבור על הניתוח וישלח אליכם את הדוח תוך 2 ימי עסקים. לשאלות דחופות: וואטסאפ 050-5231042.", en: "Received! Avshi will review the analysis and send you the report within 2 business days. Urgent? WhatsApp +972-50-523-1042.", ru: "Получено! Авши проверит анализ и пришлёт отчёт в течение 2 рабочих дней. Срочно? WhatsApp +972-50-523-1042.", it: "Ricevuto! Avshi verificherà l'analisi e vi invierà il report entro 2 giorni lavorativi. Urgente? WhatsApp +972-50-523-1042." },
  err: { he: "השליחה נכשלה — נסו שוב או כתבו לנו בוואטסאפ.", en: "Sending failed — try again or message us on WhatsApp.", ru: "Не удалось отправить — попробуйте ещё раз или напишите в WhatsApp.", it: "Invio non riuscito — riprovate o scriveteci su WhatsApp." },
  badWeb: { he: "כתובת אתר לא תקינה — לדוגמה www.company.co.il", en: "Invalid website — e.g. www.company.com", ru: "Неверный адрес сайта — например www.company.com", it: "Sito non valido — es. www.azienda.it" },
  badMail: { he: "כתובת מייל לא תקינה", en: "Invalid e-mail", ru: "Неверный e-mail", it: "E-mail non valida" },
  badPhone: { he: "נייד לא תקין — 10 ספרות, מתחיל ב-05", en: "Invalid mobile — Israeli 05X… or international +…", ru: "Неверный номер — израильский 05X… или международный +…", it: "Cellulare non valido — israeliano 05X… o internazionale +…" },
  privacy: { he: "האתר שלכם נקרא פעם אחת לצורך הדוח בלבד. לא נשתף את הפרטים עם אף אחד.", en: "Your website is read once, only for the report. We never share your details.", ru: "Ваш сайт читается один раз — только для отчёта. Мы не передаём ваши данные.", it: "Il vostro sito viene letto una sola volta, solo per il report. Non condividiamo i vostri dati." },
};
export const WEB_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;
export const MAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
export const PHONE_RE = /^(?:(?:\+?972|0)5\d{8}|\+\d{8,15})$/;
export const cleanPhone = (s: string) => s.replace(/[\s\-()]/g, "");
export const normWeb = (s: string) => { const t = s.trim(); return /^https?:\/\//i.test(t) ? t : "https://" + t; };
/** portal industry key → CRM industry name (scanner sector choice) */
export const CRM_INDUSTRY: Record<string, string> = { water: "Water Treatment & Purification", agro: "Agriculture & Agrochemicals", textile: "Textiles & Technical Fabrics", paper: "Paper & Packaging", paint: "Paints, Coatings & Varnishes", clean: "Detergents & Cleaning Formulations", build: "Water Repellents & Building Protection", plastic: "Rubber & Plastics Processing", auto: "Car Care & Ceramic Coatings", cosm: "Personal Care & Cosmetics", metal: "Metalworking & Machining" };
