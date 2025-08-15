'use client';

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

if (!i18n.isInitialized) {
    i18n
        .use(initReactI18next)
        .init({
            debug: false,
            fallbackLng: 'tr',
            lng: 'tr', // Default language olarak tr ayarlayalım
            resources,

            interpolation: {
                escapeValue: false,
            },

            react: {
                useSuspense: false,
            },
        });
}

export default i18n;