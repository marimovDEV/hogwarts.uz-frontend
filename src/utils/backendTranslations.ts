import i18n from '../i18n';

/**
 * Translation mapping for backend data that comes only in Uzbek
 * This is a temporary solution until backend supports multi-language fields
 */
const BACKEND_TRANSLATIONS: Record<string, { uz: string; ru: string }> = {
    // Lesson titles
    "Ko'phadlar va ularning xossalari": {
        uz: "Ko'phadlar va ularning xossalari",
        ru: "Многочлены и их свойства"
    },

    // Profession descriptions
    "Kasb tanlanmagan": {
        uz: "Kasb tanlanmagan",
        ru: "Профессия не выбрана"
    },
    "O'zingizga mos kasbni tanlang va biz sizga o'rganish yo'l xaritasini tuzib beramiz.": {
        uz: "O'zingizga mos kasbni tanlang va biz sizga o'rganish yo'l xaritasini tuzib beramiz.",
        ru: "Выберите подходящую профессию, и мы составим для вас дорожную карту обучения."
    },
    "Barcha kasblarni ko'rish": {
        uz: "Barcha kasblarni ko'rish",
        ru: "Посмотреть все профессии"
    },

    // Course/Lesson related
    "Matematika: Olimpiada Master": {
        uz: "Matematika: Olimpiada Master",
        ru: "Математика: Олимпиада Мастер"
    },

    // Add more translations as needed
};

/**
 * Translates backend text based on current language
 * @param text - The text in Uzbek from backend
 * @returns Translated text based on current language, or original if no translation found
 */
export const translateBackendText = (text: string | null | undefined): string => {
    if (!text) return '';

    const currentLang = i18n.language || 'uz';
    const translation = BACKEND_TRANSLATIONS[text];

    if (translation) {
        return currentLang === 'ru' ? translation.ru : translation.uz;
    }

    // Return original text if no translation found
    return text;
};

/**
 * Helper to add new translations dynamically (for development)
 */
export const addBackendTranslation = (uzText: string, ruText: string) => {
    BACKEND_TRANSLATIONS[uzText] = { uz: uzText, ru: ruText };
};
