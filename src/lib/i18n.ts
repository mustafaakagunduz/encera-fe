import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Çeviri dosyalarını doğrudan import ediyoruz
import trTranslations from '../../public/locales/tr.json';
import enTranslations from '../../public/locales/en.json';

const resources = {
    tr: {
        translation: trTranslations
    },
    en: {
        translation: enTranslations
    }
};

// i18n'i sadece bir kere initialize et
const initializeI18n = () => {
    if (!i18n.isInitialized) {
        i18n
            .use(initReactI18next)
            .init({
                debug: process.env.NODE_ENV === 'development',
                fallbackLng: 'tr',
                lng: 'tr',
                resources,

                interpolation: {
                    escapeValue: false,
                },

                react: {
                    useSuspense: false,
                },

                // Client-side için ayarlar
                detection: {
                    order: ['localStorage', 'navigator'],
                    caches: ['localStorage'],
                },
            });
    }
    return i18n;
};

export default initializeI18n();