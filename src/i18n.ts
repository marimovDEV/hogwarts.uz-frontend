import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uzTranslation from './locales/uz.json';
import ruTranslation from './locales/ru.json';

// Initialize i18next with proper configuration
// Default language is always Uzbek unless user explicitly changes it (Force Refresh)
i18n
    .use(initReactI18next)
    .init({
        resources: {
            uz: {
                translation: uzTranslation
            },
            ru: {
                translation: ruTranslation
            }
        },
        lng: localStorage.getItem('i18nextLng') || 'uz', // Always default to Uzbek for new users
        fallbackLng: 'uz',
        supportedLngs: ['uz', 'ru'],
        debug: false,
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        },
        // Ensure translations are loaded
        partialBundledLanguages: true,
        load: 'languageOnly'
    });

export default i18n;
